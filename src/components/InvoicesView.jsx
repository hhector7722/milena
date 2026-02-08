import React, { useState, useEffect, useRef } from 'react'
import { Search, Filter, Calendar, User, FileText, ChevronRight, X, Download, Send, Loader2, Archive, Trash2 } from 'lucide-react'
import { MonthlyArchiveModal } from './MonthlyArchiveModal'

export const InvoicesView = ({ isOpen, onClose, fetchInvoicesWithClients, onDeleteInvoice }) => {
    const [invoices, setInvoices] = useState([])
    const [filteredInvoices, setFilteredInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [showFilterPopup, setShowFilterPopup] = useState(false)
    const [showArchiveModal, setShowArchiveModal] = useState(false)
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        clientName: ''
    })
    const filterPopupRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterPopupRef.current && !filterPopupRef.current.contains(event.target)) {
                setShowFilterPopup(false)
            }
        }

        if (showFilterPopup) {
            document.addEventListener('mousedown', handleClickOutside)
        } else {
            document.removeEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showFilterPopup])

    useEffect(() => {
        if (isOpen) {
            loadInvoices()
        }
    }, [isOpen])

    const loadInvoices = async () => {
        setLoading(true)
        const data = await fetchInvoicesWithClients()
        setInvoices(data)
        setFilteredInvoices(data)
        setLoading(false)
    }

    useEffect(() => {
        let result = invoices
        if (filters.startDate) {
            result = result.filter(inv => inv.fecha_emision >= filters.startDate)
        }
        if (filters.endDate) {
            result = result.filter(inv => inv.fecha_emision <= filters.endDate)
        }
        if (filters.clientName) {
            const search = filters.clientName.toLowerCase()
            result = result.filter(inv => {
                const client = inv.clientes || {}
                return (client.nombre_propietario?.toLowerCase().includes(search) ||
                    client.nombre_perros?.toLowerCase().includes(search) ||
                    client.raon_social?.toLowerCase().includes(search))
            })
        }
        setFilteredInvoices(result)
    }, [filters, invoices])

    const isFilterActive = filters.startDate || filters.endDate || filters.clientName

    const clearFilters = () => {
        setFilters({ startDate: '', endDate: '', clientName: '' })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[150] bg-[#2F5468] flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <header className="px-6 py-4 sm:px-10 sm:py-6 bg-[#2F5468] border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all active:scale-95">
                        <X className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">Gestió de Factures</h2>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Historial Global i Arxius</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowArchiveModal(true)}
                        className="bg-accent text-white px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 hover:scale-105 transition-all bg-[#D37665]"
                    >
                        <Archive className="w-4 h-4" />
                        <span className="hidden sm:inline">Arxiu Mensual</span>
                    </button>

                    <div className="relative" ref={filterPopupRef}>
                        <button
                            onClick={() => isFilterActive ? clearFilters() : setShowFilterPopup(!showFilterPopup)}
                            className={`p-3 rounded-2xl transition-all shadow-lg active:scale-95 border border-white/10 ${isFilterActive ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            {isFilterActive ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
                        </button>

                        {showFilterPopup && (
                            <div className="absolute right-0 mt-3 w-72 bg-white rounded-[32px] shadow-2xl p-6 z-[160] animate-in slide-in-from-top-4 duration-300 border border-gray-100">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Filtrar Factures</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Client / Gos</label>
                                        <input
                                            type="text"
                                            value={filters.clientName}
                                            onChange={(e) => setFilters(prev => ({ ...prev, clientName: e.target.value }))}
                                            placeholder="Buscar per nom..."
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-4 text-xs font-bold text-gray-900 outline-none focus:border-[#2F5468]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Des de</label>
                                            <input
                                                type="date"
                                                value={filters.startDate}
                                                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-[10px] font-bold text-gray-900 outline-none focus:border-[#2F5468]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Fins a</label>
                                            <input
                                                type="date"
                                                value={filters.endDate}
                                                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-[10px] font-bold text-gray-900 outline-none focus:border-[#2F5468]"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowFilterPopup(false)}
                                        className="w-full bg-[#2F5468] text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest mt-2 shadow-lg"
                                    >
                                        Aplicar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-10 sm:py-10 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <Loader2 className="w-10 h-10 text-white/20 animate-spin" />
                        <p className="text-white/20 font-black uppercase text-xs tracking-widest">Carregant factures...</p>
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white/5 rounded-[40px] border border-white/5 border-dashed">
                        <FileText className="w-12 h-12 text-white/10 mb-4" />
                        <p className="text-white/40 font-black uppercase text-[10px] tracking-[0.2em]">No s'han trobat factures</p>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto space-y-3">
                        {filteredInvoices.map((inv) => (
                            <div key={inv.id} className="group relative">
                                <a
                                    href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/invoices/${inv.pdf_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 sm:p-6 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-[28px] transition-all shadow-xl backdrop-blur-sm pr-16"
                                >
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:bg-white group-hover:text-[#2F5468] transition-all duration-500">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[9px] font-black text-[#D37665] uppercase tracking-widest bg-[#D37665]/10 px-2 py-0.5 rounded-lg border border-[#D37665]/20">
                                                    #{inv.num_factura}
                                                </span>
                                                <p className="text-sm font-black text-white">{inv.clientes?.nombre_propietario} ({inv.clientes?.nombre_perros})</p>
                                            </div>
                                            <p className="text-xs font-bold text-white/60">{inv.concepto}</p>
                                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">
                                                {new Date(inv.fecha_emision).toLocaleDateString('ca-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-white">{inv.monto?.toFixed(2)}€</p>
                                        {inv.amb_irpf && <p className="text-[8px] font-bold text-red-400 uppercase tracking-widest">Amb IRPF</p>}
                                    </div>
                                </a>
                                <button
                                    onClick={async (e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (window.confirm('Estàs segur que vols eliminar aquesta factura?')) {
                                            const result = await onDeleteInvoice(inv.id, inv.pdf_url)
                                            if (result.success) {
                                                loadInvoices()
                                            } else {
                                                alert('Error en eliminar la factura: ' + result.error)
                                            }
                                        }
                                    }}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all active:scale-95 z-[155]"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <MonthlyArchiveModal
                isOpen={showArchiveModal}
                onClose={() => setShowArchiveModal(false)}
                invoices={invoices}
            />
        </div>
    )
}
