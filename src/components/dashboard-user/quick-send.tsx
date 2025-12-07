"use client"

import { useState, useEffect } from "react"
import { Send, ChevronDown, Loader2, CheckCircle2, Phone, X, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Imports Backend & Contextes
import { useAuth } from "@/contexts/auth-context"
import { resolveRecipientByPhone } from "@/app/actions/payment-actions"
import { getRecipients } from "@/app/actions/recipient-actions"
import { useConversion } from "@/hooks/use-echange-rates"

// Mapping Pays -> Devise (pour l'estimation)
const COUNTRY_CURRENCIES: Record<string, string> = {
  IN: "INR", // Inde
  FR: "EUR", // France
  US: "USD", // USA
  GB: "GBP", // Royaume-Uni
  DE: "EUR", ES: "EUR", IT: "EUR", // Europe
  JP: "JPY", // Japon
  CN: "CNY", // Chine
  CA: "CAD", // Canada
  BR: "BRL", // Brésil
  MX: "MXN", // Mexique
}

const currencies = [
  { symbol: "USDC", name: "USD Coin", icon: "💵", color: "text-green-400", fiat: "USD" },
  { symbol: "EURC", name: "Euro Coin", icon: "💶", color: "text-blue-400", fiat: "EUR" },
  { symbol: "AVAX", name: "Avalanche", icon: "🔺", color: "text-red-400", fiat: "USD" },
]

// Type local pour l'affichage
interface QuickRecipient {
  id: string
  name: string
  address: string
  currency: string
  avatar: string
}

export function QuickSend() {
  const { user } = useAuth()
  
  // États des données
  const [recentRecipients, setRecentRecipients] = useState<QuickRecipient[]>([])
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(true)

  // États du formulaire
  const [phoneNumber, setPhoneNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[1]) // EURC par défaut
  
  // États de l'interface
  const [status, setStatus] = useState<"IDLE" | "RESOLVING" | "SENDING" | "SUCCESS" | "ERROR">("IDLE")
  const [statusMessage, setStatusMessage] = useState("")
  
  // Destinataire sélectionné
  const [recipient, setRecipient] = useState<{name: string, address: string, currency?: string} | null>(null)

  // --- 1. CHARGEMENT DYNAMIQUE DES DESTINATAIRES ---
  useEffect(() => {
    const loadRecipients = async () => {
      if (!user) return
      try {
        const data = await getRecipients(user.id)
        
        // Transformation des données DB -> Format QuickSend
        const formatted = data.map(r => ({
          id: r.id,
          name: r.name,
          address: r.walletAddress,
          // Si le pays est connu, on déduit la devise, sinon USD par défaut
          currency: (r.country && COUNTRY_CURRENCIES[r.country]) ? COUNTRY_CURRENCIES[r.country] : "USD",
          avatar: r.name.charAt(0).toUpperCase()
        }))
        
        setRecentRecipients(formatted)
      } catch (e) {
        console.error("Erreur chargement favoris", e)
      } finally {
        setIsLoadingRecipients(false)
      }
    }
    
    loadRecipients()
  }, [user])

  // --- 2. CALCUL CONVERSION ---
  const targetCurrency = recipient?.currency || "INR"
  const { convertedAmount, isLoading: isConverting } = useConversion(
    selectedCurrency.fiat, 
    targetCurrency, 
    parseFloat(amount) || 0
  )

  // --- ACTIONS ---
  const selectRecent = (r: QuickRecipient) => {
    setRecipient({ name: r.name, address: r.address, currency: r.currency })
    setPhoneNumber("")
    setStatus("IDLE")
  }

  const clearSelection = () => {
    setRecipient(null)
    setStatus("IDLE")
  }

  const handleSend = async () => {
    if (!amount) return

    let targetAddress = recipient?.address
    let targetName = recipient?.name

    // Cas : Numéro de téléphone saisi
    if (!targetAddress && phoneNumber) {
      setStatus("RESOLVING")
      const resolution = await resolveRecipientByPhone(phoneNumber)
      
      if (!resolution.success || !resolution.address) {
        setStatus("ERROR")
        setStatusMessage(resolution.error || "Numéro inconnu")
        return
      }
      
      targetAddress = resolution.address
      targetName = resolution.name || "Inconnu"
      // On assume INR par défaut pour les numéros inconnus dans cette démo
      setRecipient({ name: targetName, address: targetAddress, currency: "INR" })
    }

    if (!targetAddress) return

    setStatus("SENDING")
    
    // TODO: Appel Blockchain réel ici
    console.log(`Envoi de ${amount} ${selectedCurrency.symbol} vers ${targetAddress}`)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setStatus("SUCCESS")
    
    setTimeout(() => {
      setStatus("IDLE")
      setPhoneNumber("")
      setAmount("")
      setRecipient(null)
    }, 4000)
  }

  // --- VUE SUCCÈS ---
  if (status === "SUCCESS") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 bg-[#0D0D0D] rounded-2xl min-h-[320px]">
        <div className="p-4 bg-green-500/20 rounded-full">
          <CheckCircle2 className="h-12 w-12 text-green-400" />
        </div>
        <h3 className="text-xl font-medium text-white">Envoyé avec succès !</h3>
        <div className="text-center space-y-1">
          <p className="text-sm text-[#919191]">
            <span className="text-white font-medium">{amount} {selectedCurrency.symbol}</span> envoyés à {recipient?.name}
          </p>
          {convertedAmount && (
            <p className="text-xs text-green-400">
              Reçoit ≈ {convertedAmount.toLocaleString('fr-FR', { style: 'currency', currency: targetCurrency })}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-6 bg-[#0D0D0D] rounded-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#1A1A1A] rounded-lg">
          <Send className="h-5 w-5 text-[#86efac]" />
        </div>
        <h2 className="text-lg font-medium text-white">Envoi Rapide</h2>
      </div>

      {/* --- LISTE DYNAMIQUE --- */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-[#919191] uppercase tracking-wide">Récents</span>
        
        {isLoadingRecipients ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-16 h-20 bg-[#1A1A1A] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentRecipients.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#333]">
            {recentRecipients.map((r) => (
              <button
                key={r.id}
                onClick={() => selectRecent(r)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-20 ${
                  recipient?.address === r.address 
                    ? "bg-[#2A2A2A] ring-1 ring-[#86efac]/50 scale-105" 
                    : "bg-[#1A1A1A] hover:bg-[#2A2A2A] opacity-80 hover:opacity-100"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white font-medium shadow-lg">
                  {r.avatar}
                </div>
                <span className="text-xs text-[#919191] truncate w-full text-center">{r.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#666] italic py-2">Aucun contact récent. Ajoutez-en dans l'onglet Destinataires.</p>
        )}
      </div>

      {/* --- SÉLECTION DESTINATAIRE --- */}
      <div className="space-y-2">
        <Label className="text-sm text-[#919191]">Destinataire</Label>
        {recipient ? (
          <div className="flex items-center justify-between p-3 bg-[#1A1A1A] border border-[#86efac]/30 rounded-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {recipient.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{recipient.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-[#919191] font-mono truncate max-w-[120px]">
                    {recipient.address.startsWith("0x") ? `${recipient.address.slice(0, 6)}...${recipient.address.slice(-4)}` : recipient.address}
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#2A2A2A] rounded text-[#919191] whitespace-nowrap">
                    {recipient.currency}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={clearSelection} className="p-1 hover:bg-[#333] rounded-full transition-colors">
              <X className="h-4 w-4 text-[#919191] hover:text-white" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
            <Input
              placeholder="Numéro de téléphone (+33...)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="pl-9 bg-[#1A1A1A] border-[#333] text-white placeholder:text-[#666] focus:border-[#86efac]/50"
            />
          </div>
        )}
      </div>

      {/* --- MONTANT & CONVERSION --- */}
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-sm text-[#919191]">Montant à envoyer</Label>
        
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-[#1A1A1A] border-[#333] text-white placeholder:text-[#666] focus:border-[#86efac]/50"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-32 bg-[#1A1A1A] border-[#333] text-white hover:bg-[#2A2A2A] hover:text-white">
                  <span className="mr-1">{selectedCurrency.icon}</span>
                  {selectedCurrency.symbol}
                  <ChevronDown className="ml-auto h-4 w-4 text-[#919191]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0D0D0D] border-[#1F1F1F]">
                {currencies.map((currency) => (
                  <DropdownMenuItem
                    key={currency.symbol}
                    onClick={() => setSelectedCurrency(currency)}
                    className="text-white hover:bg-[#1A1A1A] focus:bg-[#1A1A1A] cursor-pointer"
                  >
                    <span className="mr-2">{currency.icon}</span>
                    <span className={currency.color}>{currency.symbol}</span>
                    <span className="ml-2 text-[#919191] text-xs">{currency.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-[#1A1A1A]/50 rounded-lg border border-[#333] border-dashed">
            <span className="text-xs text-[#919191]">Le destinataire reçoit :</span>
            <div className="flex items-center gap-2">
              {isConverting ? (
                <Loader2 className="h-3 w-3 animate-spin text-[#919191]" />
              ) : amount && convertedAmount ? (
                <>
                  <span className="text-sm font-medium text-green-400">
                    ≈ {convertedAmount.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-bold text-[#919191]">{targetCurrency}</span>
                </>
              ) : (
                <span className="text-sm text-[#666]">-</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- BOUTON D'ACTION --- */}
      <div className="flex flex-col gap-2 mt-2">
        {status === "ERROR" && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded-lg">
            <X className="h-3 w-3" />
            {statusMessage}
          </div>
        )}
        
        <Button
          onClick={handleSend}
          disabled={!amount || (!phoneNumber && !recipient) || status === "RESOLVING" || status === "SENDING"}
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
        >
          {status === "RESOLVING" ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recherche...</>
          ) : status === "SENDING" ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...</>
          ) : (
            <><Send className="mr-2 h-4 w-4" /> Envoyer {amount ? `${amount} ${selectedCurrency.symbol}` : ""}</>
          )}
        </Button>
      </div>
    </div>
  )
}