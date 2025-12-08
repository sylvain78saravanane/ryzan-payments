import { BrowserProvider, Contract, parseUnits, formatUnits, TransactionResponse } from "ethers"
import { TOKENS_FUJI, ERC20_ABI, AVALANCHE_FUJI_CONFIG } from "../avalanche/config"

// Types
export interface TransferRequest {
  toAddress: string
  amount: number          // Montant en unités humaines (ex: 100 pour 100€)
  currency: "USDC" | "EURC"
  recipientName?: string
  recipientCountry?: string
}

export interface TransferResult {
  success: boolean
  txHash?: string
  blockNumber?: number
  gasUsed?: string
  estimatedFee?: string
  error?: string
  timestamp?: Date
}

export interface TransferEstimate {
  gasCost: string         // En AVAX
  gasCostUSD: string      // Estimation en USD
  networkFee: string      // Frais réseau total
  estimatedTime: string   // Temps estimé
  exchangeRate?: number   // Taux de change si applicable
  recipientReceives?: number // Montant que le destinataire reçoit
}

// ABI étendu pour les transferts ERC20
const ERC20_TRANSFER_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
]

export class RyzanTransferService {
  private provider: BrowserProvider | null = null
  private signer: any = null

  async initialize(): Promise<{ success: boolean; address?: string; error?: string }> {
    if (typeof window === "undefined") {
      return { success: false, error: "Service disponible uniquement côté client" }
    }

    const ethereum = (window as any).ethereum
    if (!ethereum) {
      return { success: false, error: "Aucun wallet détecté. Installez Core ou MetaMask." }
    }

    try {
      // Demander l'accès au wallet
      await ethereum.request({ method: "eth_requestAccounts" })
      
      this.provider = new BrowserProvider(ethereum)
      this.signer = await this.provider.getSigner()
      
      const address = await this.signer.getAddress()
      
      const network = await this.provider.getNetwork()
      if (network.chainId !== BigInt(43113)) {
        await this.switchToFuji()
      }

      return { success: true, address }
    } catch (error: any) {
      return { success: false, error: error.message || "Erreur d'initialisation" }
    }
  }

  /**
   * Switch vers le réseau Avalanche Fuji
   */
  async switchToFuji(): Promise<void> {
    const ethereum = (window as any).ethereum
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AVALANCHE_FUJI_CONFIG.chainId }]
      })
    } catch (switchError: any) {
      // Si le réseau n'existe pas, l'ajouter
      if (switchError.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [AVALANCHE_FUJI_CONFIG]
        })
      } else {
        throw switchError
      }
    }
  }

  /**
   * Récupère le solde d'un token
   */
  async getTokenBalance(
    tokenAddress: string, 
    walletAddress: string
  ): Promise<{ balance: string; decimals: number; symbol: string }> {
    if (!this.provider) throw new Error("Service non initialisé")

    const contract = new Contract(tokenAddress, ERC20_TRANSFER_ABI, this.provider)
    
    const [balance, decimals, symbol] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals(),
      contract.symbol()
    ])

    return {
      balance: formatUnits(balance, decimals),
      decimals: Number(decimals),
      symbol
    }
  }

  /**
   * Estime les frais d'un transfert
   */
  async estimateTransfer(request: TransferRequest): Promise<TransferEstimate> {
    if (!this.provider || !this.signer) {
      throw new Error("Service non initialisé")
    }

    const tokenAddress = request.currency === "USDC" ? TOKENS_FUJI.USDC : TOKENS_FUJI.EURC
    const contract = new Contract(tokenAddress, ERC20_TRANSFER_ABI, this.signer)
    
    const decimals = await contract.decimals()
    const amountWei = parseUnits(request.amount.toString(), decimals)

    const gasEstimate = await contract.transfer.estimateGas(request.toAddress, amountWei)
    const feeData = await this.provider.getFeeData()
    
    const gasCostWei = gasEstimate * (feeData.gasPrice || BigInt(25000000000))
    const gasCostAVAX = formatUnits(gasCostWei, 18)
    
    const avaxPriceUSD = 35 // À remplacer par un appel API
    const gasCostUSD = (parseFloat(gasCostAVAX) * avaxPriceUSD).toFixed(4)

    return {
      gasCost: gasCostAVAX,
      gasCostUSD: `$${gasCostUSD}`,
      networkFee: `~$${gasCostUSD}`,
      estimatedTime: "2-5 secondes",
      exchangeRate: undefined,
      recipientReceives: request.amount
    }
  }

  async sendTransfer(request: TransferRequest): Promise<TransferResult> {
    if (!this.provider || !this.signer) {
      return { success: false, error: "Service non initialisé. Connectez votre wallet." }
    }

    try {
      // 1. Déterminer le token
      const tokenAddress = request.currency === "USDC" ? TOKENS_FUJI.USDC : TOKENS_FUJI.EURC
      const contract = new Contract(tokenAddress, ERC20_TRANSFER_ABI, this.signer)

      // 2. Récupérer les decimals et convertir le montant
      const decimals = await contract.decimals()
      const amountWei = parseUnits(request.amount.toString(), decimals)

      // 3. Vérifier le solde
      const senderAddress = await this.signer.getAddress()
      const balance = await contract.balanceOf(senderAddress)
      
      if (balance < amountWei) {
        return { 
          success: false, 
          error: `Solde insuffisant. Vous avez ${formatUnits(balance, decimals)} ${request.currency}` 
        }
      }

      // 4. Envoyer la transaction
      console.log(`📤 Envoi de ${request.amount} ${request.currency} vers ${request.toAddress}`)
      
      const tx: TransactionResponse = await contract.transfer(request.toAddress, amountWei)
      
      console.log(`⏳ Transaction soumise: ${tx.hash}`)

      // 5. Attendre la confirmation
      const receipt = await tx.wait()

      if (!receipt) {
        return { success: false, error: "Transaction non confirmée" }
      }

      console.log(`✅ Transaction confirmée au bloc ${receipt.blockNumber}`)

      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: new Date()
      }

    } catch (error: any) {
      console.error("❌ Erreur de transfert:", error)
      
      // Messages d'erreur user-friendly
      let errorMessage = "Erreur lors du transfert"
      
      if (error.code === "ACTION_REJECTED") {
        errorMessage = "Transaction annulée par l'utilisateur"
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        errorMessage = "Fonds insuffisants pour les frais de gas"
      } else if (error.message?.includes("transfer amount exceeds balance")) {
        errorMessage = "Solde de tokens insuffisant"
      } else if (error.message) {
        errorMessage = error.message
      }

      return { success: false, error: errorMessage }
    }
  }

  /**
   * Récupère tous les soldes (AVAX + tokens)
   */
  async getAllBalances(walletAddress: string): Promise<{
    AVAX: string
    USDC: string
    EURC: string
  }> {
    if (!this.provider) throw new Error("Service non initialisé")

    const [avaxBalance, usdcData, eurcData] = await Promise.all([
      this.provider.getBalance(walletAddress),
      this.getTokenBalance(TOKENS_FUJI.USDC, walletAddress).catch(() => ({ balance: "0" })),
      this.getTokenBalance(TOKENS_FUJI.EURC, walletAddress).catch(() => ({ balance: "0" }))
    ])

    return {
      AVAX: formatUnits(avaxBalance, 18),
      USDC: usdcData.balance,
      EURC: eurcData.balance
    }
  }

  /**
   * Écoute les événements de transfert
   */
  onTransferEvent(
    tokenAddress: string, 
    walletAddress: string,
    callback: (from: string, to: string, amount: string) => void
  ): () => void {
    if (!this.provider) throw new Error("Service non initialisé")

    const contract = new Contract(tokenAddress, ERC20_TRANSFER_ABI, this.provider)
    
    const filter = contract.filters.Transfer(walletAddress, null)
    
    const listener = (from: string, to: string, value: bigint) => {
      callback(from, to, formatUnits(value, 6)) // Assuming 6 decimals for stablecoins
    }

    contract.on(filter, listener)

    // Retourner une fonction pour se désabonner
    return () => {
      contract.off(filter, listener)
    }
  }
}

// Instance singleton
export const transferService = new RyzanTransferService()

/**
 * Fonction helper pour un envoi rapide
 */
export async function quickSend(
  toAddress: string,
  amount: number,
  currency: "USDC" | "EURC" = "EURC"
): Promise<TransferResult> {
  await transferService.initialize()
  return transferService.sendTransfer({ toAddress, amount, currency })
}