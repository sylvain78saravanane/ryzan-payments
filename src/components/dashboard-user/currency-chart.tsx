"use client"

import { useState } from "react"
import { TrendingUp, RefreshCw } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Données simulées pour EUR/INR (cas d'usage France → Inde)
const eurInrData = [
  { time: "00:00", rate: 89.2 }, { time: "04:00", rate: 89.4 },
  { time: "08:00", rate: 89.1 }, { time: "12:00", rate: 89.6 },
  { time: "16:00", rate: 89.8 }, { time: "20:00", rate: 89.5 },
  { time: "Now", rate: 89.7 },
]

// Données simulées pour USD/EUR
const usdEurData = [
  { time: "00:00", rate: 0.92 }, { time: "04:00", rate: 0.921 },
  { time: "08:00", rate: 0.918 }, { time: "12:00", rate: 0.925 },
  { time: "16:00", rate: 0.923 }, { time: "20:00", rate: 0.922 },
  { time: "Now", rate: 0.924 },
]

const pairs = [
  { 
    id: "EUR/INR", 
    label: "EUR → INR", 
    data: eurInrData, 
    currentRate: "89.70",
    change: "+0.35%",
    trend: "up",
    description: "France → Inde"
  },
  { 
    id: "USD/EUR", 
    label: "USD → EUR", 
    data: usdEurData, 
    currentRate: "0.924",
    change: "+0.12%",
    trend: "up",
    description: "Dollar → Euro"
  },
]

export function CurrencyChart() {
  const [selectedPair, setSelectedPair] = useState(pairs[0])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshRates = async () => {
    setIsRefreshing(true)
    // Simuler un refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-[#0D0D0D] rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1A1A1A] rounded-lg">
            <TrendingUp className="h-5 w-5 text-[#60a5fa]" />
          </div>
          <h2 className="text-lg font-medium text-white">Taux de change</h2>
        </div>
        
        <button
          onClick={refreshRates}
          disabled={isRefreshing}
          className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 text-[#919191] ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Currency Pair Selector */}
      <div className="flex gap-2">
        {pairs.map((pair) => (
          <button
            key={pair.id}
            onClick={() => setSelectedPair(pair)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPair.id === pair.id
                ? "bg-[#2A2A2A] text-white ring-1 ring-[#60a5fa]/50"
                : "bg-[#1A1A1A] text-[#919191] hover:text-white"
            }`}
          >
            {pair.label}
          </button>
        ))}
      </div>

      {/* Current Rate Display */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-3xl font-bold text-white">{selectedPair.currentRate}</span>
          <span className="ml-2 text-sm text-[#919191]">{selectedPair.id}</span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
          selectedPair.trend === "up" 
            ? "bg-green-500/20 text-green-400" 
            : "bg-red-500/20 text-red-400"
        }`}>
          <TrendingUp className="h-3 w-3" />
          {selectedPair.change}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={selectedPair.data}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
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
                  return (
                    <div className="bg-[#1A1A1A] border border-[#333] p-2 rounded-lg shadow-xl">
                      <p className="text-white font-medium text-sm">
                        {payload[0].value} 
                        <span className="text-[#919191] ml-2">{payload[0].payload.time}</span>
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
              stroke="#60a5fa" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorRate)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Description */}
      <p className="text-xs text-[#666] text-center">
        {selectedPair.description} • Mis à jour il y a 5 min
      </p>
    </div>
  )
}