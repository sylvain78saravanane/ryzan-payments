"use client"

import { useState, useEffect } from "react"
import { Wallet, Copy, CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface WalletState {
  isConnected: boolean
  address: string | null
  balances: {
    AVAX: string
    USDC: string
    EURC: string
  }
}

export function WalletConnect() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balances: { AVAX: "0", USDC: "0", EURC: "0" }
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Vérifier si Core Wallet est déjà connecté au chargement
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && (window as any).avalanche) {
      try {
        const accounts = await (window as any).avalanche.request({ 
          method: "eth_accounts" 
        })
        if (accounts && accounts.length > 0) {
          setWallet(prev => ({ ...prev, isConnected: true, address: accounts[0] }))
          await fetchBalances(accounts[0])
        }
      } catch (error) {
        console.error("Erreur vérification connexion:", error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window === "undefined") return

    const avalanche = (window as any).avalanche

    if (!avalanche) {
      // Rediriger vers l'installation de Core Wallet
      window.open("https://core.app/", "_blank")
      return
    }

    setIsConnecting(true)

    try {
      // Demander la connexion
      const accounts = await avalanche.request({ 
        method: "eth_requestAccounts" 
      })

      if (accounts && accounts.length > 0) {
        setWallet(prev => ({ ...prev, isConnected: true, address: accounts[0] }))
        await fetchBalances(accounts[0])
      }
    } catch (error: any) {
      console.error("Erreur connexion wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const fetchBalances = async (address: string) => {
    setIsRefreshing(true)
    
    try {
      // TODO: Implémenter la récupération des vrais soldes via ethers.js
      // Pour l'instant, on simule des données
      // Dans la version finale, utiliser le service Avalanche
      
      setWallet(prev => ({
        ...prev,
        balances: {
          AVAX: "12.45",
          USDC: "1,250.00",
          EURC: "850.00"
        }
      }))
    } catch (error) {
      console.error("Erreur récupération soldes:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balances: { AVAX: "0", USDC: "0", EURC: "0" }
    })
  }

  if (!wallet.isConnected) {
    return (
      <div className="flex flex-col gap-4 p-6 bg-[#0D0D0D] rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#1A1A1A] rounded-xl">
              <Wallet className="h-6 w-6 text-[#919191]" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Connecter votre Wallet</h3>
              <p className="text-sm text-[#919191]">Utilisez Core Wallet pour Avalanche</p>
            </div>
          </div>
          
          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connecter Core
              </>
            )}
          </Button>
        </div>
        
        <p className="text-xs text-[#666] text-center">
          Pas encore de wallet ?{" "}
          <a 
            href="https://core.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-red-400 hover:underline"
          >
            Télécharger Core Wallet
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-[#0D0D0D] rounded-2xl">
      {/* Header avec adresse */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl">
            <Wallet className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-white">
                {formatAddress(wallet.address!)}
              </span>
              <button 
                onClick={copyAddress}
                className="p-1 hover:bg-[#1A1A1A] rounded transition-colors"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-[#919191]" />
                )}
              </button>
              <a
                href={`https://snowtrace.io/address/${wallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-[#1A1A1A] rounded transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-[#919191]" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-[#919191]">Avalanche C-Chain</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchBalances(wallet.address!)}
            disabled={isRefreshing}
            className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 text-[#919191] ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <Button
            onClick={disconnectWallet}
            variant="outline"
            size="sm"
            className="border-[#333] text-[#919191] hover:text-white hover:border-red-500/50"
          >
            Déconnecter
          </Button>
        </div>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1F1F1F]">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-[#919191]">AVAX</span>
          <span className="text-2xl font-semibold text-white">{wallet.balances.AVAX}</span>
          <span className="text-xs text-[#666]">≈ $450.00</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-[#919191]">USDC</span>
          <span className="text-2xl font-semibold text-[#86efac]">${wallet.balances.USDC}</span>
          <span className="text-xs text-[#666]">Stablecoin USD</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-[#919191]">EURC</span>
          <span className="text-2xl font-semibold text-[#60a5fa]">€{wallet.balances.EURC}</span>
          <span className="text-xs text-[#666]">Stablecoin EUR</span>
        </div>
      </div>
    </div>
  )
}