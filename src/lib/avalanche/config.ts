/**
 * Configuration Avalanche C-Chain
 * Testnet Fuji pour le hackathon
 */

// Configuration réseau Fuji Testnet
export const AVALANCHE_FUJI_CONFIG = {
  chainId: "0xa869", // 43113 en hexadécimal
  chainName: "Avalanche Fuji Testnet",
  nativeCurrency: {
    name: "Avalanche",
    symbol: "AVAX",
    decimals: 18,
  },
  rpcUrls: [
    "https://api.avax-test.network/ext/bc/C/rpc",
    "https://avalanche-fuji-c-chain.publicnode.com",
  ],
  blockExplorerUrls: ["https://testnet.snowtrace.io/"],
}

// Configuration réseau Mainnet (pour la prod)
export const AVALANCHE_MAINNET_CONFIG = {
  chainId: "0xa86a", // 43114 en hexadécimal
  chainName: "Avalanche C-Chain",
  nativeCurrency: {
    name: "Avalanche",
    symbol: "AVAX",
    decimals: 18,
  },
  rpcUrls: [
    "https://api.avax.network/ext/bc/C/rpc",
    "https://avalanche-c-chain.publicnode.com",
  ],
  blockExplorerUrls: ["https://snowtrace.io/"],
}

// Adresses des tokens sur Fuji Testnet
export const TOKENS_FUJI = {
  // USDC officiel Circle sur Fuji
  USDC: "0x5425890298aed601595a70ab815c96711a31bc65",
  // EURC - À déployer ou utiliser un mock
  EURC: "0xC6C7c0378C73347D49354F7065096E560DF66509", // Placeholder
  // Wrapped AVAX
  WAVAX: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
}

// Adresses des tokens sur Mainnet
export const TOKENS_MAINNET = {
  USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // USDC natif
  USDCe: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", // USDC.e (bridged)
  EURC: "0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD", // À vérifier
  WAVAX: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
}

// ABI minimal ERC20
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]

// Configuration des tokens avec métadonnées
export const TOKEN_CONFIG = {
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    icon: "💵",
    color: "#2775CA",
    fiatEquivalent: "USD",
    addresses: {
      fuji: TOKENS_FUJI.USDC,
      mainnet: TOKENS_MAINNET.USDC,
    },
  },
  EURC: {
    symbol: "EURC",
    name: "Euro Coin",
    decimals: 6,
    icon: "💶",
    color: "#0052B4",
    fiatEquivalent: "EUR",
    addresses: {
      fuji: TOKENS_FUJI.EURC,
      mainnet: TOKENS_MAINNET.EURC,
    },
  },
  AVAX: {
    symbol: "AVAX",
    name: "Avalanche",
    decimals: 18,
    icon: "🔺",
    color: "#E84142",
    fiatEquivalent: "USD",
    addresses: {
      fuji: "native",
      mainnet: "native",
    },
  },
}

// Helper pour obtenir l'URL de l'explorateur
export function getExplorerUrl(
  txHashOrAddress: string,
  type: "tx" | "address" = "tx",
  network: "fuji" | "mainnet" = "fuji"
): string {
  const baseUrl =
    network === "fuji"
      ? "https://testnet.snowtrace.io"
      : "https://snowtrace.io"
  return `${baseUrl}/${type}/${txHashOrAddress}`
}

// Helper pour obtenir la config réseau
export function getNetworkConfig(network: "fuji" | "mainnet" = "fuji") {
  return network === "fuji" ? AVALANCHE_FUJI_CONFIG : AVALANCHE_MAINNET_CONFIG
}

// Helper pour obtenir l'adresse d'un token
export function getTokenAddress(
  token: "USDC" | "EURC" | "AVAX",
  network: "fuji" | "mainnet" = "fuji"
): string {
  if (token === "AVAX") return "native"
  const tokens = network === "fuji" ? TOKENS_FUJI : TOKENS_MAINNET
  return tokens[token]
}

// Constantes utiles
export const GAS_LIMITS = {
  TRANSFER_ERC20: BigInt(65000),
  TRANSFER_NATIVE: BigInt(21000),
  APPROVE: BigInt(50000),
}

export const SUPPORTED_CURRENCIES = ["USDC", "EURC", "AVAX"] as const
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]