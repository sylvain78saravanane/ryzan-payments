"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpRight, ArrowDownLeft, Clock, ChevronRight, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { getRecentTransactions, TransactionRecord } from "@/app/actions/blockchain-actions"

// Mapping type pour l'affichage
type DisplayType = "SEND" | "RECEIVE"
type DisplayStatus = "COMPLETED" | "PENDING" | "FAILED"

interface DisplayTransaction {
  id: string
  type: DisplayType
  amount: string
  currency: string
  recipient: string
  recipientName?: string
  status: DisplayStatus
  timestamp: string
  txHash: string | null
}

const getStatusColor = (status: DisplayStatus) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-500/20 text-green-400"
    case "PENDING":
      return "bg-yellow-500/20 text-yellow-400"
    case "FAILED":
      return "bg-red-500/20 text-red-400"
  }
}

const getStatusLabel = (status: DisplayStatus) => {
  switch (status) {
    case "COMPLETED":
      return "Terminé"
    case "PENDING":
      return "En cours"
    case "FAILED":
      return "Échoué"
  }
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays === 1) return "Hier"
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const formatAddress = (address: string): string => {
  if (!address) return "Inconnu"
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function RecentTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTransactions = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const dbTransactions = await getRecentTransactions(user.id, 5)
        
        // Transformer les données DB vers le format d'affichage
        const formatted: DisplayTransaction[] = dbTransactions.map((tx: TransactionRecord) => ({
          id: tx.id,
          type: tx.type === "DEPOSIT" ? "RECEIVE" : "SEND",
          amount: tx.amount.toFixed(2),
          currency: tx.currency,
          recipient: tx.toAddress,
          status: tx.status as DisplayStatus,
          timestamp: formatTimeAgo(new Date(tx.createdAt)),
          txHash: tx.txHash
        }))

        setTransactions(formatted)
      } catch (error) {
        console.error("Erreur chargement transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6 bg-[#0D0D0D] rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Transactions récentes</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-[#919191]">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-[#0D0D0D] rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">Transactions récentes</h2>
        <Link href="/transactions">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[#919191] hover:text-white hover:bg-[#1A1A1A]"
          >
            Voir tout
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Transactions List */}
      <div className="flex flex-col">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-12 w-12 text-[#333] mb-4" />
            <p className="text-[#919191]">Aucune transaction pour le moment</p>
            <p className="text-sm text-[#666]">Vos transactions apparaîtront ici</p>
          </div>
        ) : (
          transactions.map((tx, index) => (
            <div
              key={tx.id}
              className={`flex items-center justify-between py-4 ${
                index !== transactions.length - 1 ? "border-b border-[#1F1F1F]" : ""
              }`}
            >
              {/* Left: Icon + Info */}
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${
                  tx.type === "SEND" 
                    ? "bg-red-500/20" 
                    : "bg-green-500/20"
                }`}>
                  {tx.type === "SEND" ? (
                    <ArrowUpRight className="h-5 w-5 text-red-400" />
                  ) : (
                    <ArrowDownLeft className="h-5 w-5 text-green-400" />
                  )}
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {tx.type === "SEND" ? "Envoyé" : "Reçu"}
                    </span>
                    {tx.recipientName && (
                      <span className="text-[#919191]">à {tx.recipientName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#666]">
                    <span className="font-mono">{formatAddress(tx.recipient)}</span>
                    <span>•</span>
                    <span>{tx.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Right: Amount + Status */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className={`font-semibold ${
                    tx.type === "SEND" ? "text-red-400" : "text-green-400"
                  }`}>
                    {tx.type === "SEND" ? "-" : "+"}{tx.amount} {tx.currency}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(tx.status)}`}>
                    {getStatusLabel(tx.status)}
                  </span>
                </div>
                
                {tx.txHash && (
                  <a
                    href={`https://testnet.snowtrace.io/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
                    title="Voir sur Snowtrace"
                  >
                    <ExternalLink className="h-4 w-4 text-[#666] hover:text-[#919191]" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* See More Button */}
      {transactions.length > 0 && (
        <Link href="/transactions" className="w-full">
          <Button 
            variant="outline" 
            className="w-full border-[#333] text-[#919191] hover:text-white hover:border-[#86efac]/50 hover:bg-[#1A1A1A]"
          >
            Voir toutes les transactions
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  )
}