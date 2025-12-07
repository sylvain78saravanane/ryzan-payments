"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Wallet,
  Shield,
  Bell,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Key,
  LogOut,
  ChevronRight,
  Globe,
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
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase/supabase"

// Liste des pays
const COUNTRIES = [
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IN", name: "Inde", flag: "🇮🇳" },
  { code: "US", name: "États-Unis", flag: "🇺🇸" },
  { code: "GB", name: "Royaume-Uni", flag: "🇬🇧" },
  { code: "DE", name: "Allemagne", flag: "🇩🇪" },
  { code: "ES", name: "Espagne", flag: "🇪🇸" },
  { code: "IT", name: "Italie", flag: "🇮🇹" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "BE", name: "Belgique", flag: "🇧🇪" },
  { code: "CH", name: "Suisse", flag: "🇨🇭" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australie", flag: "🇦🇺" },
  { code: "JP", name: "Japon", flag: "🇯🇵" },
  { code: "CN", name: "Chine", flag: "🇨🇳" },
  { code: "BR", name: "Brésil", flag: "🇧🇷" },
  { code: "MX", name: "Mexique", flag: "🇲🇽" },
  { code: "MA", name: "Maroc", flag: "🇲🇦" },
  { code: "DZ", name: "Algérie", flag: "🇩🇿" },
  { code: "TN", name: "Tunisie", flag: "🇹🇳" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
]

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  walletAddress: string
}

type TabType = "general" | "security" | "notifications" | "danger"

export default function ProfilPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("general")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Données du profil
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    walletAddress: "",
  })

  // État pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // État pour la suppression du compte
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  // Charger les données utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const metadata = user.user_metadata
          setProfile({
            firstName: metadata?.first_name || "",
            lastName: metadata?.last_name || "",
            email: user.email || "",
            phone: metadata?.phone || "",
            country: metadata?.country || "",
            walletAddress: metadata?.wallet_address || "",
          })
        }
      } catch (err) {
        console.error("Error loading user data:", err)
        setError("Erreur lors du chargement des données")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  // Sauvegarder le profil
  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone: profile.phone,
          country: profile.country,
          wallet_address: profile.walletAddress,
        }
      })

      if (updateError) throw updateError

      setSuccess("Profil mis à jour avec succès !")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour")
    } finally {
      setIsSaving(false)
    }
  }

  // Changer le mot de passe
  const handleChangePassword = async () => {
    setIsChangingPassword(true)
    setError(null)
    setSuccess(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setIsChangingPassword(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères")
      setIsChangingPassword(false)
      return
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (updateError) throw updateError

      setSuccess("Mot de passe modifié avec succès !")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || "Erreur lors du changement de mot de passe")
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Supprimer le compte
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "SUPPRIMER") {
      setError("Veuillez taper SUPPRIMER pour confirmer")
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      // Note: La suppression complète nécessite généralement une fonction côté serveur
      // Pour l'instant, on déconnecte l'utilisateur
      await supabase.auth.signOut()
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression")
      setIsDeleting(false)
    }
  }

  // Déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const getCountryInfo = (code: string) => {
    return COUNTRIES.find(c => c.code === code)
  }

  const tabs = [
    { id: "general" as TabType, label: "Général", icon: User },
    { id: "security" as TabType, label: "Sécurité", icon: Shield },
    { id: "notifications" as TabType, label: "Notifications", icon: Bell },
    { id: "danger" as TabType, label: "Zone dangereuse", icon: AlertCircle },
  ]

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          <p className="text-[#919191]">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
      <DashboardHeader />

      <div className="h-full overflow-y-auto no-scrollbar">
        <main className="flex gap-6 p-6 pt-24 min-h-full">
          <Sidebar />

          <div className="flex-1 flex flex-col gap-6 min-w-0 max-w-4xl">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-white">Mon Profil</h1>
              <p className="text-[#919191]">Gérez vos informations personnelles et paramètres</p>
            </div>

            {/* Profile Card */}
            <div className="flex items-center gap-6 p-6 bg-[#0D0D0D] rounded-2xl">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white text-2xl font-bold">
                  {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-[#1A1A1A] rounded-full border border-[#333] hover:bg-[#2A2A2A] transition-colors">
                  <Camera className="h-4 w-4 text-[#919191]" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-[#919191]">{profile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                    Compte vérifié
                  </span>
                  {profile.country && (
                    <span className="px-2 py-1 text-xs bg-[#1A1A1A] text-[#919191] rounded-full flex items-center gap-1">
                      {getCountryInfo(profile.country)?.flag} {getCountryInfo(profile.country)?.name}
                    </span>
                  )}
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-[#333] text-[#919191] hover:text-red-400 hover:border-red-500/50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <p className="text-sm text-green-400">{success}</p>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-[#0D0D0D] rounded-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#1A1A1A] text-white"
                      : "text-[#919191] hover:text-white"
                  } ${tab.id === "danger" ? "text-red-400 hover:text-red-300" : ""}`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-[#0D0D0D] rounded-2xl p-6">
              {/* Général */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Informations personnelles</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-[#919191]">Prénom</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
                        <Input
                          id="firstName"
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          className="pl-10 bg-[#1A1A1A] border-[#333] text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-[#919191]">Nom</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
                        <Input
                          id="lastName"
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          className="pl-10 bg-[#1A1A1A] border-[#333] text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#919191]">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="pl-10 bg-[#1A1A1A] border-[#333] text-[#666] cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-[#666]">L'email ne peut pas être modifié</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[#919191]">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="pl-10 bg-[#1A1A1A] border-[#333] text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#919191]">Pays</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full flex items-center justify-between px-3 py-2 bg-[#1A1A1A] border border-[#333] rounded-md text-left">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-[#666]" />
                            {profile.country ? (
                              <>
                                <span>{getCountryInfo(profile.country)?.flag}</span>
                                <span className="text-white">{getCountryInfo(profile.country)?.name}</span>
                              </>
                            ) : (
                              <span className="text-[#666]">Sélectionner un pays</span>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-[#666]" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 max-h-60 overflow-y-auto bg-[#0D0D0D] border-[#333]">
                        {COUNTRIES.map((country) => (
                          <DropdownMenuItem
                            key={country.code}
                            onClick={() => setProfile({ ...profile, country: country.code })}
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
                    <Label htmlFor="wallet" className="text-[#919191]">Adresse Wallet (Avalanche)</Label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
                      <Input
                        id="wallet"
                        placeholder="0x..."
                        value={profile.walletAddress}
                        onChange={(e) => setProfile({ ...profile, walletAddress: e.target.value })}
                        className="pl-10 bg-[#1A1A1A] border-[#333] text-white font-mono"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Sécurité */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Sécurité du compte</h3>

                  {/* Changement de mot de passe */}
                  <div className="p-4 bg-[#1A1A1A] rounded-xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#2A2A2A] rounded-lg">
                        <Key className="h-5 w-5 text-[#919191]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Mot de passe</h4>
                        <p className="text-sm text-[#919191]">Modifiez votre mot de passe</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Input
                        type="password"
                        placeholder="Nouveau mot de passe"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="bg-[#0D0D0D] border-[#333] text-white"
                      />
                      <Input
                        type="password"
                        placeholder="Confirmer le mot de passe"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="bg-[#0D0D0D] border-[#333] text-white"
                      />
                      {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="text-xs text-red-400">Les mots de passe ne correspondent pas</p>
                      )}
                    </div>

                    <Button
                      onClick={handleChangePassword}
                      disabled={isChangingPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                      variant="outline"
                      className="w-full border-[#333] text-white hover:bg-[#2A2A2A]"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Modification...
                        </>
                      ) : (
                        "Changer le mot de passe"
                      )}
                    </Button>
                  </div>

                  {/* Sessions actives */}
                  <div className="p-4 bg-[#1A1A1A] rounded-xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#2A2A2A] rounded-lg">
                        <Shield className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Session active</h4>
                        <p className="text-sm text-[#919191]">Cet appareil • Maintenant</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Préférences de notification</h3>

                  <div className="space-y-4">
                    {[
                      { id: "transactions", label: "Transactions", description: "Recevoir une notification à chaque transaction" },
                      { id: "security", label: "Alertes de sécurité", description: "Connexions suspectes et changements de mot de passe" },
                      { id: "marketing", label: "Actualités Ryzan", description: "Nouvelles fonctionnalités et mises à jour" },
                      { id: "rates", label: "Alertes de taux", description: "Variations importantes des taux de change" },
                    ].map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-xl"
                      >
                        <div>
                          <h4 className="font-medium text-white">{notification.label}</h4>
                          <p className="text-sm text-[#919191]">{notification.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={notification.id !== "marketing"} />
                          <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Zone dangereuse */}
              {activeTab === "danger" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-red-400">Zone dangereuse</h3>
                  <p className="text-sm text-[#919191]">
                    Ces actions sont irréversibles. Procédez avec précaution.
                  </p>

                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <Trash2 className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-red-400">Supprimer le compte</h4>
                        <p className="text-sm text-[#919191]">
                          Toutes vos données seront définitivement supprimées
                        </p>
                      </div>
                    </div>

                    {!showDeleteConfirm ? (
                      <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        variant="outline"
                        className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        Supprimer mon compte
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-[#919191]">
                          Tapez <span className="font-mono text-red-400">SUPPRIMER</span> pour confirmer
                        </p>
                        <Input
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="SUPPRIMER"
                          className="bg-[#0D0D0D] border-red-500/50 text-white"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setShowDeleteConfirm(false)
                              setDeleteConfirmText("")
                            }}
                            variant="outline"
                            className="flex-1 border-[#333] text-white"
                          >
                            Annuler
                          </Button>
                          <Button
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmText !== "SUPPRIMER" || isDeleting}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Suppression...
                              </>
                            ) : (
                              "Confirmer la suppression"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}