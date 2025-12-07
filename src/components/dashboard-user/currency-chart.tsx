"use client"

import { useState, useEffect, useCallback } from "react"
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, ChevronDown, Search } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { 
  getHistoricalRates, 
  getRateChange 
} from "@/lib/api/exchange-rates"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

// Liste complète des devises avec leurs pays et drapeaux
const ALL_CURRENCIES = [
  // Devises populaires (en haut de la liste)
  { code: "INR", name: "Roupie indienne", country: "Inde", flag: "🇮🇳", popular: true },
  { code: "USD", name: "Dollar américain", country: "États-Unis", flag: "🇺🇸", popular: true },
  { code: "GBP", name: "Livre sterling", country: "Royaume-Uni", flag: "🇬🇧", popular: true },
  { code: "CHF", name: "Franc suisse", country: "Suisse", flag: "🇨🇭", popular: true },
  { code: "JPY", name: "Yen japonais", country: "Japon", flag: "🇯🇵", popular: true },
  { code: "CAD", name: "Dollar canadien", country: "Canada", flag: "🇨🇦", popular: true },
  { code: "AUD", name: "Dollar australien", country: "Australie", flag: "🇦🇺", popular: true },
  { code: "CNY", name: "Yuan chinois", country: "Chine", flag: "🇨🇳", popular: true },
  
  // Autres devises (ordre alphabétique par pays)
  { code: "AED", name: "Dirham", country: "Émirats arabes unis", flag: "🇦🇪", popular: false },
  { code: "AFN", name: "Afghani", country: "Afghanistan", flag: "🇦🇫", popular: false },
  { code: "ALL", name: "Lek", country: "Albanie", flag: "🇦🇱", popular: false },
  { code: "AMD", name: "Dram", country: "Arménie", flag: "🇦🇲", popular: false },
  { code: "ARS", name: "Peso argentin", country: "Argentine", flag: "🇦🇷", popular: false },
  { code: "AZN", name: "Manat", country: "Azerbaïdjan", flag: "🇦🇿", popular: false },
  { code: "BAM", name: "Mark convertible", country: "Bosnie-Herzégovine", flag: "🇧🇦", popular: false },
  { code: "BDT", name: "Taka", country: "Bangladesh", flag: "🇧🇩", popular: false },
  { code: "BGN", name: "Lev bulgare", country: "Bulgarie", flag: "🇧🇬", popular: false },
  { code: "BHD", name: "Dinar bahreïni", country: "Bahreïn", flag: "🇧🇭", popular: false },
  { code: "BIF", name: "Franc burundais", country: "Burundi", flag: "🇧🇮", popular: false },
  { code: "BND", name: "Dollar de Brunei", country: "Brunei", flag: "🇧🇳", popular: false },
  { code: "BOB", name: "Boliviano", country: "Bolivie", flag: "🇧🇴", popular: false },
  { code: "BRL", name: "Réal brésilien", country: "Brésil", flag: "🇧🇷", popular: false },
  { code: "BWP", name: "Pula", country: "Botswana", flag: "🇧🇼", popular: false },
  { code: "BYN", name: "Rouble biélorusse", country: "Biélorussie", flag: "🇧🇾", popular: false },
  { code: "CDF", name: "Franc congolais", country: "RD Congo", flag: "🇨🇩", popular: false },
  { code: "CLP", name: "Peso chilien", country: "Chili", flag: "🇨🇱", popular: false },
  { code: "COP", name: "Peso colombien", country: "Colombie", flag: "🇨🇴", popular: false },
  { code: "CRC", name: "Colón", country: "Costa Rica", flag: "🇨🇷", popular: false },
  { code: "CZK", name: "Couronne tchèque", country: "Tchéquie", flag: "🇨🇿", popular: false },
  { code: "DKK", name: "Couronne danoise", country: "Danemark", flag: "🇩🇰", popular: false },
  { code: "DOP", name: "Peso dominicain", country: "République dominicaine", flag: "🇩🇴", popular: false },
  { code: "DZD", name: "Dinar algérien", country: "Algérie", flag: "🇩🇿", popular: false },
  { code: "EGP", name: "Livre égyptienne", country: "Égypte", flag: "🇪🇬", popular: false },
  { code: "ETB", name: "Birr éthiopien", country: "Éthiopie", flag: "🇪🇹", popular: false },
  { code: "GEL", name: "Lari", country: "Géorgie", flag: "🇬🇪", popular: false },
  { code: "GHS", name: "Cedi", country: "Ghana", flag: "🇬🇭", popular: false },
  { code: "GTQ", name: "Quetzal", country: "Guatemala", flag: "🇬🇹", popular: false },
  { code: "HKD", name: "Dollar de Hong Kong", country: "Hong Kong", flag: "🇭🇰", popular: false },
  { code: "HNL", name: "Lempira", country: "Honduras", flag: "🇭🇳", popular: false },
  { code: "HRK", name: "Kuna", country: "Croatie", flag: "🇭🇷", popular: false },
  { code: "HUF", name: "Forint", country: "Hongrie", flag: "🇭🇺", popular: false },
  { code: "IDR", name: "Roupie indonésienne", country: "Indonésie", flag: "🇮🇩", popular: false },
  { code: "ILS", name: "Shekel", country: "Israël", flag: "🇮🇱", popular: false },
  { code: "IQD", name: "Dinar irakien", country: "Irak", flag: "🇮🇶", popular: false },
  { code: "IRR", name: "Rial iranien", country: "Iran", flag: "🇮🇷", popular: false },
  { code: "ISK", name: "Couronne islandaise", country: "Islande", flag: "🇮🇸", popular: false },
  { code: "JMD", name: "Dollar jamaïcain", country: "Jamaïque", flag: "🇯🇲", popular: false },
  { code: "JOD", name: "Dinar jordanien", country: "Jordanie", flag: "🇯🇴", popular: false },
  { code: "KES", name: "Shilling kényan", country: "Kenya", flag: "🇰🇪", popular: false },
  { code: "KGS", name: "Som", country: "Kirghizistan", flag: "🇰🇬", popular: false },
  { code: "KHR", name: "Riel", country: "Cambodge", flag: "🇰🇭", popular: false },
  { code: "KRW", name: "Won sud-coréen", country: "Corée du Sud", flag: "🇰🇷", popular: false },
  { code: "KWD", name: "Dinar koweïtien", country: "Koweït", flag: "🇰🇼", popular: false },
  { code: "KZT", name: "Tenge", country: "Kazakhstan", flag: "🇰🇿", popular: false },
  { code: "LAK", name: "Kip", country: "Laos", flag: "🇱🇦", popular: false },
  { code: "LBP", name: "Livre libanaise", country: "Liban", flag: "🇱🇧", popular: false },
  { code: "LKR", name: "Roupie srilankaise", country: "Sri Lanka", flag: "🇱🇰", popular: false },
  { code: "MAD", name: "Dirham marocain", country: "Maroc", flag: "🇲🇦", popular: false },
  { code: "MDL", name: "Leu moldave", country: "Moldavie", flag: "🇲🇩", popular: false },
  { code: "MGA", name: "Ariary", country: "Madagascar", flag: "🇲🇬", popular: false },
  { code: "MKD", name: "Denar", country: "Macédoine du Nord", flag: "🇲🇰", popular: false },
  { code: "MMK", name: "Kyat", country: "Myanmar", flag: "🇲🇲", popular: false },
  { code: "MNT", name: "Tugrik", country: "Mongolie", flag: "🇲🇳", popular: false },
  { code: "MUR", name: "Roupie mauricienne", country: "Maurice", flag: "🇲🇺", popular: false },
  { code: "MWK", name: "Kwacha malawien", country: "Malawi", flag: "🇲🇼", popular: false },
  { code: "MXN", name: "Peso mexicain", country: "Mexique", flag: "🇲🇽", popular: false },
  { code: "MYR", name: "Ringgit", country: "Malaisie", flag: "🇲🇾", popular: false },
  { code: "MZN", name: "Metical", country: "Mozambique", flag: "🇲🇿", popular: false },
  { code: "NAD", name: "Dollar namibien", country: "Namibie", flag: "🇳🇦", popular: false },
  { code: "NGN", name: "Naira", country: "Nigeria", flag: "🇳🇬", popular: false },
  { code: "NIO", name: "Córdoba", country: "Nicaragua", flag: "🇳🇮", popular: false },
  { code: "NOK", name: "Couronne norvégienne", country: "Norvège", flag: "🇳🇴", popular: false },
  { code: "NPR", name: "Roupie népalaise", country: "Népal", flag: "🇳🇵", popular: false },
  { code: "NZD", name: "Dollar néo-zélandais", country: "Nouvelle-Zélande", flag: "🇳🇿", popular: false },
  { code: "OMR", name: "Rial omanais", country: "Oman", flag: "🇴🇲", popular: false },
  { code: "PAB", name: "Balboa", country: "Panama", flag: "🇵🇦", popular: false },
  { code: "PEN", name: "Sol", country: "Pérou", flag: "🇵🇪", popular: false },
  { code: "PHP", name: "Peso philippin", country: "Philippines", flag: "🇵🇭", popular: false },
  { code: "PKR", name: "Roupie pakistanaise", country: "Pakistan", flag: "🇵🇰", popular: false },
  { code: "PLN", name: "Zloty", country: "Pologne", flag: "🇵🇱", popular: false },
  { code: "PYG", name: "Guarani", country: "Paraguay", flag: "🇵🇾", popular: false },
  { code: "QAR", name: "Riyal qatari", country: "Qatar", flag: "🇶🇦", popular: false },
  { code: "RON", name: "Leu roumain", country: "Roumanie", flag: "🇷🇴", popular: false },
  { code: "RSD", name: "Dinar serbe", country: "Serbie", flag: "🇷🇸", popular: false },
  { code: "RUB", name: "Rouble russe", country: "Russie", flag: "🇷🇺", popular: false },
  { code: "RWF", name: "Franc rwandais", country: "Rwanda", flag: "🇷🇼", popular: false },
  { code: "SAR", name: "Riyal saoudien", country: "Arabie saoudite", flag: "🇸🇦", popular: false },
  { code: "SEK", name: "Couronne suédoise", country: "Suède", flag: "🇸🇪", popular: false },
  { code: "SGD", name: "Dollar de Singapour", country: "Singapour", flag: "🇸🇬", popular: false },
  { code: "SYP", name: "Livre syrienne", country: "Syrie", flag: "🇸🇾", popular: false },
  { code: "THB", name: "Baht", country: "Thaïlande", flag: "🇹🇭", popular: false },
  { code: "TND", name: "Dinar tunisien", country: "Tunisie", flag: "🇹🇳", popular: false },
  { code: "TRY", name: "Livre turque", country: "Turquie", flag: "🇹🇷", popular: false },
  { code: "TWD", name: "Dollar taïwanais", country: "Taïwan", flag: "🇹🇼", popular: false },
  { code: "TZS", name: "Shilling tanzanien", country: "Tanzanie", flag: "🇹🇿", popular: false },
  { code: "UAH", name: "Hryvnia", country: "Ukraine", flag: "🇺🇦", popular: false },
  { code: "UGX", name: "Shilling ougandais", country: "Ouganda", flag: "🇺🇬", popular: false },
  { code: "UYU", name: "Peso uruguayen", country: "Uruguay", flag: "🇺🇾", popular: false },
  { code: "UZS", name: "Sum", country: "Ouzbékistan", flag: "🇺🇿", popular: false },
  { code: "VES", name: "Bolívar", country: "Venezuela", flag: "🇻🇪", popular: false },
  { code: "VND", name: "Dong", country: "Vietnam", flag: "🇻🇳", popular: false },
  { code: "XAF", name: "Franc CFA (CEMAC)", country: "Afrique centrale", flag: "🌍", popular: false },
  { code: "XOF", name: "Franc CFA (UEMOA)", country: "Afrique de l'Ouest", flag: "🌍", popular: false },
  { code: "YER", name: "Rial yéménite", country: "Yémen", flag: "🇾🇪", popular: false },
  { code: "ZAR", name: "Rand", country: "Afrique du Sud", flag: "🇿🇦", popular: false },
  { code: "ZMW", name: "Kwacha zambien", country: "Zambie", flag: "🇿🇲", popular: false },
]

interface PairData {
  code: string
  name: string
  country: string
  flag: string
  data: { time: string; rate: number }[]
  currentRate: string
  change: string
  trend: "up" | "down" | "stable"
}

export function CurrencyChart() {
  const [selectedCurrency, setSelectedCurrency] = useState(ALL_CURRENCIES[0])
  const [pairData, setPairData] = useState<PairData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const fetchRateData = useCallback(async (currency: typeof ALL_CURRENCIES[0]) => {
    try {
      setError(null)
      
      // Récupérer l'historique sur 7 jours
      const historicalData = await getHistoricalRates(currency.code, 7)
      
      // Récupérer le changement par rapport à la veille
      const rateChange = await getRateChange(currency.code)
      
      const decimals = rateChange.currentRate > 100 ? 2 : 
                       rateChange.currentRate > 10 ? 3 : 4
      
      setPairData({
        ...currency,
        data: historicalData,
        currentRate: rateChange.currentRate.toFixed(decimals),
        change: `${rateChange.changePercent >= 0 ? "+" : ""}${rateChange.changePercent.toFixed(2)}%`,
        trend: rateChange.trend
      })
      
      setLastUpdated(new Date())
    } catch (err) {
      console.error(`Error fetching ${currency.code}:`, err)
      setError(`Impossible de récupérer le taux pour ${currency.code}`)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchRateData(selectedCurrency)
    
    // Rafraîchir automatiquement toutes les 5 minutes
    const interval = setInterval(() => fetchRateData(selectedCurrency), 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [selectedCurrency, fetchRateData])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchRateData(selectedCurrency)
  }

  const handleSelectCurrency = (currency: typeof ALL_CURRENCIES[0]) => {
    setSelectedCurrency(currency)
    setIsLoading(true)
    setSearchQuery("")
    setIsDropdownOpen(false)
  }

  // Filtrer les devises par recherche
  const filteredCurrencies = ALL_CURRENCIES.filter((currency) => {
    const query = searchQuery.toLowerCase()
    return (
      currency.code.toLowerCase().includes(query) ||
      currency.name.toLowerCase().includes(query) ||
      currency.country.toLowerCase().includes(query)
    )
  })

  // Séparer les devises populaires et les autres
  const popularCurrencies = filteredCurrencies.filter(c => c.popular)
  const otherCurrencies = filteredCurrencies.filter(c => !c.popular)

  if (isLoading && !pairData) {
    return (
      <div className="flex flex-col gap-4 p-6 bg-[#0D0D0D] rounded-2xl min-h-[320px]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1A1A1A] rounded-lg">
            <TrendingUp className="h-5 w-5 text-[#60a5fa]" />
          </div>
          <h2 className="text-lg font-medium text-white">Taux de change</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 text-[#60a5fa] animate-spin" />
            <p className="text-sm text-[#919191]">Chargement des taux...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-[#0D0D0D] rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1A1A1A] rounded-lg">
            <TrendingUp className="h-5 w-5 text-[#60a5fa]" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">Taux de change</h2>
            <p className="text-xs text-[#666]">Base: EUR 🇪🇺</p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors disabled:opacity-50"
          title="Actualiser les taux"
        >
          <RefreshCw className={`h-4 w-4 text-[#919191] ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Currency Selector Dropdown */}
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center justify-between w-full px-4 py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedCurrency.flag}</span>
              <div className="text-left">
                <p className="font-medium text-white">
                  EUR → {selectedCurrency.code}
                </p>
                <p className="text-xs text-[#919191]">
                  {selectedCurrency.country} • {selectedCurrency.name}
                </p>
              </div>
            </div>
            <ChevronDown className="h-5 w-5 text-[#919191]" />
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-[320px] max-h-[400px] overflow-hidden bg-[#0D0D0D] border-[#333]"
          align="start"
        >
          {/* Search Input */}
          <div className="p-2 border-b border-[#1F1F1F]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
              <Input
                placeholder="Rechercher un pays ou une devise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-[#1A1A1A] border-[#333] text-white placeholder:text-[#666] h-9"
              />
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="max-h-[300px] overflow-y-auto">
            {/* Popular Currencies */}
            {popularCurrencies.length > 0 && (
              <>
                <DropdownMenuLabel className="text-[#919191] text-xs">
                  Devises populaires
                </DropdownMenuLabel>
                {popularCurrencies.map((currency) => (
                  <DropdownMenuItem
                    key={currency.code}
                    onClick={() => handleSelectCurrency(currency)}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
                      selectedCurrency.code === currency.code
                        ? "bg-[#2A2A2A] text-white"
                        : "text-white hover:bg-[#1A1A1A]"
                    }`}
                  >
                    <span className="text-xl">{currency.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{currency.country}</p>
                      <p className="text-xs text-[#919191] truncate">
                        {currency.code} • {currency.name}
                      </p>
                    </div>
                    {selectedCurrency.code === currency.code && (
                      <div className="w-2 h-2 rounded-full bg-[#60a5fa]" />
                    )}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            
            {/* Other Currencies */}
            {otherCurrencies.length > 0 && (
              <>
                <DropdownMenuSeparator className="bg-[#1F1F1F]" />
                <DropdownMenuLabel className="text-[#919191] text-xs">
                  Toutes les devises ({otherCurrencies.length})
                </DropdownMenuLabel>
                {otherCurrencies.map((currency) => (
                  <DropdownMenuItem
                    key={currency.code}
                    onClick={() => handleSelectCurrency(currency)}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
                      selectedCurrency.code === currency.code
                        ? "bg-[#2A2A2A] text-white"
                        : "text-white hover:bg-[#1A1A1A]"
                    }`}
                  >
                    <span className="text-xl">{currency.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{currency.country}</p>
                      <p className="text-xs text-[#919191] truncate">
                        {currency.code} • {currency.name}
                      </p>
                    </div>
                    {selectedCurrency.code === currency.code && (
                      <div className="w-2 h-2 rounded-full bg-[#60a5fa]" />
                    )}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            
            {/* No results */}
            {filteredCurrencies.length === 0 && (
              <div className="px-3 py-6 text-center">
                <p className="text-sm text-[#919191]">Aucune devise trouvée</p>
                <p className="text-xs text-[#666]">Essayez un autre terme</p>
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {pairData && !error && (
        <>
          {/* Current Rate Display */}
          <div className="flex items-end justify-between">
            <div>
              <span className="text-3xl font-bold text-white">
                {pairData.currentRate}
              </span>
              <span className="ml-2 text-sm text-[#919191]">
                {pairData.code}
              </span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
              pairData.trend === "up" 
                ? "bg-green-500/20 text-green-400" 
                : pairData.trend === "down"
                ? "bg-red-500/20 text-red-400"
                : "bg-gray-500/20 text-gray-400"
            }`}>
              {pairData.trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : pairData.trend === "down" ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              {pairData.change}
            </div>
          </div>

          {/* Chart */}
          <div className="h-[140px] w-full">
            {pairData.data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pairData.data}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop 
                        offset="5%" 
                        stopColor={pairData.trend === "up" ? "#22c55e" : pairData.trend === "down" ? "#ef4444" : "#60a5fa"} 
                        stopOpacity={0.3}
                      />
                      <stop 
                        offset="95%" 
                        stopColor={pairData.trend === "up" ? "#22c55e" : pairData.trend === "down" ? "#ef4444" : "#60a5fa"} 
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: '#666', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const decimals = Number(payload[0].value) > 100 ? 2 : 
                                        Number(payload[0].value) > 10 ? 3 : 4
                        return (
                          <div className="bg-[#1A1A1A] border border-[#333] p-2 rounded-lg shadow-xl">
                            <p className="text-white font-medium text-sm">
                              {Number(payload[0].value).toFixed(decimals)} {pairData.code}
                              <span className="text-[#919191] ml-2">
                                {payload[0].payload.time}
                              </span>
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke={pairData.trend === "up" ? "#22c55e" : pairData.trend === "down" ? "#ef4444" : "#60a5fa"}
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorRate)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-[#666]">Données historiques indisponibles</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="flex items-center justify-between text-xs text-[#666]">
            <span>1 EUR = {pairData.currentRate} {pairData.code} • 7 derniers jours</span>
            {lastUpdated && (
              <span>
                Mis à jour {lastUpdated.toLocaleTimeString("fr-FR", { 
                  hour: "2-digit", 
                  minute: "2-digit" 
                })}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}