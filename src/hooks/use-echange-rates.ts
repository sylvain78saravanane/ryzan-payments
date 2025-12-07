"use client"

import { useState, useEffect, useCallback } from "react"
import { getCurrentRates, getExchangeRate } from "@/lib/api/exchange-rates"

interface UseExchangeRatesOptions {
  currencies?: string[]
  autoRefresh?: boolean
  refreshInterval?: number // en millisecondes
}

interface UseExchangeRatesReturn {
  rates: Record<string, number>
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => Promise<void>
  convert: (amount: number, toCurrency: string) => number | null
}

/**
 * Hook personnalisé pour récupérer et utiliser les taux de change
 * Base: EUR
 */
export function useExchangeRates(
  options: UseExchangeRatesOptions = {}
): UseExchangeRatesReturn {
  const {
    currencies = ["INR", "USD", "GBP", "JPY", "CNY"],
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000 // 5 minutes par défaut
  } = options

  const [rates, setRates] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchRates = useCallback(async () => {
    try {
      setError(null)
      const data = await getCurrentRates(currencies)
      setRates(data.rates)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching exchange rates:", err)
      setError("Impossible de récupérer les taux de change")
    } finally {
      setIsLoading(false)
    }
  }, [currencies])

  useEffect(() => {
    fetchRates()

    if (autoRefresh) {
      const interval = setInterval(fetchRates, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchRates, autoRefresh, refreshInterval])

  const convert = useCallback(
    (amount: number, toCurrency: string): number | null => {
      const rate = rates[toCurrency]
      if (!rate) return null
      return amount * rate
    },
    [rates]
  )

  return {
    rates,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchRates,
    convert
  }
}

/**
 * Hook pour convertir un montant d'une devise à une autre
 */
export function useConversion(
  from: string,
  to: string,
  amount: number
): {
  convertedAmount: number | null
  isLoading: boolean
  error: string | null
} {
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const convert = async () => {
      if (amount <= 0 || from === to) {
        setConvertedAmount(from === to ? amount : null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const rate = await getExchangeRate(from, to)
        setConvertedAmount(amount * rate)
      } catch (err) {
        console.error("Conversion error:", err)
        setError("Erreur de conversion")
        setConvertedAmount(null)
      } finally {
        setIsLoading(false)
      }
    }

    convert()
  }, [from, to, amount])

  return { convertedAmount, isLoading, error }
}