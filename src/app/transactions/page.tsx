"use client"

import { useState, useMemo, useEffect } from "react"
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  Search, 
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2 // Ajout du loader
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-user/dashboard-header"
import { Sidebar } from "@/components/dashboard-user/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Import de l'action serveur et du contexte d'auth
import { getUserTransactions } from "@/app/actions/transaction-actions"
import { useAuth } from "@/contexts/auth-context"

// Types mis à jour pour correspondre à l'UI
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

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20]

export default function TransactionsPage() {
  const { user } = useAuth() // Récupération de l'utilisateur connecté
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true) // État de chargement
  
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"ALL" | TransactionType>("ALL")
  const [filterStatus, setFilterStatus] = useState<"ALL" | TransactionStatus>("ALL")
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Chargement des données réelles
  useEffect(() => {
    const loadTransactions = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const dbTransactions = await getUserTransactions(user.id)
        
        // Transformation des données Prisma vers le format UI
        const formattedTransactions: Transaction[] = dbTransactions.map((tx: any) => ({
          id: tx.id,
          // Mapping simple : TRANSFER/WITHDRAWAL -> SEND, DEPOSIT -> RECEIVE
          // À adapter selon votre logique métier précise
          type: (tx.type === "DEPOSIT") ? "RECEIVE" : "SEND",
          amount: tx.amount,
          currency: tx.currency,
          toAddress: tx.toAddress,
          // fromAddress: non stocké dans ce modèle Prisma, on peut le laisser undefined ou gérer autrement
          toName: undefined, // Non stocké en base pour l'instant
          status: tx.status as TransactionStatus,
          createdAt: tx.createdAt.toISOString(), // Conversion Date -> string
          txHash: tx.txHash || "",
          fee: 0.00 // Non stocké en base, valeur par défaut
        }))

        setTransactions(formattedTransactions)
      } catch (error) {
        console.error("Failed to load transactions", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()
  }, [user])

  // Filtrage des transactions (inchangé)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = 
        !searchQuery ||
        tx.toName?.toLowerCase().includes(searchLower) ||
        tx.toAddress.toLowerCase().includes(searchLower) ||
        tx.txHash.toLowerCase().includes(searchLower) ||
        tx.amount.toString().includes(searchLower)

      const matchesType = filterType === "ALL" || tx.type === filterType
      const matchesStatus = filterStatus === "ALL" || tx.status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })
  }, [transactions, searchQuery, filterType, filterStatus])

  // Pagination (inchangé)
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredTransactions.slice(start, start + itemsPerPage)
  }, [filteredTransactions, currentPage, itemsPerPage])

  const handleFilterChange = (type: "type" | "status", value: string) => {
    setCurrentPage(1)
    if (type === "type") {
      setFilterType(value as "ALL" | TransactionType)
    } else {
      setFilterStatus(value as "ALL" | TransactionStatus)
    }
  }

  // ... (Fonctions helpers formatAddress, formatDate, getStatusIcon, etc. inchangées) ...
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
      case "COMPLETED": return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case "PENDING": return <Clock className="h-4 w-4 text-yellow-400" />
      case "FAILED": return <XCircle className="h-4 w-4 text-red-400" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusStyle = (status: TransactionStatus) => {
    switch (status) {
      case "COMPLETED": return "bg-green-500/20 text-green-400"
      case "PENDING": return "bg-yellow-500/20 text-yellow-400"
      case "FAILED": return "bg-red-500/20 text-red-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const getStatusLabel = (status: TransactionStatus) => {
    switch (status) {
      case "COMPLETED": return "Terminé"
      case "PENDING": return "En cours"
      case "FAILED": return "Échoué"
      default: return status
    }
  }

  const exportToCSV = () => {
    const headers = ["Date", "Type", "Montant", "Devise", "Adresse", "Statut", "Hash"]
    const rows = filteredTransactions.map((tx) => [
      new Date(tx.createdAt).toLocaleString("fr-FR"),
      tx.type === "SEND" ? "Envoi" : "Réception",
      tx.amount.toFixed(2),
      tx.currency,
      tx.toAddress,
      tx.status,
      tx.txHash
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

  // ... (Calcul des stats inchangé) ...
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
            {/* ... (Header et Stats Cards restent identiques) ... */}
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

            {/* Filters & Search (Code identique à l'original, juste rappel de structure) */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
               {/* ... (votre code de filtres existant) ... */}
               <div className="flex flex-1 gap-3 w-full sm:w-auto">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
                  <Input
                    placeholder="Rechercher par hash, adresse..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10 bg-[#0D0D0D] border-[#333] text-white placeholder:text-[#666]"
                  />
                </div>
                {/* ... Dropdowns filtres ... */}
               </div>
               <Button onClick={exportToCSV} variant="outline" className="bg-[#0D0D0D] border-[#333] text-white hover:bg-[#1A1A1A]">
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>

            {/* Transactions Table */}
            <div className="bg-[#0D0D0D] rounded-2xl overflow-hidden min-h-[400px]">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1F1F1F] text-sm font-medium text-[#919191]">
                <div className="col-span-3">Transaction</div>
                <div className="col-span-2">Montant</div>
                <div className="col-span-3">Destinataire / Source</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1">Statut</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              {/* Table Body */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                  <p className="text-[#919191]">Chargement des transactions...</p>
                </div>
              ) : paginatedTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Search className="h-12 w-12 text-[#333] mb-4" />
                  <p className="text-[#919191]">Aucune transaction trouvée</p>
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
                        <p className="text-xs text-[#666] font-mono" title={tx.txHash}>
                          {tx.txHash ? formatAddress(tx.txHash) : "---"}
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
                    </div>

                    {/* Recipient */}
                    <div className="col-span-3">
                      <p className="text-sm text-[#919191] font-mono break-all">
                        {tx.toAddress ? formatAddress(tx.toAddress) : "Inconnu"}
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
                      {tx.txHash && (
                        <a
                          href={`https://testnet.snowtrace.io/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 text-[#666] hover:text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination (Code identique à l'original) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
               {/* ... (votre code de pagination existant) ... */}
               <div className="flex items-center gap-2">
                <span className="text-sm text-[#919191]">
                  {filteredTransactions.length > 0 ? (
                    <>
                      {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} sur {filteredTransactions.length}
                    </>
                  ) : "0 résultat"}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="bg-[#0D0D0D] border-[#333] text-white">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="bg-[#0D0D0D] border-[#333] text-white">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}