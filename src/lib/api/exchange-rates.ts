// Service pour récupérer les taux de change en temps réel
// For Hackathon, Frankfurter API (gratuit, basé sur les données de la BCE)

export interface ExchangeRates {
  base: string
  date: string
  rates: Record<string, number>
}

export interface HistoricalRates {
  base: string
  start_date: string
  end_date: string
  rates: Record<string, Record<string, number>>
}

const FRANKFURTER_API = "https://api.frankfurter.app"

/**
 * Récupère les taux de change actuels avec EUR comme base
 */
export async function getCurrentRates(
  currencies: string[] = ["INR", "USD", "GBP", "JPY", "CNY"]
): Promise<ExchangeRates> {
  const symbols = currencies.join(",")
  const response = await fetch(
    `${FRANKFURTER_API}/latest?from=EUR&to=${symbols}`
  )
  
  if (!response.ok) {
    throw new Error(`Failed to fetch rates: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Récupère l'historique des taux sur les dernières 24h (ou X jours)
 */
export async function getHistoricalRates(
  currency: string,
  days: number = 7
): Promise<{ time: string; rate: number }[]> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const formatDate = (d: Date) => d.toISOString().split("T")[0]
  
  const response = await fetch(
    `${FRANKFURTER_API}/${formatDate(startDate)}..${formatDate(endDate)}?from=EUR&to=${currency}`
  )
  
  if (!response.ok) {
    throw new Error(`Failed to fetch historical rates: ${response.statusText}`)
  }
  
  const data: HistoricalRates = await response.json()
  
  // Transformer en format pour le graphique
  return Object.entries(data.rates).map(([date, rates]) => ({
    time: new Date(date).toLocaleDateString("fr-FR", { 
      day: "2-digit", 
      month: "short" 
    }),
    rate: rates[currency]
  }))
}

/**
 * Récupère le taux de change entre deux devises
 */
export async function getExchangeRate(
  from: string,
  to: string
): Promise<number> {
  const response = await fetch(
    `${FRANKFURTER_API}/latest?from=${from}&to=${to}`
  )
  
  if (!response.ok) {
    throw new Error(`Failed to fetch rate: ${response.statusText}`)
  }
  
  const data: ExchangeRates = await response.json()
  return data.rates[to]
}

/**
 * Calcule le changement en pourcentage par rapport à la veille
 */
export async function getRateChange(currency: string): Promise<{
  currentRate: number
  previousRate: number
  changePercent: number
  trend: "up" | "down" | "stable"
}> {
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  // Si c'est un weekend, on recule jusqu'au dernier jour ouvré
  while (yesterday.getDay() === 0 || yesterday.getDay() === 6) {
    yesterday.setDate(yesterday.getDate() - 1)
  }
  
  const formatDate = (d: Date) => d.toISOString().split("T")[0]
  
  // Récupérer le taux actuel
  const currentResponse = await fetch(
    `${FRANKFURTER_API}/latest?from=EUR&to=${currency}`
  )
  const currentData: ExchangeRates = await currentResponse.json()
  const currentRate = currentData.rates[currency]
  
  // Récupérer le taux de la veille
  const previousResponse = await fetch(
    `${FRANKFURTER_API}/${formatDate(yesterday)}?from=EUR&to=${currency}`
  )
  const previousData: ExchangeRates = await previousResponse.json()
  const previousRate = previousData.rates[currency]
  
  const changePercent = ((currentRate - previousRate) / previousRate) * 100
  
  return {
    currentRate,
    previousRate,
    changePercent,
    trend: changePercent > 0.01 ? "up" : changePercent < -0.01 ? "down" : "stable"
  }
}