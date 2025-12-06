"use client"

import Link from "next/link"
import { ArrowUpRight, ArrowDownLeft, Clock, ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from "@/components/ui/button"

// Types pour les transactions
type TransactionType = "SEND" | "RECEIVE"
type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED"

interface Transaction {
  id: string
  type: TransactionType
  amount: string
  currency: string
  recipient: string
  recipientName?: string
  status: TransactionStatus
  timestamp: string
  txHash: string
}

// Données simulées (à remplacer par les vraies données)
const recentTransactions: Transaction[] = [
  {
    id: "1",
    type: "SEND",
    amount: "200.00",
    currency: "USDC",
    recipient: "0x1234...5678",
    recipientName: "Sofia",
    status: "COMPLETED",
    timestamp: "Il y a 2 heures",
    txHash: "0xabc123..."
  },
  {
    id: "2",
    type: "RECEIVE",
    amount: "500.00",
    currency: "EURC",
    recipient: "0xabcd...efgh",
    recipientName: "Marcus",
    status: "COMPLETED",
    timestamp: "Il y a 5 heures",
    txHash: "0xdef456..."
  },
  {
    id: "3",
    type: "SEND",
    amount: "150.00",
    currency: "USDC",
    recipient: "0x9876...5432",
    recipientName: "Priya",
    status: "PENDING",
    timestamp: "Il y a 1 jour",
    txHash: "0xghi789..."
  },
  {
    id: "4",
    type: "SEND",
    amount: "75.50",
    currency: "USDC",
    recipient: "0x5555...4444",
    status: "COMPLETED",
    timestamp: "Il y a 2 jours",
    txHash: "0xjkl012..."
  },
]

const getStatusColor = (status: TransactionStatus) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-500/20 text-green-400"
    case "PENDING":
      return "bg-yellow-500/20 text-yellow-400"
    case "FAILED":
      return "bg-red-500/20 text-red-400"
  }
}

const getStatusLabel = (status: TransactionStatus) => {
  switch (status) {
    case "COMPLETED":
      return "Terminé"
    case "PENDING":
      return "En cours"
    case "FAILED":
      return "Échoué"
  }
}

export function RecentTransactions() {
  return (
    <div className="flex flex-col gap-4 p-6 bg-[#0D0D0D] rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">Transactions récentes</h2>
        <Link href="/dashboard/transactions">
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
        {recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-12 w-12 text-[#333] mb-4" />
            <p className="text-[#919191]">Aucune transaction pour le moment</p>
            <p className="text-sm text-[#666]">Vos transactions apparaîtront ici</p>
          </div>
        ) : (
          recentTransactions.map((tx, index) => (
            <div
              key={tx.id}
              className={`flex items-center justify-between py-4 ${
                index !== recentTransactions.length - 1 ? "border-b border-[#1F1F1F]" : ""
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
                      {tx.type === "SEND" ? "Envoyé à" : "Reçu de"}
                    </span>
                    {tx.recipientName && (
                      <span className="text-[#919191]">{tx.recipientName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#666]">
                    <span>{tx.recipient}</span>
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
                
                <a
                  href={`https://snowtrace.io/tx/${tx.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-[#666] hover:text-[#919191]" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* See More Button */}
      {recentTransactions.length > 0 && (
        <Link href="/dashboard/transactions" className="w-full">
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