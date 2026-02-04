import React, { useState, useEffect } from 'react'
import { Plus, X, Check, Save, FileText, ChevronRight, Loader2, User, Edit3, Trash2 } from 'lucide-react'
import { InvoiceWizard } from './InvoiceWizard'

// Sub-component for Avatar Selection to keep the main modal clean
const AvatarSelectorModal = ({ isOpen, onClose, currentAvatar, onSelect }) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 leading-none">Tria una icona</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Personalitza el perfil</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-4 sm:grid-cols-5 gap-4 bg-gray-50/50">
                    {Array.from({ length: 22 }, (_, i) => `dog-${i + 1}.png`).map((avatar) => (
                        <button
                            key={avatar}
                            onClick={() => { onSelect(avatar); onClose(); }}
                            className={`relative rounded-3xl aspect-square overflow-hidden border-4 transition-all hover:scale-110 active:scale-95 shadow-sm ${currentAvatar === avatar ? 'border-[#295773] bg-white ring-4 ring-[#295773]/10' : 'border-transparent hover:border-white hover:shadow-xl'}`}
                        >
                            <img src={`/avatars/${avatar}`} alt={avatar} className="w-full h-full object-cover" />
                            {currentAvatar === avatar && (
                                <div className="absolute inset-0 bg-[#295773]/10 flex items-center justify-center">
                                    <div className="bg-[#295773] rounded-full p-1 shadow-lg text-white">
                                        <Check className="w-4 h-4" />
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export const ClientModal = ({ isOpen, onClose, client, onSave, onEmitInvoice, onUploadFile, onDelete, onDeleteInvoice, fetchInvoices }) => {
    const [isInvoiceWizardOpen, setIsInvoiceWizardOpen] = useState(false)
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
    const [isSavingNewClient, setIsSavingNewClient] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showInvoiceDeleteConfirm, setShowInvoiceDeleteConfirm] = useState(null) // Stores invoice object
    const [isUploading, setIsUploading] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [invoices, setInvoices] = useState([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [formData, setFormData] = useState({
        nombre_propietario: '',
        nombre_perros: '',
        avatar: 'dog-1.png',
        direccion: '',
        raon_social: '',
        telefono: '',
        email: '',
        dni_nif: '',
        observaciones: '',
        invoice_files: []
    })

    // Sync formData when client changes
    useEffect(() => {
        if (client) {
            setFormData({
                ...client,
                raon_social: client.raon_social || '',
                direccion: client.direccion || '',
                telefono: client.telefono || '',
                email: client.email || '',
                dni_nif: client.dni_nif || '',
                observaciones: client.observaciones || '',
                invoice_files: client.invoice_files || []
            })
        } else {
            setFormData({
                nombre_propietario: '',
                nombre_perros: '',
                avatar: 'dog-1.png',
                direccion: '',
                raon_social: '',
                telefono: '',
                email: '',
                dni_nif: '',
                observaciones: '',
                invoice_files: []
            })
        }
    }, [client])

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file || !client?.id) return
        setIsUploading(true)
        const result = await onUploadFile(file)
        setIsUploading(false)
        if (result.success) {
            const newFile = { name: file.name, url: result.path, date: new Date().toISOString() }
            setFormData(prev => ({ ...prev, invoice_files: [...(prev.invoice_files || []), newFile] }))
        }
    }

    const loadHistory = async () => {
        if (!client?.id) return
        setIsLoadingHistory(true)
        const data = await fetchInvoices(client.id)
        setInvoices(data)
        setIsLoadingHistory(false)
        setShowHistory(true)
    }

    if (!isOpen) return null

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAvatarSelect = (avatar) => {
        const updatedData = { ...formData, avatar }
        setFormData(updatedData)

        // Auto-save when avatar changes for a better UX
        if (client?.id) {
            onSave(updatedData, true)
        } else if (isSavingNewClient) {
            onSave(updatedData, true)
            setIsSavingNewClient(false)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (client?.id) {
            onSave(formData)
        } else {
            setIsAvatarModalOpen(true)
            setIsSavingNewClient(true)
        }
    }

    const handleDelete = () => {
        if (client?.id) {
            onDelete(client.id)
        }
    }

    const handleDeleteInvoiceConfirm = async () => {
        if (!showInvoiceDeleteConfirm) return
        const result = await onDeleteInvoice(showInvoiceDeleteConfirm.id, showInvoiceDeleteConfirm.pdf_url)
        if (result.success) {
            setInvoices(prev => prev.filter(inv => inv.id !== showInvoiceDeleteConfirm.id))
            setShowInvoiceDeleteConfirm(null)
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 overflow-hidden">
                <div className="absolute inset-0 bg-[#1a3a4e]/70 backdrop-blur-xl transition-opacity animate-in fade-in duration-500" onClick={onClose} />

                <div className="relative w-full max-w-6xl bg-[#295773] sm:rounded-[48px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[95vh] animate-in fade-in slide-in-from-bottom-12 zoom-in-95 duration-700">

                    {/* Header Compact & Seamless - NO BORDER - RELATIVE FOR CENTERING */}
                    <div className="relative flex items-center justify-between px-4 py-1.5 sm:px-10 sm:py-3 bg-[#295773] shrink-0 z-10">
                        {/* LEFT: Avatar + Edit Button */}
                        <div className="flex items-center gap-3 sm:gap-4 z-20">
                            <div
                                onClick={() => !showHistory && setIsAvatarModalOpen(true)}
                                className={`w-8 h-8 sm:w-16 sm:h-16 ${!showHistory ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} transition-all group shrink-0 relative`}
                            >
                                {client?.id ? (
                                    <div className="w-full h-full p-0.5">
                                        <img
                                            src={`/avatars/${formData.avatar}`}
                                            alt="Gos"
                                            className="w-full h-full object-contain"
                                            style={{
                                                filter: 'drop-shadow(2px 2px 0 white) drop-shadow(-2px -2px 0 white) drop-shadow(2px -2px 0 white) drop-shadow(-2px 2px 0 white) drop-shadow(0px 3px 6px rgba(0,0,0,0.2))'
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-dashed border-white/30 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 sm:w-7 sm:h-7 text-white/50" />
                                    </div>
                                )}
                            </div>

                            {!showHistory && client?.id && (
                                <button
                                    onClick={() => setIsAvatarModalOpen(true)}
                                    className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-md active:scale-95"
                                >
                                    Editar
                                </button>
                            )}
                        </div>

                        {/* CENTER: Title Absolutely Positioned */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10">
                            <h2 className="text-lg sm:text-xl font-black text-white leading-none tracking-tight">
                                {showHistory ? 'Historial' : client?.id ? 'Fitxa Client' : 'Nou Perfil'}
                            </h2>
                            {showHistory && (
                                <p className="text-[9px] sm:text-[10px] text-white/60 font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1">
                                    {formData.nombre_perros}
                                </p>
                            )}
                        </div>

                        {/* RIGHT: Actions */}
                        <div className="flex items-center gap-2 z-20">
                            {showHistory && (
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    TORNAR
                                </button>
                            )}
                            <button onClick={onClose} className="p-2 sm:p-4 hover:bg-white/10 rounded-3xl transition-all group active:scale-90">
                                <X className="w-6 h-6 sm:w-7 sm:h-7 text-white/20 group-hover:text-white" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden px-4 pt-1 sm:px-8 sm:pt-12 sm:pb-6 flex flex-col gap-2 sm:gap-3">
                        {showHistory ? (
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 animate-in fade-in slide-in-from-right-10 duration-500">
                                {invoices.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-white/20">
                                        <FileText className="w-12 h-12 mb-2 opacity-20" />
                                        <p className="font-bold uppercase tracking-widest text-[10px]">No hi ha factures</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {invoices.map((inv) => (
                                            <div key={inv.id} className="relative group/container">
                                                <a
                                                    href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/invoices/${inv.pdf_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all gap-4 pr-16"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#295773] transition-all">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[12px] font-black text-white leading-tight">{inv.concepto || 'Sense Concepte'}</p>
                                                            <p className="text-[8px] text-white/50 font-bold uppercase tracking-widest mt-0.5">
                                                                {new Date(inv.fecha_emision).toLocaleDateString('ca-ES', { day: '2-digit', month: 'short' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-right">
                                                        <p className="text-[14px] font-black text-white">{inv.monto ? inv.monto.toFixed(2) : '0.00'}€</p>
                                                        <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white transition-all" />
                                                    </div>
                                                </a>
                                                <button
                                                    onClick={() => setShowInvoiceDeleteConfirm(inv)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 text-red-400 opacity-0 group-hover/container:opacity-100 hover:bg-red-500/10 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-hidden space-y-3">
                                    <form onSubmit={handleSubmit} className="h-full space-y-2">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                                            {/* Combined Card 1 & 2 */}
                                            <div className="bg-white/5 border border-white/10 rounded-[20px] sm:rounded-[24px] p-3 sm:p-4 shadow-xl space-y-2">
                                                <h4 className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 pb-1.5 sm:pb-2">Identitat i Contacte</h4>
                                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                                    <div className="space-y-1 col-span-2">
                                                        <label className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-widest ml-1">Propietari</label>
                                                        <input name="nombre_propietario" value={formData.nombre_propietario} onChange={handleChange} placeholder="Laura Font" className="w-full bg-white border-2 border-[#295773] rounded-xl py-1.5 sm:py-2 px-4 focus:ring-4 focus:ring-white/5 transition-all outline-none text-gray-900 font-black text-xs shadow-sm" />
                                                    </div>
                                                    <div className="space-y-1 col-span-2">
                                                        <label className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-widest ml-1">Gos / Gossos</label>
                                                        <input name="nombre_perros" value={formData.nombre_perros} onChange={handleChange} placeholder="Toby i Luna" className="w-full bg-white border-2 border-[#295773] rounded-xl py-1.5 sm:py-2 px-4 focus:ring-4 focus:ring-white/5 transition-all outline-none text-gray-900 font-black text-xs shadow-sm" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-widest ml-1">Telèfon</label>
                                                        <input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="600 000 000" className="w-full bg-white border-2 border-[#295773] rounded-xl py-1.5 sm:py-2 px-4 focus:ring-4 focus:ring-white/5 transition-all outline-none text-gray-900 font-black text-xs shadow-sm" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-widest ml-1">DNI / NIF</label>
                                                        <input name="dni_nif" value={formData.dni_nif} onChange={handleChange} placeholder="12345678X" className="w-full bg-white border-2 border-[#295773] rounded-xl py-1.5 sm:py-2 px-4 focus:ring-4 focus:ring-white/5 transition-all outline-none text-gray-900 font-black text-xs shadow-sm" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card 2: Ubicació i Facturació */}
                                            <div className="bg-white/5 border border-white/10 rounded-[20px] sm:rounded-[24px] p-3 sm:p-4 shadow-xl space-y-2">
                                                <h4 className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 pb-1.5 sm:pb-2">Ubicació i Facturació</h4>
                                                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-widest ml-1">Raó Social</label>
                                                        <input name="raon_social" value={formData.raon_social} onChange={handleChange} placeholder="Nom fiscal" className="w-full bg-white border-2 border-[#295773] rounded-xl py-1.5 sm:py-2 px-4 focus:ring-4 focus:ring-white/5 transition-all outline-none text-gray-900 font-black text-xs shadow-sm" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-widest ml-1">Adreça</label>
                                                        <input name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Carrer, 123" className="w-full bg-white border-2 border-[#295773] rounded-xl py-1.5 sm:py-2 px-4 focus:ring-4 focus:ring-white/5 transition-all outline-none text-gray-900 font-black text-xs shadow-sm" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-widest ml-1">Email</label>
                                                        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@client.com" className="w-full bg-white border-2 border-[#295773] rounded-xl py-1.5 sm:py-2 px-4 focus:ring-4 focus:ring-white/5 transition-all outline-none text-gray-900 font-black text-xs shadow-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {/* Compact Horizontal File Manager */}
                                {client?.id && formData.invoice_files?.length > 0 && (
                                    <div className="pt-2 border-t border-gray-100 shrink-0">
                                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar scroll-smooth">
                                            {formData.invoice_files.map((file, idx) => (
                                                <a
                                                    key={idx}
                                                    href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/invoices/${file.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl hover:border-[#295773] transition-all min-w-[180px] group shrink-0"
                                                >
                                                    <FileText className="w-4 h-4 text-[#295773]" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-black text-gray-900 truncate">{file.name}</p>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Compact Footer */}
                    <div className="px-6 py-4 pb-8 sm:px-10 sm:py-3 border-t border-white/10 bg-[#295773] flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 shrink-0">
                        {!showHistory && (
                            <>
                                <button type="button" onClick={onClose} className="flex-1 bg-white/5 border border-white/10 text-white/40 rounded-xl py-2.5 font-black hover:text-white transition-all text-[10px] tracking-widest uppercase">Tancar</button>

                                {client?.id && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={loadHistory}
                                            disabled={isLoadingHistory}
                                            className="flex-1 bg-white/10 border border-white/10 text-white rounded-xl py-2.5 font-black hover:bg-white/20 transition-all text-[10px] tracking-widest flex items-center justify-center gap-2 uppercase"
                                        >
                                            {isLoadingHistory ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Historial'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsInvoiceWizardOpen(true)}
                                            className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl py-2.5 font-black hover:bg-white/10 transition-all text-[10px] tracking-widest uppercase"
                                        >
                                            Factura
                                        </button>
                                    </>
                                )}

                                <button type="submit" onClick={handleSubmit} className="flex-1 bg-white text-[#295773] rounded-xl py-2.5 font-black shadow-lg hover:shadow-white/20 transition-all text-[10px] tracking-widest uppercase">Desar</button>
                            </>
                        )}
                        {showHistory && (
                            <button
                                type="button"
                                onClick={() => setShowHistory(false)}
                                className="w-full bg-white text-[#295773] rounded-xl py-3 font-black shadow-lg transition-all text-[10px] tracking-widest"
                            >
                                TORNAR A LA FITXA
                            </button>
                        )}
                    </div>

                    {/* Delete Option for Existing Clients - Dark/White Theme */}
                    {client?.id && !showHistory && (
                        <div className="px-10 py-6 pb-12 sm:py-5 bg-[#1a3a4e] flex items-center justify-center border-t border-white/10">
                            {showDeleteConfirm ? (
                                <div className="flex items-center gap-6 animate-in fade-in slide-in-from-bottom-2">
                                    <p className="text-[11px] font-black text-white uppercase tracking-widest">Vols eliminar la fitxa?</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDelete}
                                            className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-red-700 transition-colors"
                                        >
                                            SÍ
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white/20"
                                        >
                                            NO
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-all py-1 group"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400 group-hover:text-red-300">Eliminar</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <AvatarSelectorModal
                isOpen={isAvatarModalOpen}
                onClose={() => {
                    setIsAvatarModalOpen(false)
                    setIsSavingNewClient(false)
                }}
                currentAvatar={formData.avatar}
                onSelect={handleAvatarSelect}
            />

            {isInvoiceWizardOpen && (
                <InvoiceWizard
                    isOpen={isInvoiceWizardOpen}
                    onClose={() => setIsInvoiceWizardOpen(false)}
                    onComplete={() => {
                        setIsInvoiceWizardOpen(false)
                        onClose()
                    }}
                    client={client}
                    onEmit={onEmitInvoice}
                />
            )}
            {showInvoiceDeleteConfirm && (
                <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowInvoiceDeleteConfirm(null)} />
                    <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 text-center">Eliminar Factura?</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest text-center mt-2 mb-8">Aquesta acció no es pot desfer</p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteInvoiceConfirm}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg transition-all text-xs uppercase tracking-widest"
                            >
                                SÍ, ELIMINAR
                            </button>
                            <button
                                onClick={() => setShowInvoiceDeleteConfirm(null)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black py-3 rounded-xl transition-all text-xs uppercase tracking-widest"
                            >
                                NO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
