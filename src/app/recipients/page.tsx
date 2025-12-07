"use client"

import { useState, useMemo } from "react"
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  StarOff,
  Copy,
  CheckCircle2,
  X,
  ExternalLink,
  MapPin,
  Mail,
  Wallet,
  MoreVertical,
  UserPlus,
  AlertCircle
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-user/dashboard-header"
import { Sidebar } from "@/components/dashboard-user/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

// Types
interface Recipient {
  id: string
  name: string
  walletAddress: string
  email?: string
  country?: string
  countryFlag?: string
  note?: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

// Country options
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

// Mock data
const mockRecipients: Recipient[] = [
  {
    id: "1",
    name: "Sofia Sharma",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    email: "sofia@example.com",
    country: "IN",
    countryFlag: "🇮🇳",
    note: "Famille - Mumbai",
    isFavorite: true,
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-15T14:30:00Z"
  },
  {
    id: "2",
    name: "Marcus Weber",
    walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    email: "marcus.w@example.com",
    country: "DE",
    countryFlag: "🇩🇪",
    note: "Business partner",
    isFavorite: true,
    createdAt: "2025-01-05T08:00:00Z",
    updatedAt: "2025-01-10T11:00:00Z"
  },
  {
    id: "3",
    name: "Priya Patel",
    walletAddress: "0x5555444433332222111100009999888877776666",
    email: "priya.p@example.com",
    country: "IN",
    countryFlag: "🇮🇳",
    isFavorite: false,
    createdAt: "2025-01-08T12:00:00Z",
    updatedAt: "2025-01-08T12:00:00Z"
  },
  {
    id: "4",
    name: "Jean Dupont",
    walletAddress: "0x9876543210fedcba9876543210fedcba98765432",
    country: "FR",
    countryFlag: "🇫🇷",
    note: "Freelance designer",
    isFavorite: false,
    createdAt: "2025-01-10T15:00:00Z",
    updatedAt: "2025-01-10T15:00:00Z"
  },
]

// Modal Component
function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: { 
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode 
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[#0D0D0D] border border-[#333] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F1F1F]">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-[#919191]" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// Delete Confirmation Modal
function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  recipientName
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  recipientName: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm mx-4 bg-[#0D0D0D] border border-[#333] rounded-2xl shadow-2xl p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 bg-red-500/20 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Supprimer ce destinataire ?</h3>
            <p className="text-sm text-[#919191]">
              Êtes-vous sûr de vouloir supprimer <span className="text-white font-medium">{recipientName}</span> de votre carnet d'adresses ?
            </p>
          </div>
          
          <div className="flex gap-3 w-full mt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#333] text-white hover:bg-[#1A1A1A]"
            >
              Annuler
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>(mockRecipients)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterFavorites, setFilterFavorites] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    walletAddress: "",
    email: "",
    country: "",
    note: ""
  })
  const [formError, setFormError] = useState<string | null>(null)

  // Filtered recipients
  const filteredRecipients = useMemo(() => {
    return recipients.filter((r) => {
      const matchesSearch = 
        !searchQuery ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFavorite = !filterFavorites || r.isFavorite

      return matchesSearch && matchesFavorite
    })
  }, [recipients, searchQuery, filterFavorites])

  // Sorted: favorites first, then alphabetical
  const sortedRecipients = useMemo(() => {
    return [...filteredRecipients].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1
      if (!a.isFavorite && b.isFavorite) return 1
      return a.name.localeCompare(b.name)
    })
  }, [filteredRecipients])

  // Helpers
  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`
  
  const copyAddress = (id: string, address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getCountryInfo = (code: string) => {
    return countries.find(c => c.code === code)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      walletAddress: "",
      email: "",
      country: "",
      note: ""
    })
    setFormError(null)
  }

  // CRUD Operations
  const handleAdd = () => {
    setFormError(null)
    
    // Validation
    if (!formData.name.trim()) {
      setFormError("Le nom est requis")
      return
    }
    if (!formData.walletAddress.trim() || !formData.walletAddress.startsWith("0x")) {
      setFormError("Adresse wallet invalide (doit commencer par 0x)")
      return
    }
    if (formData.walletAddress.length !== 42) {
      setFormError("Adresse wallet invalide (42 caractères requis)")
      return
    }
    
    // Check duplicate
    if (recipients.some(r => r.walletAddress.toLowerCase() === formData.walletAddress.toLowerCase())) {
      setFormError("Cette adresse existe déjà")
      return
    }

    const countryInfo = formData.country ? getCountryInfo(formData.country) : null
    
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      walletAddress: formData.walletAddress.trim(),
      email: formData.email.trim() || undefined,
      country: formData.country || undefined,
      countryFlag: countryInfo?.flag,
      note: formData.note.trim() || undefined,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setRecipients(prev => [...prev, newRecipient])
    setIsAddModalOpen(false)
    resetForm()
  }

  const handleEdit = () => {
    if (!selectedRecipient) return
    setFormError(null)

    // Validation
    if (!formData.name.trim()) {
      setFormError("Le nom est requis")
      return
    }
    if (!formData.walletAddress.trim() || !formData.walletAddress.startsWith("0x")) {
      setFormError("Adresse wallet invalide")
      return
    }
    
    // Check duplicate (excluding current)
    if (recipients.some(r => 
      r.id !== selectedRecipient.id && 
      r.walletAddress.toLowerCase() === formData.walletAddress.toLowerCase()
    )) {
      setFormError("Cette adresse existe déjà")
      return
    }

    const countryInfo = formData.country ? getCountryInfo(formData.country) : null

    setRecipients(prev => prev.map(r => 
      r.id === selectedRecipient.id
        ? {
            ...r,
            name: formData.name.trim(),
            walletAddress: formData.walletAddress.trim(),
            email: formData.email.trim() || undefined,
            country: formData.country || undefined,
            countryFlag: countryInfo?.flag,
            note: formData.note.trim() || undefined,
            updatedAt: new Date().toISOString()
          }
        : r
    ))
    
    setIsEditModalOpen(false)
    setSelectedRecipient(null)
    resetForm()
  }

  const handleDelete = () => {
    if (!selectedRecipient) return
    
    setRecipients(prev => prev.filter(r => r.id !== selectedRecipient.id))
    setIsDeleteModalOpen(false)
    setSelectedRecipient(null)
  }

  const toggleFavorite = (id: string) => {
    setRecipients(prev => prev.map(r =>
      r.id === id ? { ...r, isFavorite: !r.isFavorite, updatedAt: new Date().toISOString() } : r
    ))
  }

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

  const openViewModal = (recipient: Recipient) => {
    setSelectedRecipient(recipient)
    setIsViewModalOpen(true)
  }

  const openDeleteModal = (recipient: Recipient) => {
    setSelectedRecipient(recipient)
    setIsDeleteModalOpen(true)
  }

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
                onClick={() => {
                  resetForm()
                  setIsAddModalOpen(true)
                }}
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
                className={`border-[#333] ${
                  filterFavorites 
                    ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" 
                    : "bg-[#0D0D0D] text-white hover:bg-[#1A1A1A]"
                }`}
              >
                <Star className={`h-4 w-4 mr-2 ${filterFavorites ? "fill-yellow-400" : ""}`} />
                Favoris
              </Button>
            </div>

            {/* Recipients Grid */}
            {sortedRecipients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-[#0D0D0D] rounded-2xl">
                <div className="p-4 bg-[#1A1A1A] rounded-full mb-4">
                  <UserPlus className="h-12 w-12 text-[#333]" />
                </div>
                <p className="text-[#919191] mb-2">
                  {searchQuery || filterFavorites 
                    ? "Aucun destinataire trouvé" 
                    : "Aucun destinataire"}
                </p>
                <p className="text-sm text-[#666] mb-4">
                  {searchQuery || filterFavorites 
                    ? "Essayez de modifier vos filtres"
                    : "Commencez par ajouter vos premiers contacts"}
                </p>
                {!searchQuery && !filterFavorites && (
                  <Button
                    onClick={() => {
                      resetForm()
                      setIsAddModalOpen(true)
                    }}
                    variant="outline"
                    className="border-[#333] text-white hover:bg-[#1A1A1A]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un destinataire
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedRecipients.map((recipient) => (
                  <div
                    key={recipient.id}
                    className="p-5 bg-[#0D0D0D] rounded-2xl border border-[#1F1F1F] hover:border-[#333] transition-colors group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white font-semibold text-lg">
                          {recipient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{recipient.name}</h3>
                            {recipient.isFavorite && (
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            )}
                          </div>
                          {recipient.country && (
                            <p className="text-sm text-[#919191] flex items-center gap-1">
                              <span>{recipient.countryFlag}</span>
                              {getCountryInfo(recipient.country)?.name}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-[#1A1A1A] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4 text-[#919191]" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0D0D0D] border-[#333]">
                          <DropdownMenuItem
                            onClick={() => openViewModal(recipient)}
                            className="text-white hover:bg-[#1A1A1A] cursor-pointer"
                          >
                            <Users className="h-4 w-4 mr-2 text-[#919191]" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditModal(recipient)}
                            className="text-white hover:bg-[#1A1A1A] cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4 mr-2 text-[#919191]" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleFavorite(recipient.id)}
                            className="text-white hover:bg-[#1A1A1A] cursor-pointer"
                          >
                            {recipient.isFavorite ? (
                              <>
                                <StarOff className="h-4 w-4 mr-2 text-[#919191]" />
                                Retirer des favoris
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4 mr-2 text-yellow-400" />
                                Ajouter aux favoris
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#333]" />
                          <DropdownMenuItem
                            onClick={() => openDeleteModal(recipient)}
                            className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Wallet Address */}
                    <div className="flex items-center gap-2 p-3 bg-[#1A1A1A] rounded-xl mb-3">
                      <Wallet className="h-4 w-4 text-[#666]" />
                      <span className="text-sm text-[#919191] font-mono flex-1">
                        {formatAddress(recipient.walletAddress)}
                      </span>
                      <button
                        onClick={() => copyAddress(recipient.id, recipient.walletAddress)}
                        className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                      >
                        {copiedId === recipient.id ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-[#666]" />
                        )}
                      </button>
                      <a
                        href={`https://testnet.snowtrace.io/address/${recipient.walletAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-[#666]" />
                      </a>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-2">
                      {recipient.email && (
                        <div className="flex items-center gap-2 text-sm text-[#666]">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{recipient.email}</span>
                        </div>
                      )}
                      {recipient.note && (
                        <p className="text-sm text-[#666] italic">"{recipient.note}"</p>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-[#1F1F1F]">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                        onClick={() => {
                          // TODO: Navigate to quick send with pre-filled recipient
                          window.location.href = `/dashboard?send=${recipient.walletAddress}`
                        }}
                      >
                        Envoyer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#333] text-white hover:bg-[#1A1A1A]"
                        onClick={() => openViewModal(recipient)}
                      >
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

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          resetForm()
        }}
        title="Ajouter un destinataire"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleAdd() }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-name" className="text-[#919191]">Nom *</Label>
            <Input
              id="add-name"
              placeholder="Ex: Sofia Sharma"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-[#1A1A1A] border-[#333] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-wallet" className="text-[#919191]">Adresse Wallet *</Label>
            <Input
              id="add-wallet"
              placeholder="0x..."
              value={formData.walletAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
              className="bg-[#1A1A1A] border-[#333] text-white font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-email" className="text-[#919191]">Email (optionnel)</Label>
            <Input
              id="add-email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-[#1A1A1A] border-[#333] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-country" className="text-[#919191]">Pays (optionnel)</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-[#1A1A1A] border-[#333] text-white hover:bg-[#2A2A2A]"
                >
                  {formData.country ? (
                    <>
                      <span className="mr-2">{getCountryInfo(formData.country)?.flag}</span>
                      {getCountryInfo(formData.country)?.name}
                    </>
                  ) : (
                    <span className="text-[#666]">Sélectionner un pays</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0D0D0D] border-[#333] max-h-60 overflow-y-auto">
                <DropdownMenuItem
                  onClick={() => setFormData(prev => ({ ...prev, country: "" }))}
                  className="text-[#666] hover:bg-[#1A1A1A] cursor-pointer"
                >
                  Aucun
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#333]" />
                {countries.map((country) => (
                  <DropdownMenuItem
                    key={country.code}
                    onClick={() => setFormData(prev => ({ ...prev, country: country.code }))}
                    className="text-white hover:bg-[#1A1A1A] cursor-pointer"
                  >
                    <span className="mr-2">{country.flag}</span>
                    {country.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-note" className="text-[#919191]">Note (optionnel)</Label>
            <Input
              id="add-note"
              placeholder="Ex: Famille, Business..."
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              className="bg-[#1A1A1A] border-[#333] text-white"
            />
          </div>

          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              {formError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                resetForm()
              }}
              className="flex-1 border-[#333] text-white hover:bg-[#1A1A1A]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
            >
              Ajouter
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedRecipient(null)
          resetForm()
        }}
        title="Modifier le destinataire"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleEdit() }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-[#919191]">Nom *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-[#1A1A1A] border-[#333] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-wallet" className="text-[#919191]">Adresse Wallet *</Label>
            <Input
              id="edit-wallet"
              value={formData.walletAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
              className="bg-[#1A1A1A] border-[#333] text-white font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email" className="text-[#919191]">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-[#1A1A1A] border-[#333] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-country" className="text-[#919191]">Pays</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-[#1A1A1A] border-[#333] text-white hover:bg-[#2A2A2A]"
                >
                  {formData.country ? (
                    <>
                      <span className="mr-2">{getCountryInfo(formData.country)?.flag}</span>
                      {getCountryInfo(formData.country)?.name}
                    </>
                  ) : (
                    <span className="text-[#666]">Sélectionner un pays</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0D0D0D] border-[#333] max-h-60 overflow-y-auto">
                <DropdownMenuItem
                  onClick={() => setFormData(prev => ({ ...prev, country: "" }))}
                  className="text-[#666] hover:bg-[#1A1A1A] cursor-pointer"
                >
                  Aucun
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#333]" />
                {countries.map((country) => (
                  <DropdownMenuItem
                    key={country.code}
                    onClick={() => setFormData(prev => ({ ...prev, country: country.code }))}
                    className="text-white hover:bg-[#1A1A1A] cursor-pointer"
                  >
                    <span className="mr-2">{country.flag}</span>
                    {country.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-note" className="text-[#919191]">Note</Label>
            <Input
              id="edit-note"
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              className="bg-[#1A1A1A] border-[#333] text-white"
            />
          </div>

          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              {formError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false)
                setSelectedRecipient(null)
                resetForm()
              }}
              className="flex-1 border-[#333] text-white hover:bg-[#1A1A1A]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedRecipient(null)
        }}
        title="Détails du destinataire"
      >
        {selectedRecipient && (
          <div className="space-y-4">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white font-bold text-2xl">
                {selectedRecipient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-white">{selectedRecipient.name}</h3>
                  {selectedRecipient.isFavorite && (
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  )}
                </div>
                {selectedRecipient.country && (
                  <p className="text-[#919191] flex items-center gap-1">
                    <span>{selectedRecipient.countryFlag}</span>
                    {getCountryInfo(selectedRecipient.country)?.name}
                  </p>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 p-4 bg-[#1A1A1A] rounded-xl">
              <div className="flex items-start gap-3">
                <Wallet className="h-5 w-5 text-[#666] mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#666]">Adresse Wallet</p>
                  <p className="text-white font-mono text-sm break-all">{selectedRecipient.walletAddress}</p>
                </div>
                <button
                  onClick={() => copyAddress(selectedRecipient.id, selectedRecipient.walletAddress)}
                  className="p-2 hover:bg-[#2A2A2A] rounded-lg"
                >
                  {copiedId === selectedRecipient.id ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-[#666]" />
                  )}
                </button>
              </div>

              {selectedRecipient.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[#666]" />
                  <div>
                    <p className="text-sm text-[#666]">Email</p>
                    <p className="text-white">{selectedRecipient.email}</p>
                  </div>
                </div>
              )}

              {selectedRecipient.country && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#666]" />
                  <div>
                    <p className="text-sm text-[#666]">Pays</p>
                    <p className="text-white flex items-center gap-2">
                      <span>{selectedRecipient.countryFlag}</span>
                      {getCountryInfo(selectedRecipient.country)?.name}
                    </p>
                  </div>
                </div>
              )}

              {selectedRecipient.note && (
                <div className="pt-3 border-t border-[#333]">
                  <p className="text-sm text-[#666] mb-1">Note</p>
                  <p className="text-white italic">"{selectedRecipient.note}"</p>
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="text-xs text-[#666] space-y-1">
              <p>Ajouté le {new Date(selectedRecipient.createdAt).toLocaleDateString("fr-FR")}</p>
              <p>Modifié le {new Date(selectedRecipient.updatedAt).toLocaleDateString("fr-FR")}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  openEditModal(selectedRecipient)
                }}
                className="flex-1 border-[#333] text-white hover:bg-[#1A1A1A]"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                onClick={() => {
                  window.location.href = `/dashboard?send=${selectedRecipient.walletAddress}`
                }}
              >
                Envoyer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedRecipient(null)
        }}
        onConfirm={handleDelete}
        recipientName={selectedRecipient?.name || ""}
      />
    </div>
  )
}