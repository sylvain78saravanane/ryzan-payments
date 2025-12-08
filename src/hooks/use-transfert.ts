"use client"

import { useState, useCallback, useEffect } from "react"
import { transferService, TransferRequest, TransferResult, TransferEstimate
} from "@/lib/blockchain/transfert-service"

import { getExchangeRate } from "@/lib/api/exchange-rates"

interface UseTransferState {
  isInitialized: boolean
  isConnecting: boolean
  isSending: boolean
  isEstimating: boolean
  walletAddress: string | null
  error: string | null
  lastTx: TransferResult | null
  estimate: TransferEstimate | null
}

interface UseTransferReturn extends UseTransferState {
  // Actions
  connect: () => Promise<boolean>
  sendMoney: (request: TransferRequest) => Promise<TransferResult>
  estimateTransfer: (request: TransferRequest) => Promise<TransferEstimate | null>
  resetError: () => void
  resetLastTx: () => void
  
  // Helpers
  calculateReceiverAmount: (
    amount: number, 
    fromCurrency: string, 
    toCurrency: string
  ) => Promise<number>
}

/**
 * Hook principal pour les transferts cross-border
 * 
 * @example
 * const { connect, sendMoney, isSending, lastTx } = useTransfer()
 * 
 * // Connecter le wallet
 * await connect()
 * 
 * // Envoyer 100€ à Sanjiv
 * const result = await sendMoney({
 *   toAddress: "0x...",
 *   amount: 100,
 *   currency: "EURC",
 *   recipientName: "Sanjiv",
 *   recipientCountry: "IN"
 * })
 */
export function useTransfer(): UseTransferReturn {
  const [state, setState] = useState<UseTransferState>({
    isInitialized: false,
    isConnecting: false,
    isSending: false,
    isEstimating: false,
    walletAddress: null,
    error: null,
    lastTx: null,
    estimate: null,
  })

  // Mise à jour partielle du state
  const updateState = useCallback((updates: Partial<UseTransferState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  /**
   * Connecter le wallet et initialiser le service
   */
  const connect = useCallback(async (): Promise<boolean> => {
    updateState({ isConnecting: true, error: null })
    
    try {
      const result = await transferService.initialize()
      
      if (result.success && result.address) {
        updateState({ 
          isInitialized: true, 
          walletAddress: result.address,
          isConnecting: false 
        })
        return true
      } else {
        updateState({ 
          error: result.error || "Échec de connexion", 
          isConnecting: false 
        })
        return false
      }
    } catch (error: any) {
      updateState({ 
        error: error.message || "Erreur de connexion", 
        isConnecting: false 
      })
      return false
    }
  }, [updateState])

  /**
   * Estimer les frais d'un transfert
   */
  const estimateTransfer = useCallback(async (
    request: TransferRequest
  ): Promise<TransferEstimate | null> => {
    if (!state.isInitialized) {
      const connected = await connect()
      if (!connected) return null
    }

    updateState({ isEstimating: true })
    
    try {
      const estimate = await transferService.estimateTransfer(request)
      
      // Enrichir avec le taux de change si on a un pays destinataire
      if (request.recipientCountry) {
        const targetCurrency = getTargetCurrency(request.recipientCountry)
        const sourceCurrency = request.currency === "EURC" ? "EUR" : "USD"
        
        const rate = await getExchangeRate(sourceCurrency, targetCurrency)
        estimate.exchangeRate = rate
        estimate.recipientReceives = request.amount * rate
      }

      updateState({ estimate, isEstimating: false })
      return estimate
    } catch (error: any) {
      updateState({ 
        error: error.message || "Erreur d'estimation", 
        isEstimating: false 
      })
      return null
    }
  }, [state.isInitialized, connect, updateState])

  /**
   * 🚀 Envoyer de l'argent
   */
  const sendMoney = useCallback(async (
    request: TransferRequest
  ): Promise<TransferResult> => {
    // S'assurer qu'on est connecté
    if (!state.isInitialized) {
      const connected = await connect()
      if (!connected) {
        return { success: false, error: "Wallet non connecté" }
      }
    }

    updateState({ isSending: true, error: null })

    try {
      const result = await transferService.sendTransfer(request)
      
      updateState({ 
        lastTx: result, 
        isSending: false,
        error: result.success ? null : result.error || null
      })

      return result
    } catch (error: any) {
      const errorResult: TransferResult = { 
        success: false, 
        error: error.message || "Erreur de transfert" 
      }
      
      updateState({ 
        lastTx: errorResult, 
        isSending: false, 
        error: errorResult.error || null
      })
      
      return errorResult
    }
  }, [state.isInitialized, connect, updateState])

  /**
   * Calculer le montant que le destinataire va recevoir
   */
  const calculateReceiverAmount = useCallback(async (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> => {
    if (fromCurrency === toCurrency) return amount
    
    try {
      const rate = await getExchangeRate(fromCurrency, toCurrency)
      return amount * rate
    } catch {
      return amount // Fallback
    }
  }, [])

  /**
   * Reset l'erreur
   */
  const resetError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  /**
   * Reset la dernière transaction
   */
  const resetLastTx = useCallback(() => {
    updateState({ lastTx: null })
  }, [updateState])

  // Auto-connect si wallet déjà autorisé
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window === "undefined") return
      
      const ethereum = (window as any).ethereum
      if (!ethereum) return

      try {
        const accounts = await ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          await connect()
        }
      } catch {
        // Silently fail - user will connect manually
      }
    }

    checkExistingConnection()
  }, [connect])

  return {
    // State
    ...state,
    
    // Actions
    connect,
    sendMoney,
    estimateTransfer,
    resetError,
    resetLastTx,
    calculateReceiverAmount,
  }
}

/**
 * Helper pour déterminer la devise cible selon le pays
 */
function getTargetCurrency(countryCode: string): string {
  const currencyMap: Record<string, string> = {
    IN: "INR",  // Inde
    US: "USD",  // États-Unis
    GB: "GBP",  // Royaume-Uni
    FR: "EUR",  // France
    DE: "EUR",  // Allemagne
    ES: "EUR",  // Espagne
    IT: "EUR",  // Italie
    JP: "JPY",  // Japon
    CN: "CNY",  // Chine
    BR: "BRL",  // Brésil
    MX: "MXN",  // Mexique
    CA: "CAD",  // Canada
    AU: "AUD",  // Australie
    CH: "CHF",  // Suisse
    // Afrique
    MA: "MAD",  // Maroc
    DZ: "DZD",  // Algérie
    TN: "TND",  // Tunisie
    SN: "XOF",  // Sénégal
    NG: "NGN",  // Nigeria
    ZA: "ZAR",  // Afrique du Sud
  }
  
  return currencyMap[countryCode] || "USD"
}

/**
 * Hook simplifié pour juste les soldes
 */
export function useWalletBalances(walletAddress: string | null) {
  const [balances, setBalances] = useState({
    AVAX: "0",
    USDC: "0",
    EURC: "0",
  })
  const [isLoading, setIsLoading] = useState(false)

  const refreshBalances = useCallback(async () => {
    if (!walletAddress) return
    
    setIsLoading(true)
    try {
      await transferService.initialize()
      const newBalances = await transferService.getAllBalances(walletAddress)
      setBalances(newBalances)
    } catch (error) {
      console.error("Error fetching balances:", error)
    } finally {
      setIsLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    refreshBalances()
  }, [refreshBalances])

  return { balances, isLoading, refreshBalances }
}