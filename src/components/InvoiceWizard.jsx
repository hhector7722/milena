import React, { useState, useEffect, useRef } from 'react'
import { X, Check, FileText, Loader2, Save, Send, Download, Plus, Trash2, Calendar, User, MapPin, Hash, Scissors } from 'lucide-react'
import { generateInvoicePDF } from '../utils/invoiceGenerator'
import { AnimatedTrasto } from './AnimatedTrasto'

export const InvoiceWizard = ({ isOpen, onClose, onComplete, client, onEmit, getLatestInvoiceNumber }) => {
    const [step, setStep] = useState(1) // 1: Edit/Preview, 2: Success
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedBlob, setGeneratedBlob] = useState(null)
    const [blobUrl, setBlobUrl] = useState(null)
    const [mobileView, setMobileView] = useState('edit') // 'edit' or 'preview'


    const [invoiceData, setInvoiceData] = useState({
        fecha: new Date().toISOString().split('T')[0],
        numFactura: '',
        ambIRPF: false,
        items: [
            { id: Date.now(), concepto: '', precio: '', cantidad: '' }
        ]
    })

    useEffect(() => {
        const fetchNextNumber = async () => {
            const latest = await getLatestInvoiceNumber()
            const year = new Date().getFullYear().toString().slice(-2)
            let nextNumber = '001'

            if (latest) {
                const parts = latest.split('-')
                if (parts.length === 2 && parts[0] === year) {
                    const currentNum = parseInt(parts[1])
                    nextNumber = (currentNum + 1).toString().padStart(3, '0')
                }
            }

            setInvoiceData(prev => ({
                ...prev,
                numFactura: `${year}-${nextNumber}`
            }))
        }
        fetchNextNumber()
    }, [getLatestInvoiceNumber])

    // Pre-filled data from client
    const clientInfo = {
        nombre: client?.raon_social || client?.nombre_propietario || '',
        propietario: client?.nombre_propietario || '',
        dni: client?.dni_nif || '',
        direccion: client?.direccion || '',
        perros: client?.nombre_perros || ''
    }

    useEffect(() => {
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl)
        }
    }, [blobUrl])

    const updateItem = (id, field, value) => {
        setInvoiceData(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
        }))
    }

    const addItem = () => {
        setInvoiceData(prev => ({
            ...prev,
            items: [...prev.items, { id: Date.now(), concepto: '', precio: '0.00', cantidad: '1' }]
        }))
    }

    const removeItem = (id) => {
        if (invoiceData.items.length <= 1) return
        setInvoiceData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }))
    }

    const calculateSubtotal = () => {
        return invoiceData.items.reduce((acc, item) => acc + (parseFloat(item.precio) * parseFloat(item.cantidad) || 0), 0)
    }

    const subtotal = calculateSubtotal()
    const iva = subtotal * 0.21
    const irpf = invoiceData.ambIRPF ? subtotal * 0.15 : 0
    const total = subtotal + iva - irpf

    const handleSave = async () => {
        setIsGenerating(true)
        try {
            const pdfBlob = await generateInvoicePDF(client, invoiceData)
            const result = await onEmit(invoiceData, pdfBlob)

            if (result && result.success) {
                const url = URL.createObjectURL(pdfBlob)
                setBlobUrl(url)
                setGeneratedBlob(pdfBlob)
                setStep(2)
            }
            else if (result && result.error) {
                alert('Error al guardar la factura: ' + result.error)
            }
        } catch (error) {
            console.error('Error in handleSave:', error)
            alert('Error al generar la factura.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDownload = () => {
        if (!blobUrl) return
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `Factura_${invoiceData.numFactura}.pdf`
        link.click()
    }

    const handleShare = async () => {
        if (!generatedBlob) return
        try {
            const file = new File([generatedBlob], `Factura_${invoiceData.numFactura}.pdf`, { type: 'application/pdf' })
            if (navigator.share) {
                await navigator.share({
                    files: [file],
                    title: 'Factura Gestió Canina',
                    text: `Factura de ${clientInfo.perros}`
                })
            } else {
                alert('La funció de compartir no és compatible. Baixa el PDF per enviar-lo.')
            }
        } catch (err) {
            console.error('Error sharing:', err)
        }
    }

    if (!isOpen) return null

    return (
        <div className={`fixed inset-0 z-[200] flex flex-col ${step === 2 ? 'bg-[#295773]' : 'bg-[#265471]/90 backdrop-blur-2xl'} animate-in fade-in duration-300`}>
            {/* Background Click to Close (Outside cards) */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Header Area */}
            {step !== 2 && (
                <div className="relative z-10 flex items-center justify-between p-3 sm:p-4 lg:p-8 shrink-0 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 shadow-lg active:scale-95"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <div className="hidden sm:block">
                            <h3 className="text-2xl font-black text-white leading-none">Nova Factura</h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Gestió i Emissió Directa</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {step === 1 && (
                            <button
                                onClick={handleSave}
                                disabled={isGenerating}
                                className="bg-white text-[#265471] px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-[0_20px_40px_rgba(0,0,0,0.2)] flex items-center gap-2 sm:gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Save className="w-4 h-4 sm:w-5 sm:h-5" />}
                                <span className="hidden sm:inline">Desar Factura</span>
                                <span className="sm:hidden">Desar</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Mobile Switcher Row - Centered between Header and Content */}
            {step === 1 && (
                <div className="lg:hidden flex flex-col items-center gap-3 py-4 z-20">
                    <div
                        onClick={() => setMobileView(mobileView === 'edit' ? 'preview' : 'edit')}
                        className="bg-black/20 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-inner cursor-pointer relative w-[180px] h-[44px] flex items-center"
                    >
                        <div className={`absolute h-[36px] w-[86px] bg-white rounded-xl shadow-lg transition-all duration-300 transform ${mobileView === 'edit' ? 'translate-x-[2px]' : 'translate-x-[88px]'}`} />
                        <div className={`relative z-10 w-full flex justify-around text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${mobileView === 'edit' ? 'text-[#265471]' : 'text-white/40'}`}>EDITAR</div>
                        <div className={`relative z-10 w-full flex justify-around text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${mobileView === 'preview' ? 'text-[#265471]' : 'text-white/40'}`}>VISTA</div>
                    </div>
                    <p className="text-[10px] text-white font-black uppercase tracking-widest animate-pulse">Click per veure factura</p>
                </div>
            )
            }

            {/* Main Content Area */}
            <div className="relative flex-1 overflow-hidden z-10">
                {step === 1 ? (
                    <div className="h-full flex flex-col lg:flex-row p-4 lg:p-10 gap-8 justify-center overflow-hidden">

                        {/* 1. FLOATING EDITOR SECTIONS (Flattened) */}
                        <div className={`w-full lg:w-[400px] flex-1 min-h-0 flex flex-col gap-4 sm:gap-6 overflow-y-auto custom-scrollbar shrink-0 transition-all duration-500
                            ${mobileView === 'edit' ? 'flex animate-in slide-in-from-left-8' : 'hidden lg:flex'}`}>

                            {/* Floating IRPF Toggle */}
                            <div className="space-y-1 sm:space-y-2 mb-2">
                                <label className="text-[8px] sm:text-[9px] font-black text-white/60 uppercase tracking-widest ml-1">Tipus de Factura</label>
                                <div className="flex bg-white/5 p-1 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-md">
                                    <button
                                        onClick={() => setInvoiceData(prev => ({ ...prev, ambIRPF: false }))}
                                        className={`flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase transition-all ${!invoiceData.ambIRPF ? 'bg-white text-[#265471] shadow-lg' : 'text-white/40 hover:text-white'}`}
                                    >
                                        Sense IRPF
                                    </button>
                                    <button
                                        onClick={() => setInvoiceData(prev => ({ ...prev, ambIRPF: true }))}
                                        className={`flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase transition-all ${invoiceData.ambIRPF ? 'bg-white text-[#265471] shadow-lg' : 'text-white/40 hover:text-white'}`}
                                    >
                                        Amb IRPF
                                    </button>
                                </div>
                            </div>

                            <section className="space-y-2 sm:space-y-3 bg-[#265471] p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] shadow-xl border border-white/10">
                                <h4 className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-[0.2em] border-b border-white/5 pb-2 sm:pb-3">Dades Generals</h4>

                                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5 mt-4">
                                    <div className="space-y-1 sm:space-y-2">
                                        <label className="text-[8px] sm:text-[9px] font-black text-white uppercase ml-1">Data</label>
                                        <input
                                            type="date"
                                            value={invoiceData.fecha}
                                            onChange={(e) => setInvoiceData(prev => ({ ...prev, fecha: e.target.value }))}
                                            className="w-full bg-white border border-gray-100 rounded-xl sm:rounded-2xl h-[32px] sm:h-auto py-1.5 sm:py-2.5 px-4 sm:px-5 text-xs sm:text-sm font-black text-gray-900 focus:border-[#265471] outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1 sm:space-y-2">
                                        <label className="text-[8px] sm:text-[9px] font-black text-white uppercase ml-1">Factura</label>
                                        <input
                                            type="text"
                                            value={invoiceData.numFactura}
                                            onChange={(e) => setInvoiceData(prev => ({ ...prev, numFactura: e.target.value }))}
                                            className="w-full bg-white border border-gray-100 rounded-xl sm:rounded-2xl h-[32px] sm:h-auto py-1.5 sm:py-2.5 px-4 sm:px-5 text-xs sm:text-sm font-black text-gray-900 focus:border-[#265471] outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3 sm:space-y-4 bg-[#265471] p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] shadow-xl border border-white/10">
                                <div className="flex items-center justify-between border-b border-white/5 pb-2 sm:pb-3">
                                    <h4 className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-[0.2em]">Serveis</h4>
                                    <button onClick={addItem} className="text-[8px] sm:text-[9px] font-black text-white bg-[#265471] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl hover:opacity-80 transition-all active:scale-90 flex items-center gap-1">
                                        <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> AFEGIR
                                    </button>
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                    {invoiceData.items.map((item) => (
                                        <div key={item.id} className="p-3 sm:p-4 bg-white/5 rounded-[20px] sm:rounded-[24px] border border-white/10 space-y-2 sm:space-y-3 relative group">
                                            {invoiceData.items.length > 1 && (
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="absolute -top-1.5 -right-1.5 w-7 h-7 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all z-10"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                </button>
                                            )}
                                            <input
                                                placeholder="Descripció del servei..."
                                                value={item.concepto}
                                                onChange={(e) => updateItem(item.id, 'concepto', e.target.value)}
                                                className="w-full bg-white border border-gray-100 rounded-lg sm:rounded-xl py-1.5 sm:py-2 px-3 sm:px-4 text-[10px] sm:text-xs font-black text-gray-900 outline-none focus:border-[#265471] shadow-sm"
                                            />
                                            <div className="flex gap-2 sm:gap-3">
                                                <div className="flex-1">
                                                    <input
                                                        type="number"
                                                        value={item.cantidad}
                                                        onChange={(e) => updateItem(item.id, 'cantidad', e.target.value)}
                                                        className="w-full bg-white border border-gray-100 rounded-lg sm:rounded-xl py-1.5 sm:py-2 px-2 text-[10px] sm:text-xs font-black text-gray-900 outline-none text-center focus:border-[#265471] shadow-sm"
                                                        placeholder="Quantitat"
                                                    />
                                                </div>
                                                <div className="flex-[2] relative">
                                                    <input
                                                        type="text"
                                                        value={item.precio}
                                                        onChange={(e) => updateItem(item.id, 'precio', e.target.value)}
                                                        className="w-full bg-white border border-gray-100 rounded-lg sm:rounded-xl py-1.5 sm:py-2 pl-3 sm:pl-4 pr-7 sm:pr-8 text-[10px] sm:text-xs font-black text-gray-900 outline-none text-right focus:border-[#265471] shadow-sm"
                                                        placeholder="Preu"
                                                    />
                                                    <span className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-black text-white/40">€</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* 2. SEAMLESS PREVIEW - POSITIONED TOP & OPTIMIZED SCALE */}
                        <div className={`flex-1 h-full w-full flex items-start justify-center overflow-hidden py-1 sm:py-2 lg:py-2
                            ${mobileView === 'preview' ? 'flex animate-in slide-in-from-right-8' : 'hidden lg:flex'}`}>

                            <div className="w-[750px] aspect-[21/29.7] shrink-0 transform origin-top scale-[0.44] xs:scale-[0.48] sm:scale-[0.62] lg:scale-[0.62] transition-all duration-700">
                                <div className="h-full w-full p-8 sm:p-14 flex flex-col bg-white shadow-2xl lg:shadow-none lg:rounded-none rounded-sm">
                                    {/* Virtual Invoice Header */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-3xl font-black text-[#265471]">Milena González</h2>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Factura</div>
                                            <div className="text-sm font-bold text-gray-900"># {invoiceData.numFactura}</div>
                                            <div className="text-sm font-medium text-gray-500 mt-1">{new Date(invoiceData.fecha).toLocaleDateString('ca-ES')}</div>
                                        </div>
                                    </div>

                                    <div className="h-[2px] bg-[#295773] my-10" />

                                    {/* Addresses Area */}
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">DE:</div>
                                            <div className="space-y-1">
                                                <div className="text-sm font-black text-gray-900">Milena González Villacampa</div>
                                                <div className="text-xs text-gray-500">NIF 46355789W</div>
                                                <div className="text-xs text-gray-500">Travessera de Gràcia, 421, 5-1</div>
                                                <div className="text-xs text-gray-500">08025 Barcelona</div>
                                            </div>
                                        </div>
                                        <div className="space-y-4 text-right">
                                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">PER A:</div>
                                            <div className="space-y-1">
                                                <div className="text-sm font-black text-gray-900">{clientInfo.nombre}</div>
                                                {client?.raon_social && client?.nombre_propietario && (
                                                    <div className="text-xs text-gray-500">Attn: {client.nombre_propietario}</div>
                                                )}
                                                {clientInfo.dni && <div className="text-xs text-gray-500">NIF: {clientInfo.dni}</div>}
                                                {clientInfo.direccion && (
                                                    <div className="text-xs text-gray-500 whitespace-pre-wrap max-w-[200px] ml-auto">
                                                        {clientInfo.direccion}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <div className="mt-10">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b-2 border-gray-100">
                                                    <th className="py-3 text-[10px] font-black text-[#265471] uppercase tracking-wider text-left">Concepte</th>
                                                    <th className="py-3 text-[10px] font-black text-[#265471] uppercase tracking-wider text-center">Quantitat</th>
                                                    <th className="py-3 text-[10px] font-black text-[#265471] uppercase tracking-wider text-right">Preu</th>
                                                    <th className="py-3 text-[10px] font-black text-[#265471] uppercase tracking-wider text-right">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50/50">
                                                {invoiceData.items.filter(item => item.concepto || item.precio || item.cantidad).map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="py-3 text-[11px] font-semibold text-gray-900">{item.concepto || 'Sense descripció'}</td>
                                                        <td className="py-3 text-[11px] text-gray-600 text-center">{item.cantidad || '0'}</td>
                                                        <td className="py-3 text-[11px] text-gray-600 text-right">{parseFloat(item.precio || 0).toFixed(2)}€</td>
                                                        <td className="py-3 text-[11px] font-black text-[#265471] text-right">{(parseFloat(item.precio || 0) * parseFloat(item.cantidad || 0)).toFixed(2)}€</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Totals Section */}
                                    <div className="flex justify-end pt-8 mt-10">
                                        <div className="w-64 space-y-2">
                                            <div className="flex justify-between text-[11px] text-gray-500 font-bold">
                                                <span>BASE IMPONIBLE:</span>
                                                <span>{subtotal.toFixed(2)}€</span>
                                            </div>
                                            <div className="flex justify-between text-[11px] text-gray-500 font-bold">
                                                <span>IVA (21%):</span>
                                                <span>{iva.toFixed(2)}€</span>
                                            </div>
                                            {invoiceData.ambIRPF && (
                                                <div className="flex justify-between text-[11px] text-gray-500 font-bold">
                                                    <span>IRPF (-15%):</span>
                                                    <span>-{irpf.toFixed(2)}€</span>
                                                </div>
                                            )}
                                            <div className="h-[1.5px] bg-black mt-4 mb-2" />
                                            <div className="flex justify-between text-xl font-black text-gray-900">
                                                <span>TOTAL:</span>
                                                <span>{total.toFixed(2)}€</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center mt-auto pb-6">
                                        <p className="text-[11px] text-gray-300 italic">Gràcies per la teva confiança.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Slide Indicator */}
                        <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                            <div className={`h-1.5 rounded-full transition-all duration-300 ${mobileView === 'edit' ? 'bg-white w-8' : 'bg-white/30 w-2'}`} />
                            <div className={`h-1.5 rounded-full transition-all duration-300 ${mobileView === 'preview' ? 'bg-white w-8' : 'bg-white/30 w-2'}`} />
                        </div>
                    </div>
                ) : (
                    /* SUCCESS SCREEN - Post Save */
                    <div className="h-full flex items-center justify-center p-8 overflow-hidden">
                        <div className="w-full max-w-2xl text-center animate-in zoom-in-95 duration-700">
                            <div className="w-48 h-48 mb-12 mx-auto relative group">
                                <AnimatedTrasto className="w-48 h-48" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16">
                                <button
                                    onClick={onComplete || onClose}
                                    className="flex flex-col items-center gap-4 group"
                                >
                                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-[#265471] group-hover:bg-[#265471] group-hover:text-white transition-all shadow-xl group-active:scale-90 border-2 border-white">
                                        <Check className="w-8 h-8 font-black" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Finalitzar</span>
                                </button>

                                <button
                                    onClick={handleShare}
                                    className="flex flex-col items-center gap-4 group"
                                >
                                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-[#265471] group-hover:bg-[#265471] group-hover:text-white transition-all shadow-xl group-active:scale-90 border-2 border-white">
                                        <Send className="w-8 h-8 font-black" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Compartir</span>
                                </button>

                                <button
                                    onClick={handleDownload}
                                    className="flex flex-col items-center gap-4 group"
                                >
                                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-[#265471] group-hover:bg-[#265471] group-hover:text-white transition-all shadow-xl group-active:scale-90 border-2 border-white">
                                        <Download className="w-8 h-8 font-black" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Exportar PDF</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    )
}
