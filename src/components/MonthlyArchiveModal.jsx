import React, { useState, useEffect } from 'react'
import { X, Calendar, FileText, Download, Send, ChevronRight, Loader2, Check } from 'lucide-react'
import { generateMonthlyArchivePDF } from '../utils/invoiceGenerator'

export const MonthlyArchiveModal = ({ isOpen, onClose, invoices }) => {
    const [step, setStep] = useState(1) // 1: Select, 2: Preview
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedBlob, setGeneratedBlob] = useState(null)
    const [blobUrl, setBlobUrl] = useState(null)

    const months = [
        'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
        'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'
    ]

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

    useEffect(() => {
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl)
        }
    }, [blobUrl])

    const handleGenerate = async () => {
        setIsGenerating(true)
        try {
            // Filter invoices for selected month/year
            const monthlyInvoices = invoices.filter(inv => {
                const date = new Date(inv.fecha_emision)
                return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
            }).sort((a, b) => new Date(a.fecha_emision) - new Date(b.fecha_emision))

            if (monthlyInvoices.length === 0) {
                alert('No hi ha factures per a aquest mes.')
                setIsGenerating(false)
                return
            }

            const blob = await generateMonthlyArchivePDF(months[selectedMonth], monthlyInvoices)
            const url = URL.createObjectURL(blob)
            setGeneratedBlob(blob)
            setBlobUrl(url)
            setStep(2)
        } catch (error) {
            console.error('Error generating archive:', error)
            alert('Error en generar l\'arxiu.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDownload = () => {
        if (!blobUrl) return
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `Arxiu_Factures_${months[selectedMonth]}_${selectedYear}.pdf`
        link.click()
    }

    const handleShare = async () => {
        if (!generatedBlob) return
        try {
            const file = new File([generatedBlob], `Arxiu_${months[selectedMonth]}.pdf`, { type: 'application/pdf' })
            if (navigator.share) {
                await navigator.share({
                    files: [file],
                    title: `Arxiu Factures ${months[selectedMonth]}`,
                    text: `Recull de factures de ${months[selectedMonth]} ${selectedYear}`
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 leading-none">Arxiu Mensual</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Generació de PDF Multifactura</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {step === 1 ? (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Selecciona el Mes</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {months.map((m, idx) => (
                                            <button
                                                key={m}
                                                onClick={() => setSelectedMonth(idx)}
                                                className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${selectedMonth === idx ? 'bg-[#2F5468] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                            >
                                                {m.slice(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Selecciona l'Any</label>
                                    <div className="space-y-2">
                                        {years.map(y => (
                                            <button
                                                key={y}
                                                onClick={() => setSelectedYear(y)}
                                                className={`w-full py-3 rounded-xl text-xs font-black transition-all shadow-sm ${selectedYear === y ? 'bg-[#2F5468] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                            >
                                                {y}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full bg-[#D37665] text-white py-4 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                                Generar Arxiu Mensual
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in zoom-in-95 duration-500 text-center">
                            <div className="w-32 h-32 bg-green-50 rounded-[40px] flex items-center justify-center text-green-500 mx-auto shadow-inner">
                                <Check className="w-16 h-16" strokeWidth={3} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900">PDF Generat amb èxit!</h4>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">{months[selectedMonth]} {selectedYear}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={handleShare}
                                    className="flex items-center justify-center gap-3 bg-gray-50 border border-gray-100 p-4 rounded-2xl hover:bg-gray-100 transition-all group"
                                >
                                    <Send className="w-5 h-5 text-gray-400 group-hover:text-[#2F5468]" />
                                    <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-gray-900">Compartir</span>
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center justify-center gap-3 bg-gray-50 border border-gray-100 p-4 rounded-2xl hover:bg-gray-100 transition-all group"
                                >
                                    <Download className="w-5 h-5 text-gray-400 group-hover:text-[#2F5468]" />
                                    <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-gray-900">Exportar PDF</span>
                                </button>
                            </div>

                            <button
                                onClick={() => setStep(1)}
                                className="text-[10px] font-black uppercase text-gray-300 hover:text-[#2F5468] transition-all tracking-widest"
                            >
                                Tornar a seleccionar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
