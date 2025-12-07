"use client"

import { useState, useMemo } from "react"
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-user/dashboard-header"
import { Sidebar } from "@/components/dashboard-user/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

// Types
type TransactionType = "SEND" | "RECEIVE"
type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED"

interface Transaction {
  id: string
  type: TransactionType
  amount: number
  currency: string
  fromAddress?: string
  toAddress: string
  toName?: string
  status: TransactionStatus
  createdAt: string
  txHash: string
  fee?: number
}

// Données simulées (à remplacer par API)
const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "SEND",
    amount: 200.00,
    currency: "USDC",
    toAddress: "0x1234567890abcdef1234567890abcdef12345678",
    toName: "Sofia",
    status: "COMPLETED",
    createdAt: "2025-01-15T14:30:00Z",
    txHash: "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456",
    fee: 0.008
  },
  {
    id: "2",
    type: "RECEIVE",
    amount: 500.00,
    currency: "EURC",
    fromAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    toAddress: "0x9876543210fedcba9876543210fedcba98765432",
    toName: "Marcus",
    status: "COMPLETED",
    createdAt: "2025-01-15T09:15:00Z",
    txHash: "0xdef456789012345678901234567890abcdef1234567890abcdef123456789012",
    fee: 0.005
  },
  {
    id: "3",
    type: "SEND",
    amount: 150.00,
    currency: "USDC",
    toAddress: "0x5555444433332222111100009999888877776666",
    toName: "Priya",
    status: "PENDING",
    createdAt: "2025-01-14T16:45:00Z",
    txHash: "0x789012345678901234567890abcdef1234567890abcdef123456789012345678",
    fee: 0.006
  },
  {
    id: "4",
    type: "SEND",
    amount: 75.50,
    currency: "USDC",
    toAddress: "0x1111222233334444555566667777888899990000",
    status: "COMPLETED",
    createdAt: "2025-01-13T11:20:00Z",
    txHash: "0x012345678901234567890abcdef1234567890abcdef1234567890123456789ab",
    fee: 0.004
  },
  {
    id: "5",
    type: "RECEIVE",
    amount: 1000.00,
    currency: "USDC",
    fromAddress: "0xfedcba9876543210fedcba9876543210fedcba98",
    toAddress: "0x9876543210fedcba9876543210fedcba98765432",
    toName: "Entreprise XYZ",
    status: "COMPLETED",
    createdAt: "2025-01-12T08:00:00Z",
    txHash: "0x345678901234567890abcdef1234567890abcdef1234567890123456789abcde",
    fee: 0.010
  },
  {
    id: "6",
    type: "SEND",
    amount: 50.00,
    currency: "AVAX",
    toAddress: "0x2222333344445555666677778888999900001111",
    toName: "Test Wallet",
    status: "FAILED",
    createdAt: "2025-01-11T19:30:00Z",
    txHash: "0x567890123456789012345678901234567890abcdef1234567890123456789abc",
    fee: 0.002
  },
  {
    id: "7",
    type: "SEND",
    amount: 300.00,
    currency: "USDC",
    toAddress: "0x3333444455556666777788889999000011112222",
    toName: "Sofia",
    status: "COMPLETED",
    createdAt: "2025-01-10T15:45:00Z",
    txHash: "0x678901234567890123456789012345678901234567890abcdef1234567890123",
    fee: 0.007
  },
  {
    id: "8",
    type: "RECEIVE",
    amount: 250.00,
    currency: "EURC",
    fromAddress: "0x4444555566667777888899990000111122223333",
    toAddress: "0x9876543210fedcba9876543210fedcba98765432",
    status: "COMPLETED",
    createdAt: "2025-01-09T12:00:00Z",
    txHash: "0x789012345678901234567890123456789012345678901234567890abcdef12345",
    fee: 0.005
  },
  {
    id: "9",
    type: "SEND",
    amount: 125.00,
    currency: "USDC",
    toAddress: "0x5555666677778888999900001111222233334444",
    toName: "Priya",
    status: "COMPLETED",
    createdAt: "2025-01-08T10:30:00Z",
    txHash: "0x890123456789012345678901234567890123456789012345678901234567890ab",
    fee: 0.006
  },
  {
    id: "10",
    type: "SEND",
    amount: 80.00,
    currency: "USDC",
    toAddress: "0x6666777788889999000011112222333344445555",
    status: "COMPLETED",
    createdAt: "2025-01-07T14:15:00Z",
    txHash: "0x901234567890123456789012345678901234567890123456789012345678901234",
    fee: 0.004
  },
  {
    id: "11",
    type: "RECEIVE",
    amount: 175.00,
    currency: "USDC",
    fromAddress: "0x7777888899990000111122223333444455556666",
    toAddress: "0x9876543210fedcba9876543210fedcba98765432",
    toName: "Marcus",
    status: "COMPLETED",
    createdAt: "2025-01-06T09:00:00Z",
    txHash: "0xa12345678901234567890123456789012345678901234567890123456789012345",
    fee: 0.005
  },
  {
    id: "12",
    type: "SEND",
    amount: 450.00,
    currency: "USDC",
    toAddress: "0x8888999900001111222233334444555566667777",
    toName: "Sofia",
    status: "COMPLETED",
    createdAt: "2025-01-05T16:30:00Z",
    txHash: "0xb23456789012345678901234567890123456789012345678901234567890123456",
    fee: 0.009
  },
]

const ITEMS_PER_PAGE_OPTIONS = [5, 10]

export default function TransactionsPage() {
  const [transactions] = useState<Transaction[]>(mockTransactions)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"ALL" | TransactionType>("ALL")
  const [filterStatus, setFilterStatus] = useState<"ALL" | TransactionStatus>("ALL")
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)

  // Filtrage des transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filtre par recherche
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = 
        !searchQuery ||
        tx.toName?.toLowerCase().includes(searchLower) ||
        tx.toAddress.toLowerCase().includes(searchLower) ||
        tx.txHash.toLowerCase().includes(searchLower) ||
        tx.amount.toString().includes(searchLower)

      // Filtre par type
      const matchesType = filterType === "ALL" || tx.type === filterType

      // Filtre par statut
      const matchesStatus = filterStatus === "ALL" || tx.status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })
  }, [transactions, searchQuery, filterType, filterStatus])

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredTransactions.slice(start, start + itemsPerPage)
  }, [filteredTransactions, currentPage, itemsPerPage])

  // Reset page quand les filtres changent
  const handleFilterChange = (type: "type" | "status", value: string) => {
    setCurrentPage(1)
    if (type === "type") {
      setFilterType(value as "ALL" | TransactionType)
    } else {
      setFilterStatus(value as "ALL" | TransactionStatus)
    }
  }

  // Export CSV
  const exportToCSV = () => {
    const headers = ["Date", "Type", "Montant", "Devise", "Destinataire", "Adresse", "Statut", "Hash", "Frais"]
    const rows = filteredTransactions.map((tx) => [
      new Date(tx.createdAt).toLocaleString("fr-FR"),
      tx.type === "SEND" ? "Envoi" : "Réception",
      tx.amount.toFixed(2),
      tx.currency,
      tx.toName || "-",
      tx.type === "SEND" ? tx.toAddress : tx.fromAddress || "-",
      tx.status,
      tx.txHash,
      tx.fee?.toFixed(4) || "-"
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `ryzan-transactions-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  // Helpers
  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-400" />
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-400" />
    }
  }

  const getStatusStyle = (status: TransactionStatus) => {
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

  // Stats rapides
  const stats = useMemo(() => {
    const sent = transactions.filter(t => t.type === "SEND" && t.status === "COMPLETED")
    const received = transactions.filter(t => t.type === "RECEIVE" && t.status === "COMPLETED")
    
    return {
      totalSent: sent.reduce((acc, t) => acc + t.amount, 0),
      totalReceived: received.reduce((acc, t) => acc + t.amount, 0),
      totalTransactions: transactions.length,
      pendingCount: transactions.filter(t => t.status === "PENDING").length
    }
  }, [transactions])

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
      <DashboardHeader />

      <div className="h-full overflow-y-auto no-scrollbar">
        <main className="flex gap-6 p-6 pt-24 min-h-full">
          <Sidebar />

          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-white">Transactions</h1>
              <p className="text-[#919191]">Historique complet de vos transferts</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-[#0D0D0D] rounded-xl">
                <p className="text-sm text-[#919191]">Total envoyé</p>
                <p className="text-xl font-semibold text-red-400">-${stats.totalSent.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-[#0D0D0D] rounded-xl">
                <p className="text-sm text-[#919191]">Total reçu</p>
                <p className="text-xl font-semibold text-green-400">+${stats.totalReceived.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-[#0D0D0D] rounded-xl">
                <p className="text-sm text-[#919191]">Transactions</p>
                <p className="text-xl font-semibold text-white">{stats.totalTransactions}</p>
              </div>
              <div className="p-4 bg-[#0D0D0D] rounded-xl">
                <p className="text-sm text-[#919191]">En attente</p>
                <p className="text-xl font-semibold text-yellow-400">{stats.pendingCount}</p>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-1 gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
                  <Input
                    placeholder="Rechercher par nom, adresse, hash..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10 bg-[#0D0D0D] border-[#333] text-white placeholder:text-[#666]"
                  />
                </div>

                {/* Filter Type */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-[#0D0D0D] border-[#333] text-white hover:bg-[#1A1A1A]">
                      <Filter className="h-4 w-4 mr-2" />
                      {filterType === "ALL" ? "Type" : filterType === "SEND" ? "Envois" : "Réceptions"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#0D0D0D] border-[#333]">
                    <DropdownMenuLabel className="text-[#919191]">Type</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#333]" />
                    <DropdownMenuItem 
                      onClick={() => handleFilterChange("type", "ALL")}
                      className="text-white hover:bg-[#1A1A1A] cursor-pointer"
                    >
                      Tous
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleFilterChange("type", "SEND")}
                      className="text-white hover:bg-[#1A1A1A] cursor-pointer"
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2 text-red-400" />
                      Envois
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleFilterChange("type", "RECEIVE")}
                      className="text-white hover:bg-[#1A1A1A] cursor-pointer"
                    >
                      <ArrowDownLeft className="h-4 w-4 mr-2 text-green-400" />
                      Réceptions
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Filter Status */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-[#0D0D0D] border-[#333] text-white hover:bg-[#1A1A1A]">
                      <Calendar className="h-4 w-4 mr-2" />
                      {filterStatus === "ALL" ? "Statut" : getStatusLabel(filterStatus)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#0D0D0D] border-[#333]">
                    <DropdownMenuLabel className="text-[#919191]">Statut</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#333]" />
                    <DropdownMenuItem 
                      onClick={() => handleFilterChange("status", "ALL")}
                      className="text-white hover:bg-[#1A1A1A] cursor-pointer"
                    >
                      Tous
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleFilterChange("status", "COMPLETED")}
                      className="text-white hover:bg-[#1A1A1A] cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />
                      Terminé
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleFilterChange("status", "PENDING")}
                      className="text-white hover:bg-[#1A1A1A] cursor-pointer"
                    >
                      <Clock className="h-4 w-4 mr-2 text-yellow-400" />
                      En cours
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleFilterChange("status", "FAILED")}
                      className="text-white hover:bg-[#1A1A1A] cursor-pointer"
                    >
                      <XCircle className="h-4 w-4 mr-2 text-red-400" />
                      Échoué
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Export Button */}
              <Button 
                onClick={exportToCSV}
                variant="outline" 
                className="bg-[#0D0D0D] border-[#333] text-white hover:bg-[#1A1A1A] hover:border-[#86efac]/50"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>

            {/* Transactions Table */}
            <div className="bg-[#0D0D0D] rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1F1F1F] text-sm font-medium text-[#919191]">
                <div className="col-span-3">Transaction</div>
                <div className="col-span-2">Montant</div>
                <div className="col-span-3">Destinataire</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1">Statut</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              {/* Table Body */}
              {paginatedTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Search className="h-12 w-12 text-[#333] mb-4" />
                  <p className="text-[#919191]">Aucune transaction trouvée</p>
                  <p className="text-sm text-[#666]">Essayez de modifier vos filtres</p>
                </div>
              ) : (
                paginatedTransactions.map((tx) => (
                  <div 
                    key={tx.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1F1F1F] hover:bg-[#1A1A1A]/50 transition-colors items-center"
                  >
                    {/* Type + Hash */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        tx.type === "SEND" ? "bg-red-500/20" : "bg-green-500/20"
                      }`}>
                        {tx.type === "SEND" ? (
                          <ArrowUpRight className="h-5 w-5 text-red-400" />
                        ) : (
                          <ArrowDownLeft className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {tx.type === "SEND" ? "Envoi" : "Réception"}
                        </p>
                        <p className="text-xs text-[#666] font-mono">
                          {formatAddress(tx.txHash)}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="col-span-2">
                      <p className={`font-semibold ${
                        tx.type === "SEND" ? "text-red-400" : "text-green-400"
                      }`}>
                        {tx.type === "SEND" ? "-" : "+"}{tx.amount.toFixed(2)} {tx.currency}
                      </p>
                      {tx.fee && (
                        <p className="text-xs text-[#666]">Frais: ${tx.fee.toFixed(4)}</p>
                      )}
                    </div>

                    {/* Recipient */}
                    <div className="col-span-3">
                      {tx.toName && (
                        <p className="font-medium text-white">{tx.toName}</p>
                      )}
                      <p className="text-sm text-[#919191] font-mono">
                        {formatAddress(tx.type === "SEND" ? tx.toAddress : (tx.fromAddress || tx.toAddress))}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="col-span-2">
                      <p className="text-sm text-white">{formatDate(tx.createdAt)}</p>
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(tx.status)}`}>
                        {getStatusIcon(tx.status)}
                        <span className="hidden lg:inline">{getStatusLabel(tx.status)}</span>
                      </span>
                    </div>

                    {/* Action */}
                    <div className="col-span-1 text-right">
                      <a
                        href={`https://testnet.snowtrace.io/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-[#919191] hover:text-white" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Items per page */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#919191]">Afficher</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-[#0D0D0D] border-[#333] text-white hover:bg-[#1A1A1A]">
                      {itemsPerPage}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#0D0D0D] border-[#333]">
                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => {
                          setItemsPerPage(option)
                          setCurrentPage(1)
                        }}
                        className="text-white hover:bg-[#1A1A1A] cursor-pointer"
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-sm text-[#919191]">par page</span>
              </div>

              {/* Page info */}
              <span className="text-sm text-[#919191]">
                {filteredTransactions.length > 0 ? (
                  <>
                    {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} sur {filteredTransactions.length}
                  </>
                ) : (
                  "0 résultat"
                )}
              </span>

              {/* Page controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="bg-[#0D0D0D] border-[#333] text-white hover:bg-[#1A1A1A] disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 p-0 ${
                          currentPage === pageNum
                            ? "bg-white text-black border-white"
                            : "bg-[#0D0D0D] border-[#333] text-white hover:bg-[#1A1A1A]"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="bg-[#0D0D0D] border-[#333] text-white hover:bg-[#1A1A1A] disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}