"use client"

import { useState } from "react"
import { Send, ChevronDown, Loader2, CheckCircle2, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const currencies = [
  { symbol: "USDC", name: "USD Coin", icon: "💵", color: "text-green-400" },
  { symbol: "EURC", name: "Euro Coin", icon: "💶", color: "text-blue-400" },
  { symbol: "AVAX", name: "Avalanche", icon: "🔺", color: "text-red-400" },
]

const recentRecipients = [
  { address: "0x1234...5678", name: "Sofia", avatar: "S" },
  { address: "0xabcd...efgh", name: "Marcus", avatar: "M" },
  { address: "0x9876...5432", name: "Priya", avatar: "P" },
]

export function QuickSend() {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0])
  const [isSending, setIsSending] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSend = async () => {
    if (!recipient || !amount) return

    setIsSending(true)
    
    // Simuler l'envoi (à remplacer par la vraie logique)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSending(false)
    setSuccess(true)
    
    // Reset après 3 secondes
    setTimeout(() => {
      setSuccess(false)
      setRecipient("")
      setAmount("")
    }, 3000)
  }

  const selectRecipient = (address: string) => {
    setRecipient(address)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 bg-[#0D0D0D] rounded-2xl min-h-[320px]">
        <div className="p-4 bg-green-500/20 rounded-full">
          <CheckCircle2 className="h-12 w-12 text-green-400" />
        </div>
        <h3 className="text-xl font-medium text-white">Transaction envoyée !</h3>
        <p className="text-sm text-[#919191] text-center">
          {amount} {selectedCurrency.symbol} envoyé à {recipient.slice(0, 10)}...
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-6 bg-[#0D0D0D] rounded-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#1A1A1A] rounded-lg">
          <Send className="h-5 w-5 text-[#86efac]" />
        </div>
        <h2 className="text-lg font-medium text-white">Envoi rapide</h2>
      </div>

      {/* Recent Recipients */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-[#919191] uppercase tracking-wide">Récents</span>
        <div className="flex gap-3">
          {recentRecipients.map((r) => (
            <button
              key={r.address}
              onClick={() => selectRecipient(r.address)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                recipient === r.address 
                  ? "bg-[#2A2A2A] ring-1 ring-[#86efac]/50" 
                  : "bg-[#1A1A1A] hover:bg-[#2A2A2A]"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white font-medium">
                {r.avatar}
              </div>
              <span className="text-xs text-[#919191]">{r.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recipient Input */}
      <div className="space-y-2">
        <Label htmlFor="recipient" className="text-sm text-[#919191]">
          Adresse du destinataire
        </Label>
        <Input
          id="recipient"
          placeholder="0x..."
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="bg-[#1A1A1A] border-[#333] text-white placeholder:text-[#666] focus:border-[#86efac]/50"
        />
      </div>

      {/* Amount + Currency */}
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-sm text-[#919191]">
          Montant
        </Label>
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
              <Button 
                variant="outline" 
                className="w-32 bg-[#1A1A1A] border-[#333] text-white hover:bg-[#2A2A2A] hover:text-white"
              >
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
      </div>

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={!recipient || !amount || isSending}
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white mt-2"
      >
        {isSending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Envoyer {amount && selectedCurrency.symbol ? `${amount} ${selectedCurrency.symbol}` : ""}
          </>
        )}
      </Button>
    </div>
  )
}