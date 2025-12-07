export const AVALANCHE_FUJI_CONFIG = {
  chainId: '0xa869', // 43113 en hexadécimal
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/'],
}

export const TOKENS_FUJI = {
  USDC: "0x5425890298aed601595a70ab815c96711a31bc65", // USDC natif de test
  EURC: "0xC6C7c0378C73347D49354F7065096E560DF66509", // (Exemple, à vérifier sur Snowtrace)
}

// ABI minimal pour interagir avec les tokens ERC-20 (USDC, EURC)
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint amount) returns (bool)",
]