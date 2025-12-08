"use client"

import { useState, useEffect } from "react"
import { Wallet, Copy, CheckCircle2, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { BrowserProvider, formatUnits, Contract } from "ethers" // Import Ethers
import { AVALANCHE_FUJI_CONFIG, TOKENS_FUJI, ERC20_ABI } from "@/lib/avalanche/config"

interface WalletState {
  isConnected: boolean
  address: string | null
  chainId: string | null
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
    chainId: null,
    balances: { AVAX: "0", USDC: "0", EURC: "0" }
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [isWrongNetwork, setIsWrongNetwork] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Initialisation
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      checkConnection()
      // Écouter les changements de compte/réseau
      ;(window as any).ethereum.on('accountsChanged', checkConnection)
      ;(window as any).ethereum.on('chainChanged', () => window.location.reload())
    }
  }, [])

  const checkConnection = async () => {
    const ethereum = (window as any).ethereum
    if (!ethereum) return

    try {
      const provider = new BrowserProvider(ethereum)
      const accounts = await provider.listAccounts()
      const network = await provider.getNetwork()
      
      // Vérifier si on est sur Fuji (Chain ID 43113)
      const isFuji = network.chainId === 43113n
      setIsWrongNetwork(!isFuji)

      if (accounts.length > 0) {
        const address = accounts[0].address
        setWallet(prev => ({ 
          ...prev, 
          isConnected: true, 
          address,
          chainId: network.chainId.toString()
        }))
        
        if (isFuji) {
          await fetchBalances(address, provider)
        }
      }
    } catch (error) {
      console.error("Erreur check connection:", error)
    }
  }

  const connectWallet = async () => {
    if (typeof window === "undefined") return
    const ethereum = (window as any).ethereum // Compatible Core & Metamask

    if (!ethereum) {
      window.open("https://core.app/", "_blank")
      return
    }

    setIsConnecting(true)
    try {
      await ethereum.request({ method: "eth_requestAccounts" })
      await checkConnection()
    } catch (error) {
      console.error("Erreur connexion:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const switchNetwork = async () => {
    const ethereum = (window as any).ethereum
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AVALANCHE_FUJI_CONFIG.chainId }],
      })
      window.location.reload()
    } catch (switchError: any) {
      // Si le réseau n'existe pas, l'ajouter
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [AVALANCHE_FUJI_CONFIG],
          })
        } catch (addError) {
          console.error("Impossible d'ajouter le réseau", addError)
        }
      }
    }
  }

  const fetchBalances = async (address: string, provider: BrowserProvider) => {
    setIsRefreshing(true)
    try {
      // 1. Solde AVAX (Natif)
      const avaxBalance = await provider.getBalance(address)
      
      // 2. Solde USDC (ERC20)
      const usdcContract = new Contract(TOKENS_FUJI.USDC, ERC20_ABI, provider)
      const usdcBalance = await usdcContract.balanceOf(address)
      const usdcDecimals = await usdcContract.decimals()

      // TODO: Faire pareil pour EURC quand on aura l'adresse du contrat Fuji
      
      setWallet(prev => ({
        ...prev,
        balances: {
          AVAX: formatUnits(avaxBalance, 18).slice(0, 6),
          USDC: formatUnits(usdcBalance, usdcDecimals).slice(0, 6),
          EURC: "0.00" // Placeholder en attendant le contrat
        }
      }))
    } catch (error) {
      console.error("Erreur lecture soldes:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // ... (Fonctions copyAddress, formatAddress, disconnectWallet inchangées)
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
    // Note: On ne peut pas vraiment "déconnecter" un wallet injected, on efface juste l'état local
    setWallet({
      isConnected: false,
      address: null,
      chainId: null,
      balances: { AVAX: "0", USDC: "0", EURC: "0" }
    })
  }

  if (!wallet.isConnected) {
    // ... (Votre UI de connexion existante reste ici)
    return (
      <div className="flex flex-col gap-4 p-6 bg-[#0D0D0D] rounded-2xl">
        {/* ... code existant ... */}
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
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-[#0D0D0D] rounded-2xl">
      {/* Alerte Mauvais Réseau */}
      {isWrongNetwork && (
        <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-2">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Mauvais réseau détecté</span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={switchNetwork}
            className="h-8 border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            Changer vers Fuji
          </Button>
        </div>
      )}

      {/* Header avec adresse (Code existant avec une petite modif pour le refresh) */}
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
              <button onClick={copyAddress} className="p-1 hover:bg-[#1A1A1A] rounded transition-colors">
                {copied ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-[#919191]" />}
              </button>
              <a href={`https://testnet.snowtrace.io/address/${wallet.address}`} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-[#1A1A1A] rounded transition-colors">
                <ExternalLink className="h-4 w-4 text-[#919191]" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isWrongNetwork ? "bg-red-500" : "bg-green-400"}`} />
              <span className="text-sm text-[#919191]">
                {isWrongNetwork ? "Réseau Incorrect" : "Avalanche Fuji Testnet"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
                const provider = new BrowserProvider((window as any).ethereum)
                if(wallet.address) fetchBalances(wallet.address, provider)
            }}
            disabled={isRefreshing || isWrongNetwork}
            className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 text-[#919191] ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <Button onClick={disconnectWallet} variant="outline" size="sm" className="border-[#333] text-[#919191] hover:text-white hover:border-red-500/50">
            Déconnecter
          </Button>
        </div>
      </div>

      {/* Balances Réels */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1F1F1F]">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-[#919191]">AVAX</span>
          <span className="text-2xl font-semibold text-white">{wallet.balances.AVAX}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-[#919191]">USDC</span>
          <span className="text-2xl font-semibold text-[#86efac]">${wallet.balances.USDC}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-[#919191]">EURC</span>
          <span className="text-2xl font-semibold text-[#60a5fa]">€{wallet.balances.EURC}</span>
        </div>
      </div>
    </div>
  )
}