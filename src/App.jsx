import React, { useState } from 'react'
import { Search, Plus, User, Loader2 } from 'lucide-react'
import { ClientModal } from './components/ClientModal'
import { useClients } from './hooks/useClients'
import { AnimatedTrasto } from './components/AnimatedTrasto'

const Header = ({ searchTerm, setSearchTerm }) => (
    <header className="sticky top-0 z-50 bg-[#2F5468] border-b border-white/20 px-6 py-0 flex items-start justify-between shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-sm">
        <div className="flex items-start gap-6 sm:gap-10 h-32 sm:h-44">
            {/* LARGE ANIMATED LOGO - Resting on the border */}
            <div className="relative group cursor-pointer overflow-visible shrink-0 h-full flex items-end">
                <AnimatedTrasto
                    showShadow={false}
                    className="w-28 h-28 sm:w-36 sm:h-36 hover:scale-105 transition-transform duration-300 translate-y-[20px] sm:translate-y-[25px]"
                />
            </div>

            {/* GREETING + SEARCH STACK - Centered vertically */}
            <div className="flex flex-col gap-1 flex-1 min-w-[200px] sm:min-w-[400px] mt-6 sm:mt-10">
                <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tighter">
                    <span className="text-white/40 font-black mr-2 text-base sm:text-lg uppercase tracking-widest">Hola,</span>
                    MILE
                </h1>

                {/* SEARCH INTEGRATED IN HEADER */}
                <div className="relative group w-full mt-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white" strokeWidth={3} />
                    <input
                        type="text"
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 text-white placeholder:text-white/20 focus:bg-white/10 transition-all rounded-[15px] py-3 pl-12 pr-4 outline-none text-sm"
                    />
                </div>
            </div>
        </div>
    </header>
)



const App = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingClient, setEditingClient] = useState(null)

    const { clients, loading, saveClient, saveInvoice, uploadClientFile, deleteClient, deleteInvoice, fetchInvoices } = useClients(searchTerm)

    const handleSave = async (data, stayOpen = false) => {
        const result = await saveClient(data)
        if (!result.error) {
            if (!stayOpen) {
                setIsModalOpen(false)
                setEditingClient(null)
            } else {
                setEditingClient(result.data)
            }
        } else {
            alert('Error en desar: ' + result.error)
        }
    }

    const handleEmitInvoice = async (invoiceData, pdfBlob) => {
        if (!editingClient) return { success: false, error: 'No s\'ha seleccionat cap client' }
        const result = await saveInvoice(editingClient.id, invoiceData, pdfBlob)
        if (!result.success) {
            alert('Error en desar la factura: ' + result.error)
        }
        return result
    }

    const handleUploadFile = async (file) => {
        if (!editingClient) return
        const result = await uploadClientFile(editingClient.id, file)
        if (!result.success) {
            alert('Error en pujar l\'arxiu: ' + result.error)
        }
        return result
    }

    const handleDeleteClient = async (clientId) => {
        const result = await deleteClient(clientId)
        if (result.success) {
            setIsModalOpen(false)
            setEditingClient(null)
        } else {
            alert('Error en eliminar el client: ' + result.error)
        }
    }

    const handleDeleteInvoice = async (invoiceId, pdfPath) => {
        return await deleteInvoice(invoiceId, pdfPath)
    }

    const openNewClient = () => {
        setEditingClient(null)
        setIsModalOpen(true)
    }

    const openEditClient = (client) => {
        setEditingClient(client)
        setIsModalOpen(true)
    }

    return (
        <div className="min-h-screen bg-[#2F5468]">
            <div className="flex flex-col min-h-screen w-full">
                <Header
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />

                <main className="px-4 py-4 sm:px-10 sm:py-6 flex-1 overflow-y-auto">
                    {loading && clients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-white/50 animate-spin" />
                            <p className="text-white/60 font-bold tracking-widest text-[10px] uppercase">Carregant...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-x-2 sm:gap-x-4 gap-y-4 sm:gap-y-8">
                            {/* "Client Nou" Button Card */}
                            <button
                                onClick={openNewClient}
                                className="flex flex-col items-center gap-1 sm:gap-2 group transition-transform active:scale-95 text-center"
                            >
                                <div className="w-20 h-20 sm:w-20 sm:h-20 lg:w-24 lg:h-24 transition-all overflow-visible relative transform group-hover:-translate-y-2 flex items-center justify-center">
                                    <div className="w-full h-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md">
                                        <Plus className="w-10 h-10 text-white group-hover:rotate-90 transition-transform" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center w-full px-1">
                                    <span className="text-[14px] sm:text-[15px] font-black text-white drop-shadow-md truncate w-full">
                                        Client
                                    </span>
                                    <span className="text-[11px] sm:text-[10px] text-white/60 truncate w-full font-black uppercase tracking-tight">
                                        Nou
                                    </span>
                                </div>
                            </button>

                            {clients.map((client) => (
                                <button
                                    key={client.id}
                                    onClick={() => openEditClient(client)}
                                    className="flex flex-col items-center gap-1 sm:gap-2 group transition-transform active:scale-95 text-center"
                                >
                                    <div className="w-20 h-20 sm:w-20 sm:h-20 lg:w-24 lg:h-24 transition-all overflow-visible relative transform group-hover:-translate-y-2">
                                        <img
                                            src={client.avatar ? `/avatars/${client.avatar}` : '/logo-circulo-perro-chica.png'}
                                            alt={client.nombre_perros}
                                            className="w-full h-full object-contain"
                                            style={{
                                                filter: 'drop-shadow(2px 2px 0 white) drop-shadow(-2px -2px 0 white) drop-shadow(2px -2px 0 white) drop-shadow(-2px 2px 0 white) drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
                                            }}
                                            onError={(e) => { e.target.src = '/logo-circulo-perro-chica.png' }}
                                        />
                                    </div>
                                    <div className="flex flex-col items-center w-full px-1">
                                        <span className="text-[14px] sm:text-[15px] font-black text-white drop-shadow-md truncate w-full">
                                            {client.nombre_propietario}
                                        </span>
                                        <span className="text-[11px] sm:text-[10px] text-white/60 truncate w-full font-black uppercase tracking-tight">
                                            {client.nombre_perros}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}


                    {!loading && clients.length === 0 && searchTerm && (
                        <div className="text-center py-32 bg-white/5 rounded-[40px] border border-white/5 backdrop-blur-sm shadow-xl mx-4">
                            <span className="text-4xl mb-4 block">🦴</span>
                            <p className="text-white font-black text-xl">No hem trobat cap gosset</p>
                            <p className="text-white/40 text-sm mt-2 font-bold uppercase tracking-widest">Prova amb un altre nom</p>
                        </div>
                    )}
                </main>
            </div>

            {isModalOpen && (
                <ClientModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    client={editingClient}
                    onSave={handleSave}
                    onEmitInvoice={handleEmitInvoice}
                    onUploadFile={handleUploadFile}
                    onDelete={handleDeleteClient}
                    onDeleteInvoice={handleDeleteInvoice}
                    fetchInvoices={fetchInvoices}
                />
            )}
        </div>
    )
}

export default App
