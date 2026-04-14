export const SUPPORTED_CHAINS = {
  ethereum: { id: 1, name: "Ethereum", rpc: "https://eth.llamarpc.com", explorer: "https://etherscan.io" },
  polygon: { id: 137, name: "Polygon", rpc: "https://polygon.llamarpc.com", explorer: "https://polygonscan.com" },
  arbitrum: { id: 42161, name: "Arbitrum", rpc: "https://arb1.arbitrum.io/rpc", explorer: "https://arbiscan.io" },
  bsc: { id: 56, name: "BSC", rpc: "https://bsc-dataseed.binance.org", explorer: "https://bscscan.com" },
  base: { id: 8453, name: "Base", rpc: "https://mainnet.base.org", explorer: "https://basescan.org" },
} as const;

export type ChainKey = keyof typeof SUPPORTED_CHAINS;

export const TOKEN_CONTRACTS: Record<string, Record<ChainKey, string>> = {
  USDT: {
    ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    polygon: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    arbitrum: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    bsc: "0x55d398326f99059fF775485246999027B3197955",
    base: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
  },
  USDC: {
    ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    polygon: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    bsc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
};

export const PLAN_PRICES = {
  monthly: 0.99,
  yearly: 9.99,
} as const;

export const ERC20_TRANSFER_ABI = [
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;
