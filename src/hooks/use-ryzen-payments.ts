"use client"

import { useState, useCallback, useEffect } from "react"
import { transferService } from "@/lib/blockchain/transfert-service"
import { createTransaction, getTransactionStats,} from "@/app/actions/blockchain-actions"
import { useAuth } from "@/contexts/auth-context"
import { getExchangeRate } from "@/lib/api/exchange-rates"

interface SendMoneyRequest {
  toAddress: string
  amount: number
  currency: "USDC" | "EURC"
  recipientName?: string
  recipientCountry?: string
}

interface SendMoneyResult {
  success: boolean
  txHash?: string
  blockNumber?: number
  error?: string
  savedToDb?: boolean
  receivedAmount?: number
  receivedCurrency?: string
}

interface UseRyzanPaymentsReturn {
  // États
  isConnected: boolean
  isConnecting: boolean
  isSending: boolean
  walletAddress: string | null
  error: string | null
  
  // Stats
  stats: {
    totalSent: number
    totalReceived: number
    totalTransactions: number
    pendingCount: number
  } | null
  
  // Dernière transaction
  lastTransaction: SendMoneyResult | null
  
  // Actions
  connectWallet: () => Promise<boolean>
  sendMoney: (request: SendMoneyRequest) => Promise<SendMoneyResult>
  refreshStats: () => Promise<void>
  calculateReceived: (amount: number, fromCurrency: string, toCountry: string) => Promise<{
    amount: number
    currency: string
    rate: number
  }>
  
  // Reset
  clearError: () => void
  clearLastTransaction: () => void
}

/**
 * 🚀 Hook principal Ryzan Payments
 * 
 * Gère tout le flow:
 * 1. Connexion wallet (Core/MetaMask)
 * 2. Envoi sur blockchain Avalanche
 * 3. Enregistrement en base de données
 * 4. Calcul des taux de change
 */
export function useRyzanPayments(): UseRyzanPaymentsReturn {
  const { user } = useAuth()
  
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastTransaction, setLastTransaction] = useState<SendMoneyResult | null>(null)
  const [stats, setStats] = useState<UseRyzanPaymentsReturn['stats']>(null)

  /**
   * Connecter le wallet
   */
  const connectWallet = useCallback(async (): Promise<boolean> => {
    setIsConnecting(true)
    setError(null)

    try {
      const result = await transferService.initialize()
      
      if (result.success && result.address) {
        setIsConnected(true)
        setWalletAddress(result.address)
        setIsConnecting(false)
        return true
      } else {
        setError(result.error || "Échec de connexion au wallet")
        setIsConnecting(false)
        return false
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion")
      setIsConnecting(false)
      return false
    }
  }, [])

  /**
   * Calculer le montant reçu selon le pays
   */
  const calculateReceived = useCallback(async (
    amount: number,
    fromCurrency: string,
    toCountry: string
  ): Promise<{ amount: number; currency: string; rate: number }> => {
    const currencyMap: Record<string, string> = {
      IN: "INR", US: "USD", GB: "GBP", FR: "EUR", DE: "EUR",
      JP: "JPY", CN: "CNY", BR: "BRL", MX: "MXN", MA: "MAD",
      SN: "XOF", NG: "NGN", ZA: "ZAR", CA: "CAD", AU: "AUD"
    }
    
    const targetCurrency = currencyMap[toCountry] || "USD"
    
    // Si même devise, pas de conversion
    if (fromCurrency === targetCurrency) {
      return { amount, currency: targetCurrency, rate: 1 }
    }

    try {
      const rate = await getExchangeRate(fromCurrency, targetCurrency)
      return {
        amount: amount * rate,
        currency: targetCurrency,
        rate
      }
    } catch {
      // Fallback avec taux approximatifs
      const fallbackRates: Record<string, number> = {
        "EUR-INR": 89.5, "USD-INR": 83.2, "EUR-USD": 1.08,
        "EUR-GBP": 0.86, "EUR-MAD": 10.8, "EUR-XOF": 655.96
      }
      const key = `${fromCurrency}-${targetCurrency}`
      const rate = fallbackRates[key] || 1
      return { amount: amount * rate, currency: targetCurrency, rate }
    }
  }, [])

  /**
   * 🚀 Envoyer de l'argent
   */
  const sendMoney = useCallback(async (
    request: SendMoneyRequest
  ): Promise<SendMoneyResult> => {
    if (!user) {
      return { success: false, error: "Utilisateur non connecté" }
    }

    // S'assurer que le wallet est connecté
    if (!isConnected) {
      const connected = await connectWallet()
      if (!connected) {
        return { success: false, error: "Wallet non connecté" }
      }
    }

    setIsSending(true)
    setError(null)

    try {
      // 1. Calculer le montant reçu
      const sourceFiat = request.currency === "EURC" ? "EUR" : "USD"
      const received = request.recipientCountry 
        ? await calculateReceived(request.amount, sourceFiat, request.recipientCountry)
        : { amount: request.amount, currency: sourceFiat, rate: 1 }

      // 2. Envoyer sur la blockchain
      console.log(`📤 Envoi de ${request.amount} ${request.currency} vers ${request.toAddress}`)
      
      const blockchainResult = await transferService.sendTransfer({
        toAddress: request.toAddress,
        amount: request.amount,
        currency: request.currency
      })

      if (!blockchainResult.success) {
        setError(blockchainResult.error || "Erreur blockchain")
        setIsSending(false)
        return { 
          success: false, 
          error: blockchainResult.error 
        }
      }

      console.log(`✅ Transaction blockchain réussie: ${blockchainResult.txHash}`)

      // 3. Enregistrer en base de données
      let savedToDb = false
      if (blockchainResult.txHash) {
        const dbResult = await createTransaction({
          userId: user.id,
          amount: request.amount,
          currency: request.currency,
          toAddress: request.toAddress,
          txHash: blockchainResult.txHash,
          type: "TRANSFER",
          status: "COMPLETED",
          recipientName: request.recipientName,
          recipientCountry: request.recipientCountry,
          exchangeRate: received.rate,
          receivedAmount: received.amount,
          receivedCurrency: received.currency
        })
        savedToDb = dbResult.success
        
        if (!savedToDb) {
          console.warn("⚠️ Transaction non sauvegardée en DB:", dbResult.error)
        }
      }

      // 4. Construire le résultat
      const result: SendMoneyResult = {
        success: true,
        txHash: blockchainResult.txHash,
        blockNumber: blockchainResult.blockNumber,
        savedToDb,
        receivedAmount: received.amount,
        receivedCurrency: received.currency
      }

      setLastTransaction(result)
      setIsSending(false)

      // 5. Rafraîchir les stats
      refreshStats()

      return result

    } catch (err: any) {
      const errorMessage = err.message || "Erreur lors du transfert"
      setError(errorMessage)
      setIsSending(false)
      return { success: false, error: errorMessage }
    }
  }, [user, isConnected, connectWallet, calculateReceived])

  /**
   * Rafraîchir les statistiques
   */
  const refreshStats = useCallback(async () => {
    if (!user) return
    
    try {
      const newStats = await getTransactionStats(user.id)
      setStats(newStats)
    } catch (err) {
      console.error("Erreur rafraîchissement stats:", err)
    }
  }, [user])

  /**
   * Effacer l'erreur
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Effacer la dernière transaction
   */
  const clearLastTransaction = useCallback(() => {
    setLastTransaction(null)
  }, [])

  // Auto-connect si wallet déjà autorisé
  useEffect(() => {
    const checkExisting = async () => {
      if (typeof window === "undefined") return
      
      const ethereum = (window as any).ethereum
      if (!ethereum) return

      try {
        const accounts = await ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          await connectWallet()
        }
      } catch {
        // Ignore - l'utilisateur connectera manuellement
      }
    }

    checkExisting()
  }, [connectWallet])

  // Charger les stats au mount
  useEffect(() => {
    if (user) {
      refreshStats()
    }
  }, [user, refreshStats])

  return {
    // États
    isConnected,
    isConnecting,
    isSending,
    walletAddress,
    error,
    stats,
    lastTransaction,
    
    // Actions
    connectWallet,
    sendMoney,
    refreshStats,
    calculateReceived,
    clearError,
    clearLastTransaction
  }
}

/**
 * Hook pour les soldes wallet
 */
export function useWalletBalances() {
  const [balances, setBalances] = useState({
    AVAX: "0.00",
    USDC: "0.00",
    EURC: "0.00"
  })
  const [isLoading, setIsLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!walletAddress) return
    
    setIsLoading(true)
    try {
      await transferService.initialize()
      const newBalances = await transferService.getAllBalances(walletAddress)
      setBalances({
        AVAX: parseFloat(newBalances.AVAX).toFixed(4),
        USDC: parseFloat(newBalances.USDC).toFixed(2),
        EURC: parseFloat(newBalances.EURC).toFixed(2)
      })
    } catch (err) {
      console.error("Erreur lecture soldes:", err)
    } finally {
      setIsLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    const init = async () => {
      try {
        const result = await transferService.initialize()
        if (result.address) {
          setWalletAddress(result.address)
        }
      } catch {
        // Ignore
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (walletAddress) {
      refresh()
    }
  }, [walletAddress, refresh])

  return { balances, isLoading, refresh, walletAddress }
}