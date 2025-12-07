"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Users, Plus, Search, Edit2, Trash2, Star, StarOff, Copy,
  CheckCircle2, X, ExternalLink, MapPin, Mail, Wallet,
  MoreVertical, UserPlus, AlertCircle, Loader2
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-user/dashboard-header"
import { Sidebar } from "@/components/dashboard-user/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

// Imports Backend
import { useAuth } from "@/contexts/auth-context"
import { 
  getRecipients, 
  addRecipient, 
  updateRecipient, 
  deleteRecipient, 
  toggleFavoriteRecipient 
} from "@/app/actions/recipient-actions"

// Types adaptés à Prisma
interface Recipient {
  id: string
  name: string
  walletAddress: string
  email?: string | null
  country?: string | null
  note?: string | null
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
}

// Country options (inchangé)
const countries = [
  { code: "IN", name: "Inde", flag: "🇮🇳" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "US", name: "États-Unis", flag: "🇺🇸" },
  { code: "GB", name: "Royaume-Uni", flag: "🇬🇧" },
  { code: "DE", name: "Allemagne", flag: "🇩🇪" },
  { code: "ES", name: "Espagne", flag: "🇪🇸" },
  { code: "IT", name: "Italie", flag: "🇮🇹" },
  { code: "JP", name: "Japon", flag: "🇯🇵" },
  { code: "CN", name: "Chine", flag: "🇨🇳" },
  { code: "BR", name: "Brésil", flag: "🇧🇷" },
  { code: "MX", name: "Mexique", flag: "🇲🇽" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
]

// Modal Component (inchangé)
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-[#0D0D0D] border border-[#333] rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F1F1F]">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors">
            <X className="h-5 w-5 text-[#919191]" />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}

export default function RecipientsPage() {
  const { user } = useAuth()
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true) // État de chargement initial
  
  const [searchQuery, setSearchQuery] = useState("")
  const [filterFavorites, setFilterFavorites] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false) // État de soumission formulaires
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    walletAddress: "",
    email: "",
    country: "",
    note: ""
  })
  const [formError, setFormError] = useState<string | null>(null)

  // --- CHARGEMENT DES DONNÉES ---
  const loadData = async () => {
    if (!user) return
    setIsLoadingData(true)
    try {
      const data = await getRecipients(user.id)
      setRecipients(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  // --- HELPERS ---
  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`
  
  const copyAddress = (id: string, address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getCountryInfo = (code: string | null | undefined) => {
    if (!code) return null
    return countries.find(c => c.code === code)
  }

  const resetForm = () => {
    setFormData({ name: "", walletAddress: "", email: "", country: "", note: "" })
    setFormError(null)
    setIsSubmitting(false)
  }

  // --- CRUD OPERATIONS ---

  const handleAdd = async () => {
    if (!user) return
    setFormError(null)
    
    // Validation basique
    if (!formData.name.trim()) return setFormError("Le nom est requis")
    if (!formData.walletAddress.trim() || !formData.walletAddress.startsWith("0x") || formData.walletAddress.length !== 42) {
      return setFormError("Adresse wallet invalide (0x... 42 caractères)")
    }

    setIsSubmitting(true)
    try {
      const res = await addRecipient(user.id, {
        name: formData.name,
        walletAddress: formData.walletAddress,
        email: formData.email || undefined,
        country: formData.country || undefined,
        note: formData.note || undefined,
        isFavorite: false
      })

      if (res.success) {
        await loadData() // Recharger la liste
        setIsAddModalOpen(false)
        resetForm()
      } else {
        setFormError(typeof res.error === 'string' ? res.error : "Erreur inconnue")
      }
    } catch (err) {
      setFormError("Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedRecipient || !user) return
    setFormError(null)
    setIsSubmitting(true)

    try {
      const res = await updateRecipient(user.id, selectedRecipient.id, {
        name: formData.name,
        walletAddress: formData.walletAddress,
        email: formData.email || null,
        country: formData.country || null,
        note: formData.note || null
      })

      if (res.success) {
        await loadData()
        setIsEditModalOpen(false)
        setSelectedRecipient(null)
        resetForm()
      } else {
        setFormError("Erreur lors de la modification")
      }
    } catch (err) {
      setFormError("Erreur serveur")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedRecipient || !user) return
    setIsSubmitting(true)
    
    try {
      const res = await deleteRecipient(user.id, selectedRecipient.id)
      if (res.success) {
        setRecipients(prev => prev.filter(r => r.id !== selectedRecipient.id))
        setIsDeleteModalOpen(false)
        setSelectedRecipient(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleFavorite = async (recipient: Recipient) => {
    if (!user) return
    
    // Optimistic Update (mise à jour immédiate de l'UI)
    setRecipients(prev => prev.map(r => 
      r.id === recipient.id ? { ...r, isFavorite: !r.isFavorite } : r
    ))

    try {
      await toggleFavoriteRecipient(user.id, recipient.id, !recipient.isFavorite)
      // Pas besoin de recharger, l'optimistic update suffit
    } catch (err) {
      // Rollback en cas d'erreur
      setRecipients(prev => prev.map(r => 
        r.id === recipient.id ? { ...r, isFavorite: recipient.isFavorite } : r
      ))
    }
  }

  // --- MODAL OPENERS ---
  const openEditModal = (recipient: Recipient) => {
    setSelectedRecipient(recipient)
    setFormData({
      name: recipient.name,
      walletAddress: recipient.walletAddress,
      email: recipient.email || "",
      country: recipient.country || "",
      note: recipient.note || ""
    })
    setIsEditModalOpen(true)
  }

  // Filtered recipients
  const filteredRecipients = useMemo(() => {
    return recipients.filter((r) => {
      const matchesSearch = 
        !searchQuery ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.email && r.email.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesFavorite = !filterFavorites || r.isFavorite

      return matchesSearch && matchesFavorite
    })
  }, [recipients, searchQuery, filterFavorites])

  // Stats
  const stats = {
    total: recipients.length,
    favorites: recipients.filter(r => r.isFavorite).length
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
      <DashboardHeader />

      <div className="h-full overflow-y-auto no-scrollbar">
        <main className="flex gap-6 p-6 pt-24 min-h-full">
          <Sidebar />

          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Destinataires</h1>
                <p className="text-[#919191]">Gérez votre carnet d'adresses</p>
              </div>
              
              <Button
                onClick={() => { resetForm(); setIsAddModalOpen(true) }}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#0D0D0D] rounded-xl flex items-center gap-4">
                <div className="p-3 bg-[#1A1A1A] rounded-xl">
                  <Users className="h-6 w-6 text-[#919191]" />
                </div>
                <div>
                  <p className="text-sm text-[#919191]">Total</p>
                  <p className="text-2xl font-semibold text-white">{stats.total}</p>
                </div>
              </div>
              <div className="p-4 bg-[#0D0D0D] rounded-xl flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <Star className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-[#919191]">Favoris</p>
                  <p className="text-2xl font-semibold text-white">{stats.favorites}</p>
                </div>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
                <Input
                  placeholder="Rechercher par nom, adresse, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#0D0D0D] border-[#333] text-white placeholder:text-[#666]"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setFilterFavorites(!filterFavorites)}
                className={`border-[#333] ${filterFavorites ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" : "bg-[#0D0D0D] text-white hover:bg-[#1A1A1A]"}`}
              >
                <Star className={`h-4 w-4 mr-2 ${filterFavorites ? "fill-yellow-400" : ""}`} />
                Favoris
              </Button>
            </div>

            {/* Loading State */}
            {isLoadingData ? (
               <div className="flex flex-col items-center justify-center py-16">
                 <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                 <p className="text-[#919191]">Chargement de vos contacts...</p>
               </div>
            ) : filteredRecipients.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16 bg-[#0D0D0D] rounded-2xl">
                <div className="p-4 bg-[#1A1A1A] rounded-full mb-4">
                  <UserPlus className="h-12 w-12 text-[#333]" />
                </div>
                <p className="text-[#919191] mb-2">
                  {searchQuery || filterFavorites ? "Aucun destinataire trouvé" : "Aucun destinataire"}
                </p>
                {!searchQuery && !filterFavorites && (
                  <Button
                    onClick={() => { resetForm(); setIsAddModalOpen(true) }}
                    variant="outline"
                    className="border-[#333] text-white hover:bg-[#1A1A1A] mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un destinataire
                  </Button>
                )}
              </div>
            ) : (
              /* Recipients Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipients.map((recipient) => (
                  <div key={recipient.id} className="p-5 bg-[#0D0D0D] rounded-2xl border border-[#1F1F1F] hover:border-[#333] transition-colors group">
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white font-semibold text-lg">
                          {recipient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{recipient.name}</h3>
                            {recipient.isFavorite && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                          </div>
                          {recipient.country && (
                            <p className="text-sm text-[#919191] flex items-center gap-1">
                              <span>{getCountryInfo(recipient.country)?.flag}</span>
                              {getCountryInfo(recipient.country)?.name}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-[#1A1A1A] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4 text-[#919191]" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0D0D0D] border-[#333]">
                          <DropdownMenuItem onClick={() => { setSelectedRecipient(recipient); setIsViewModalOpen(true) }} className="text-white hover:bg-[#1A1A1A] cursor-pointer">
                            <Users className="h-4 w-4 mr-2 text-[#919191]" /> Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditModal(recipient)} className="text-white hover:bg-[#1A1A1A] cursor-pointer">
                            <Edit2 className="h-4 w-4 mr-2 text-[#919191]" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleFavorite(recipient)} className="text-white hover:bg-[#1A1A1A] cursor-pointer">
                            {recipient.isFavorite ? (
                              <><StarOff className="h-4 w-4 mr-2 text-[#919191]" /> Retirer des favoris</>
                            ) : (
                              <><Star className="h-4 w-4 mr-2 text-yellow-400" /> Ajouter aux favoris</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#333]" />
                          <DropdownMenuItem onClick={() => { setSelectedRecipient(recipient); setIsDeleteModalOpen(true) }} className="text-red-400 hover:bg-red-500/10 cursor-pointer">
                            <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Address */}
                    <div className="flex items-center gap-2 p-3 bg-[#1A1A1A] rounded-xl mb-3">
                      <Wallet className="h-4 w-4 text-[#666]" />
                      <span className="text-sm text-[#919191] font-mono flex-1">{formatAddress(recipient.walletAddress)}</span>
                      <button onClick={() => copyAddress(recipient.id, recipient.walletAddress)} className="p-1 hover:bg-[#2A2A2A] rounded transition-colors">
                        {copiedId === recipient.id ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-[#666]" />}
                      </button>
                      <a href={`https://testnet.snowtrace.io/address/${recipient.walletAddress}`} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-[#2A2A2A] rounded transition-colors">
                        <ExternalLink className="h-4 w-4 text-[#666]" />
                      </a>
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                      {recipient.email && (
                        <div className="flex items-center gap-2 text-sm text-[#666]">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{recipient.email}</span>
                        </div>
                      )}
                      {recipient.note && <p className="text-sm text-[#666] italic">"{recipient.note}"</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-[#1F1F1F]">
                      <Button size="sm" className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white" onClick={() => window.location.href = `/dashboard?send=${recipient.walletAddress}`}>
                        Envoyer
                      </Button>
                      <Button size="sm" variant="outline" className="border-[#333] text-white hover:bg-[#1A1A1A]" onClick={() => { setSelectedRecipient(recipient); setIsViewModalOpen(true) }}>
                        Détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- ADD MODAL --- */}
      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); resetForm() }} title="Ajouter un destinataire">
        <form onSubmit={(e) => { e.preventDefault(); handleAdd() }} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#919191]">Nom *</Label>
            <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="bg-[#1A1A1A] border-[#333] text-white" placeholder="Ex: Sofia" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#919191]">Adresse Wallet *</Label>
            <Input value={formData.walletAddress} onChange={(e) => setFormData(p => ({ ...p, walletAddress: e.target.value }))} className="bg-[#1A1A1A] border-[#333] text-white font-mono" placeholder="0x..." />
          </div>
          <div className="space-y-2">
            <Label className="text-[#919191]">Email</Label>
            <Input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="bg-[#1A1A1A] border-[#333] text-white" />
          </div>
          {/* Country Dropdown (Simplifié pour l'exemple, voir code original pour implémentation complète) */}
          <div className="space-y-2">
            <Label className="text-[#919191]">Pays</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start bg-[#1A1A1A] border-[#333] text-white">
                  {formData.country ? <><span className="mr-2">{getCountryInfo(formData.country)?.flag}</span>{getCountryInfo(formData.country)?.name}</> : "Sélectionner"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0D0D0D] border-[#333] max-h-60 overflow-y-auto">
                <DropdownMenuItem onClick={() => setFormData(p => ({ ...p, country: "" }))} className="text-[#666]">Aucun</DropdownMenuItem>
                {countries.map(c => (
                  <DropdownMenuItem key={c.code} onClick={() => setFormData(p => ({ ...p, country: c.code }))} className="text-white">
                    <span className="mr-2">{c.flag}</span>{c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            <Label className="text-[#919191]">Note</Label>
            <Input value={formData.note} onChange={(e) => setFormData(p => ({ ...p, note: e.target.value }))} className="bg-[#1A1A1A] border-[#333] text-white" />
          </div>
          {formError && <div className="text-red-400 text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4"/>{formError}</div>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1 border-[#333] text-white">Annuler</Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-red-500 text-white">
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Ajouter"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT MODAL --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); resetForm() }} title="Modifier">
        <form onSubmit={(e) => { e.preventDefault(); handleEdit() }} className="space-y-4">
          <div className="space-y-2"><Label className="text-[#919191]">Nom</Label><Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="bg-[#1A1A1A] border-[#333] text-white" /></div>
          <div className="space-y-2"><Label className="text-[#919191]">Wallet</Label><Input value={formData.walletAddress} onChange={(e) => setFormData(p => ({ ...p, walletAddress: e.target.value }))} className="bg-[#1A1A1A] border-[#333] text-white font-mono" /></div>
          <div className="space-y-2"><Label className="text-[#919191]">Email</Label><Input value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="bg-[#1A1A1A] border-[#333] text-white" /></div>
          <div className="space-y-2"><Label className="text-[#919191]">Note</Label><Input value={formData.note} onChange={(e) => setFormData(p => ({ ...p, note: e.target.value }))} className="bg-[#1A1A1A] border-[#333] text-white" /></div>
          {formError && <p className="text-red-400 text-sm">{formError}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1 border-[#333] text-white">Annuler</Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-red-500 text-white">{isSubmitting ? <Loader2 className="animate-spin" /> : "Enregistrer"}</Button>
          </div>
        </form>
      </Modal>

      {/* --- DELETE MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative w-full max-w-sm mx-4 bg-[#0D0D0D] border border-[#333] rounded-2xl p-6 text-center">
            <div className="p-4 bg-red-500/20 rounded-full inline-block mb-4"><AlertCircle className="h-8 w-8 text-red-400" /></div>
            <h3 className="text-lg font-semibold text-white mb-2">Supprimer {selectedRecipient?.name} ?</h3>
            <p className="text-[#919191] text-sm mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 border-[#333] text-white">Annuler</Button>
              <Button onClick={handleDelete} disabled={isSubmitting} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Supprimer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW MODAL --- */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Détails">
        {selectedRecipient && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white font-bold text-2xl">
                {selectedRecipient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedRecipient.name}</h3>
                <p className="text-[#919191] text-sm">{selectedRecipient.email || "Pas d'email"}</p>
              </div>
            </div>
            <div className="p-4 bg-[#1A1A1A] rounded-xl space-y-2">
              <p className="text-sm text-[#666]">Adresse Wallet</p>
              <p className="text-white font-mono text-sm break-all">{selectedRecipient.walletAddress}</p>
            </div>
            {selectedRecipient.note && (
              <div className="p-4 bg-[#1A1A1A] rounded-xl">
                <p className="text-sm text-[#666]">Note</p>
                <p className="text-white italic">"{selectedRecipient.note}"</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => { setIsViewModalOpen(false); openEditModal(selectedRecipient) }} className="flex-1 border-[#333] text-white">Modifier</Button>
              <Button className="flex-1 bg-red-500 text-white" onClick={() => window.location.href = `/dashboard?send=${selectedRecipient.walletAddress}`}>Envoyer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}