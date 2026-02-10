import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useClients = (searchTerm = '') => {
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchClients = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('clientes')
                .select('*')
                .order('ultimo_servicio', { ascending: false })

            if (searchTerm) {
                query = query.or(`nombre_propietario.ilike.%${searchTerm}%,nombre_perros.ilike.%${searchTerm}%`)
            }

            const { data, error } = await query

            if (error) throw error
            setClients(data || [])
        } catch (error) {
            console.error('Error en carregar els clients:', error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClients()
    }, [searchTerm])

    const saveClient = async (clientData) => {
        console.log('Intentant desar client:', clientData)
        try {
            const { data, error } = await supabase
                .from('clientes')
                .upsert(clientData)
                .select()

            if (error) {
                console.error('Error de Supabase en upsert:', error)
                throw error
            }
            console.log('Client desat correctament:', data[0])
            fetchClients()
            return { success: true, data: data[0] }
        } catch (error) {
            console.error('Error en saveClient:', error.message)
            return { success: false, error: error.message }
        }
    }

    const saveInvoice = async (clientId, invoiceData, pdfBlob) => {
        try {
            // 1. Upload PDF to Storage
            const invoiceDate = new Date(invoiceData.fecha)
            const year = invoiceDate.getFullYear()
            const month = String(invoiceDate.getMonth() + 1).padStart(2, '0')

            // Format: invoices/2026/02/invoice_25-001_1707600000.pdf
            const fileName = `${year}/${month}/invoice_${invoiceData.numFactura}_${Date.now()}.pdf`

            const { data: storageData, error: storageError } = await supabase.storage
                .from('invoices')
                .upload(fileName, pdfBlob)

            if (storageError) throw storageError

            const pdfUrl = storageData.path

            // 2. Create Invoice record
            const { error: invoiceError } = await supabase
                .from('facturas')
                .insert({
                    cliente_id: clientId,
                    monto: invoiceData.items.reduce((acc, item) => acc + (parseFloat(item.precio) * parseFloat(item.cantidad) || 0), 0),
                    concepto: invoiceData.items[0]?.concepto || 'Servei Caní',
                    items: invoiceData.items,
                    pdf_url: pdfUrl,
                    num_factura: invoiceData.numFactura,
                    amb_irpf: invoiceData.ambIRPF || false,
                    fecha_emision: invoiceData.fecha
                })

            if (invoiceError) throw invoiceError

            // 3. Update Client last service date
            const { error: clientError } = await supabase
                .from('clientes')
                .update({ ultimo_servicio: invoiceDate.toISOString() })
                .eq('id', clientId)

            if (clientError) throw clientError

            fetchClients()
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const uploadClientFile = async (clientId, file) => {
        try {
            // 1. Upload to Storage
            const fileName = `docs/${clientId}/${Date.now()}_${file.name}`
            const { data: storageData, error: storageError } = await supabase.storage
                .from('invoices')
                .upload(fileName, file)

            if (storageError) throw storageError

            // 2. Get current files and update
            const { data: client, error: fetchError } = await supabase
                .from('clientes')
                .select('invoice_files')
                .eq('id', clientId)
                .single()

            if (fetchError) throw fetchError

            const newFile = {
                name: file.name,
                url: storageData.path,
                date: new Date().toISOString()
            }

            const currentFiles = client.invoice_files || []
            const { error: updateError } = await supabase
                .from('clientes')
                .update({ invoice_files: [...currentFiles, newFile] })
                .eq('id', clientId)

            if (updateError) throw updateError

            fetchClients()
            return { success: true, path: storageData.path }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const deleteClient = async (clientId) => {
        try {
            const { error } = await supabase
                .from('clientes')
                .delete()
                .eq('id', clientId)

            if (error) throw error
            fetchClients()
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const fetchInvoices = async (clientId) => {
        try {
            const { data, error } = await supabase
                .from('facturas')
                .select('*')
                .eq('cliente_id', clientId)
                .order('fecha_emision', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error fetching invoices:', error.message)
            return []
        }
    }

    const deleteInvoice = async (invoiceId, pdfPath) => {
        try {
            // 1. Delete from Storage
            if (pdfPath) {
                const { error: storageError } = await supabase.storage
                    .from('invoices')
                    .remove([pdfPath])
                if (storageError) console.error('Error deleting PDF from storage:', storageError)
            }

            // 2. Delete from Database
            const { error } = await supabase
                .from('facturas')
                .delete()
                .eq('id', invoiceId)

            if (error) throw error
            return { success: true }
        } catch (error) {
            console.error('Error deleting invoice:', error.message)
            return { success: false, error: error.message }
        }
    }

    const getLatestInvoiceNumber = async () => {
        try {
            const currentYear = new Date().getFullYear().toString().slice(-2)
            const { data, error } = await supabase
                .from('facturas')
                .select('num_factura')
                .like('num_factura', `${currentYear}-%`)
                .order('num_factura', { ascending: false })
                .limit(1)

            if (error) throw error
            return data[0]?.num_factura || null
        } catch (error) {
            console.error('Error fetching latest invoice number:', error.message)
            return null
        }
    }

    const fetchInvoicesWithClients = async () => {
        try {
            const { data, error } = await supabase
                .from('facturas')
                .select(`
                    *,
                    clientes (
                        nombre_propietario,
                        nombre_perros,
                        raon_social,
                        dni_nif,
                        direccion
                    )
                `)
                .order('fecha_emision', { ascending: false })

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error fetching invoices with clients:', error.message)
            return []
        }
    }

    return {
        clients,
        loading,
        saveClient,
        saveInvoice,
        uploadClientFile,
        deleteClient,
        deleteInvoice,
        fetchInvoices,
        fetchInvoicesWithClients,
        getLatestInvoiceNumber
    }
}
