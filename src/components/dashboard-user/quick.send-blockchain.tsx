"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  Send, ChevronDown, Loader2, CheckCircle2, Phone, X, 
  Wallet, AlertCircle, ExternalLink, ArrowRight, RefreshCw 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Imports Backend & Blockchain
import { useAuth } from "@/contexts/auth-context"
import { useTransfer } from "@/hooks/use-transfert"
import { useConversion } from "@/hooks/use-echange-rates"
import { getRecipients } from "@/app/actions/recipient-actions"
import { getExplorerUrl } from "@/lib/avalanche/config"

// Types
interface QuickRecipient {
  id: string
  name: string
  address: string
  country: string
  currency: string
  avatar: string
}

// Mapping Pays -> Devise
const COUNTRY_TO_CURRENCY: Record<string, { code: string; symbol: string; flag: string }> = {
  IN: { code: "INR", symbol: "₹", flag: "🇮🇳" },
  US: { code: "USD", symbol: "$", flag: "🇺🇸" },
  GB: { code: "GBP", symbol: "£", flag: "🇬🇧" },
  FR: { code: "EUR", symbol: "€", flag: "🇫🇷" },
  DE: { code: "EUR", symbol: "€", flag: "🇩🇪" },
  JP: { code: "JPY", symbol: "¥", flag: "🇯🇵" },
  CN: { code: "CNY", symbol: "¥", flag: "🇨🇳" },
  BR: { code: "BRL", symbol: "R$", flag: "🇧🇷" },
  MX: { code: "MXN", symbol: "$", flag: "🇲🇽" },
  MA: { code: "MAD", symbol: "DH", flag: "🇲🇦" },
  SN: { code: "XOF", symbol: "CFA", flag: "🇸🇳" },
}

const SEND_CURRENCIES = [
  { symbol: "EURC", name: "Euro Coin", icon: "💶", color: "text-blue-400", fiat: "EUR" },
  { symbol: "USDC", name: "USD Coin", icon: "💵", color: "text-green-400", fiat: "USD" },
]

type SendStatus = "IDLE" | "ESTIMATING" | "CONFIRMING" | "SENDING" | "SUCCESS" | "ERROR"

export function QuickSendBlockchain() {
  const { user } = useAuth()
  const { 
    connect, 
    sendMoney, 
    isInitialized, 
    isSending, 
    walletAddress,
    lastTx 
  } = useTransfer()

  // États des données
  const [recentRecipients, setRecentRecipients] = useState<QuickRecipient[]>([])
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(true)

  // États du formulaire
  const [amount, setAmount] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState(SEND_CURRENCIES[0])
  const [recipient, setRecipient] = useState<QuickRecipient | null>(null)
  const [manualAddress, setManualAddress] = useState("")

  // États de l'interface
  const [status, setStatus] = useState<SendStatus>("IDLE")
  const [errorMessage, setErrorMessage] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Calcul conversion
  const targetCurrency = recipient?.country 
    ? COUNTRY_TO_CURRENCY[recipient.country]?.code || "USD"
    : "INR"
  
  const { convertedAmount, isLoading: isConverting } = useConversion(
    selectedCurrency.fiat,
    targetCurrency,
    parseFloat(amount) || 0
  )

  // Charger les destinataires
  useEffect(() => {
    const loadRecipients = async () => {
      if (!user) return
      try {
        const data = await getRecipients(user.id)
        const formatted = data.map(r => ({
          id: r.id,
          name: r.name,
          address: r.walletAddress,
          country: r.country || "IN",
          currency: COUNTRY_TO_CURRENCY[r.country || "IN"]?.code || "INR",
          avatar: r.name.charAt(0).toUpperCase()
        }))
        setRecentRecipients(formatted)
      } catch (e) {
        console.error("Erreur chargement destinataires", e)
      } finally {
        setIsLoadingRecipients(false)
      }
    }
    loadRecipients()
  }, [user])

  // Frais estimés (très bas sur Avalanche)
  const estimatedFees = useMemo(() => {
    return {
      network: "~$0.01",
      ryzan: "$0.00", // Gratuit pour le hackathon
      total: "~$0.01"
    }
  }, [])

  // Sélectionner un destinataire
  const selectRecipient = (r: QuickRecipient) => {
    setRecipient(r)
    setManualAddress("")
    setStatus("IDLE")
    setErrorMessage("")
  }

  // Effacer la sélection
  const clearSelection = () => {
    setRecipient(null)
    setManualAddress("")
    setStatus("IDLE")
  }

  // Valider l'adresse manuelle
  const isValidAddress = (addr: string) => {
    return addr.startsWith("0x") && addr.length === 42
  }

  // Ouvrir la confirmation
  const handlePrepareTransfer = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage("Entrez un montant valide")
      setStatus("ERROR")
      return
    }

    const targetAddress = recipient?.address || manualAddress
    if (!targetAddress || !isValidAddress(targetAddress)) {
      setErrorMessage("Adresse wallet invalide")
      setStatus("ERROR")
      return
    }

    // Connecter le wallet si nécessaire
    if (!isInitialized) {
      setStatus("ESTIMATING")
      const connected = await connect()
      if (!connected) {
        setErrorMessage("Impossible de connecter le wallet")
        setStatus("ERROR")
        return
      }
    }

    setShowConfirmation(true)
  }

  // 🚀 ENVOYER LA TRANSACTION
  const handleConfirmTransfer = async () => {
    const targetAddress = recipient?.address || manualAddress
    
    setStatus("SENDING")
    setShowConfirmation(false)

    const result = await sendMoney({
      toAddress: targetAddress,
      amount: parseFloat(amount),
      currency: selectedCurrency.symbol as "USDC" | "EURC",
      recipientName: recipient?.name,
      recipientCountry: recipient?.country
    })

    if (result.success) {
      setStatus("SUCCESS")
    } else {
      setErrorMessage(result.error || "Erreur lors du transfert")
      setStatus("ERROR")
    }
  }

  // Reset après succès
  const handleReset = () => {
    setAmount("")
    setRecipient(null)
    setManualAddress("")
    setStatus("IDLE")
    setErrorMessage("")
  }

  // --- RENDU SUCCESS ---
  if (status === "SUCCESS" && lastTx?.txHash) {
    const targetInfo = recipient?.country ? COUNTRY_TO_CURRENCY[recipient.country] : null
    
    return (
      <div className="flex flex-col gap-6 p-6 bg-[#0D0D0D] rounded-2xl">
        {/* Success Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 bg-green-500/20 rounded-full animate-in zoom-in duration-300">
            <CheckCircle2 className="h-12 w-12 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Transfert réussi ! 🎉</h3>
            <p className="text-[#919191] mt-1">
              Votre argent est arrivé en {targetInfo?.flag} en moins de 3 secondes
            </p>
          </div>
        </div>

        {/* Récapitulatif */}
        <div className="space-y-3 p-4 bg-[#1A1A1A] rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-[#919191]">Montant envoyé</span>
            <span className="text-white font-semibold">
              {amount} {selectedCurrency.symbol}
            </span>
          </div>
          
          {convertedAmount && targetInfo && (
            <div className="flex justify-between items-center">
              <span className="text-[#919191]">Reçu par {recipient?.name}</span>
              <span className="text-green-400 font-semibold">
                {targetInfo.symbol}{convertedAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} {targetInfo.code}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-[#919191]">Frais de réseau</span>
            <span className="text-white">{estimatedFees.total}</span>
          </div>
          
          <div className="border-t border-[#333] pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-[#919191]">Transaction</span>
              <a 
                href={getExplorerUrl(lastTx.txHash, "tx", "fuji")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
              >
                {lastTx.txHash.slice(0, 10)}...{lastTx.txHash.slice(-6)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Comparaison banques traditionnelles */}
        <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20">
          <p className="text-sm text-[#919191]">
            💡 <span className="text-green-400 font-medium">Économie vs Western Union :</span> ~15€ de frais évités
          </p>
          <p className="text-xs text-[#666] mt-1">
            Temps de transfert : 2.3s vs 2-5 jours ouvrés
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 border-[#333] text-white hover:bg-[#1A1A1A]"
          >
            Nouveau transfert
          </Button>
          <Button
            onClick={() => window.location.href = "/transactions"}
            className="flex-1 bg-gradient-to-r from-red-500 to-orange-500"
          >
            Voir l'historique
          </Button>
        </div>
      </div>
    )
  }

  // --- MODAL CONFIRMATION ---
  if (showConfirmation) {
    const targetInfo = recipient?.country ? COUNTRY_TO_CURRENCY[recipient.country] : null
    
    return (
      <div className="flex flex-col gap-5 p-6 bg-[#0D0D0D] rounded-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Confirmer le transfert</h3>
          <button 
            onClick={() => setShowConfirmation(false)}
            className="p-2 hover:bg-[#1A1A1A] rounded-lg"
          >
            <X className="h-4 w-4 text-[#919191]" />
          </button>
        </div>

        {/* Résumé visuel */}
        <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <span className="text-xl">{selectedCurrency.icon}</span>
            </div>
            <div>
              <p className="text-white font-semibold">{amount} {selectedCurrency.symbol}</p>
              <p className="text-xs text-[#919191]">≈ {parseFloat(amount).toFixed(2)}€</p>
            </div>
          </div>

          <ArrowRight className="h-5 w-5 text-[#666]" />

          <div className="flex items-center gap-3">
            <div>
              <p className="text-white font-semibold text-right">
                {recipient?.name || "Destinataire"}
              </p>
              {targetInfo && convertedAmount && (
                <p className="text-xs text-green-400 text-right">
                  ≈ {targetInfo.symbol}{convertedAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} {targetInfo.code}
                </p>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-400 flex items-center justify-center text-white font-bold">
              {recipient?.avatar || "?"}
            </div>
          </div>
        </div>

        {/* Détails */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#919191]">Adresse destinataire</span>
            <span className="text-white font-mono text-xs">
              {(recipient?.address || manualAddress).slice(0, 8)}...{(recipient?.address || manualAddress).slice(-6)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#919191]">Réseau</span>
            <span className="text-white">Avalanche C-Chain</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#919191]">Frais de réseau</span>
            <span className="text-green-400">{estimatedFees.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#919191]">Temps estimé</span>
            <span className="text-white">~2-5 secondes</span>
          </div>
        </div>

        {/* Warning */}
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-200">
            Vérifiez bien l'adresse. Les transactions blockchain sont irréversibles.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowConfirmation(false)}
            className="flex-1 border-[#333] text-white"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmTransfer}
            className="flex-1 bg-gradient-to-r from-red-500 to-orange-500"
          >
            <Send className="h-4 w-4 mr-2" />
            Confirmer l'envoi
          </Button>
        </div>
      </div>
    )
  }

  // --- FORMULAIRE PRINCIPAL ---
  return (
    <div className="flex flex-col gap-5 p-6 bg-[#0D0D0D] rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1A1A1A] rounded-lg">
            <Send className="h-5 w-5 text-[#86efac]" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">Envoi Rapide</h2>
            <p className="text-xs text-[#666]">Via Avalanche • Frais ~$0.01</p>
          </div>
        </div>
        
        {!isInitialized && (
          <Button
            size="sm"
            variant="outline"
            onClick={connect}
            className="border-[#333] text-[#919191] hover:text-white"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connecter
          </Button>
        )}
      </div>

      {/* Destinataires récents */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-[#919191] uppercase tracking-wide">
          Destinataires récents
        </span>
        
        {isLoadingRecipients ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-16 h-20 bg-[#1A1A1A] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentRecipients.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#333]">
            {recentRecipients.map((r) => {
              const countryInfo = COUNTRY_TO_CURRENCY[r.country]
              return (
                <button
                  key={r.id}
                  onClick={() => selectRecipient(r)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-20 ${
                    recipient?.id === r.id
                      ? "bg-[#2A2A2A] ring-1 ring-[#86efac]/50 scale-105"
                      : "bg-[#1A1A1A] hover:bg-[#2A2A2A] opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white font-medium shadow-lg">
                      {r.avatar}
                    </div>
                    {countryInfo && (
                      <span className="absolute -bottom-1 -right-1 text-sm">
                        {countryInfo.flag}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#919191] truncate w-full text-center">
                    {r.name}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-[#666] italic py-2">
            Ajoutez des contacts dans l'onglet Destinataires
          </p>
        )}
      </div>

      {/* Sélection destinataire */}
      <div className="space-y-2">
        <Label className="text-sm text-[#919191]">Destinataire</Label>
        
        {recipient ? (
          <div className="flex items-center justify-between p-3 bg-[#1A1A1A] border border-[#86efac]/30 rounded-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {recipient.avatar}
                </div>
                {COUNTRY_TO_CURRENCY[recipient.country] && (
                  <span className="absolute -bottom-1 -right-1 text-sm">
                    {COUNTRY_TO_CURRENCY[recipient.country].flag}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{recipient.name}</p>
                <p className="text-xs text-[#919191] font-mono">
                  {recipient.address.slice(0, 6)}...{recipient.address.slice(-4)}
                </p>
              </div>
            </div>
            <button 
              onClick={clearSelection} 
              className="p-1 hover:bg-[#333] rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-[#919191] hover:text-white" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
            <Input
              placeholder="Adresse wallet (0x...)"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              className={`pl-9 bg-[#1A1A1A] border-[#333] text-white placeholder:text-[#666] font-mono text-sm ${
                manualAddress && !isValidAddress(manualAddress) 
                  ? "border-red-500/50" 
                  : "focus:border-[#86efac]/50"
              }`}
            />
            {manualAddress && !isValidAddress(manualAddress) && (
              <p className="text-xs text-red-400 mt-1">Adresse invalide</p>
            )}
          </div>
        )}
      </div>

      {/* Montant & Devise */}
      <div className="space-y-2">
        <Label className="text-sm text-[#919191]">Montant à envoyer</Label>
        
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-[#1A1A1A] border-[#333] text-white text-lg placeholder:text-[#666] focus:border-[#86efac]/50"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-32 bg-[#1A1A1A] border-[#333] text-white hover:bg-[#2A2A2A]"
              >
                <span className="mr-1">{selectedCurrency.icon}</span>
                {selectedCurrency.symbol}
                <ChevronDown className="ml-auto h-4 w-4 text-[#919191]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0D0D0D] border-[#1F1F1F]">
              {SEND_CURRENCIES.map((currency) => (
                <DropdownMenuItem
                  key={currency.symbol}
                  onClick={() => setSelectedCurrency(currency)}
                  className="text-white hover:bg-[#1A1A1A] cursor-pointer"
                >
                  <span className="mr-2">{currency.icon}</span>
                  <span className={currency.color}>{currency.symbol}</span>
                  <span className="ml-2 text-[#919191] text-xs">{currency.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Preview conversion */}
        {amount && parseFloat(amount) > 0 && (
          <div className="flex items-center justify-between p-3 bg-[#1A1A1A]/50 rounded-lg border border-[#333] border-dashed mt-2">
            <span className="text-xs text-[#919191]">
              {recipient?.name || "Le destinataire"} reçoit :
            </span>
            <div className="flex items-center gap-2">
              {isConverting ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#919191]" />
              ) : convertedAmount ? (
                <>
                  <span className="text-lg font-bold text-green-400">
                    ≈ {convertedAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-sm text-[#919191]">
                    {COUNTRY_TO_CURRENCY[recipient?.country || "IN"]?.code || "INR"}
                  </span>
                  <span className="text-lg">
                    {COUNTRY_TO_CURRENCY[recipient?.country || "IN"]?.flag || "🇮🇳"}
                  </span>
                </>
              ) : (
                <span className="text-[#666]">-</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Frais */}
      <div className="flex items-center justify-between text-xs text-[#666] px-1">
        <span>Frais de réseau</span>
        <span className="text-green-400">{estimatedFees.total}</span>
      </div>

      {/* Error */}
      {status === "ERROR" && errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}

      {/* Bouton principal */}
      <Button
        onClick={handlePrepareTransfer}
        disabled={
          !amount || 
          parseFloat(amount) <= 0 || 
          (!recipient && !isValidAddress(manualAddress)) ||
          isSending ||
          status === "SENDING"
        }
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white h-12 text-base"
      >
        {isSending || status === "SENDING" ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Transaction en cours...
          </>
        ) : status === "ESTIMATING" ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Préparation...
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            Envoyer {amount ? `${amount} ${selectedCurrency.symbol}` : ""}
          </>
        )}
      </Button>

      {/* Info Avalanche */}
      <div className="flex items-center justify-center gap-2 text-xs text-[#666]">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span>Avalanche C-Chain • Confirmation en ~3 sec</span>
      </div>
    </div>
  )
}