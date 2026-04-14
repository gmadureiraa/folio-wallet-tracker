import type { ChainId, ChainConfig } from '../types'

export const CHAINS: Record<ChainId, ChainConfig> = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    color: '#627EEA',
    explorer: 'https://etherscan.io',
    coingeckoId: 'ethereum',
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    color: '#9945FF',
    explorer: 'https://solscan.io',
    coingeckoId: 'solana',
  },
  base: {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    color: '#0052FF',
    explorer: 'https://basescan.org',
    coingeckoId: 'ethereum',
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ETH',
    color: '#12AAFF',
    explorer: 'https://arbiscan.io',
    coingeckoId: 'ethereum',
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'POL',
    color: '#8247E5',
    explorer: 'https://polygonscan.com',
    coingeckoId: 'matic-network',
  },
  bsc: {
    id: 'bsc',
    name: 'BNB Chain',
    symbol: 'BNB',
    color: '#F3BA2F',
    explorer: 'https://bscscan.com',
    coingeckoId: 'binancecoin',
  },
  avalanche: {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    color: '#E84142',
    explorer: 'https://snowtrace.io',
    coingeckoId: 'avalanche-2',
  },
  optimism: {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'ETH',
    color: '#FF0420',
    explorer: 'https://optimistic.etherscan.io',
    coingeckoId: 'ethereum',
  },
  linea: {
    id: 'linea',
    name: 'Linea',
    symbol: 'ETH',
    color: '#61DFFF',
    explorer: 'https://lineascan.build',
    coingeckoId: 'ethereum',
  },
  scroll: {
    id: 'scroll',
    name: 'Scroll',
    symbol: 'ETH',
    color: '#FFEEDA',
    explorer: 'https://scrollscan.com',
    coingeckoId: 'ethereum',
  },
  zksync: {
    id: 'zksync',
    name: 'zkSync Era',
    symbol: 'ETH',
    color: '#8C8DFC',
    explorer: 'https://explorer.zksync.io',
    coingeckoId: 'ethereum',
  },
  mantle: {
    id: 'mantle',
    name: 'Mantle',
    symbol: 'MNT',
    color: '#000000',
    explorer: 'https://mantlescan.info',
    coingeckoId: 'mantle',
  },
  gnosis: {
    id: 'gnosis',
    name: 'Gnosis',
    symbol: 'xDAI',
    color: '#04795B',
    explorer: 'https://gnosisscan.io',
    coingeckoId: 'xdai',
  },
  fantom: {
    id: 'fantom',
    name: 'Fantom',
    symbol: 'FTM',
    color: '#1969FF',
    explorer: 'https://ftmscan.com',
    coingeckoId: 'fantom',
  },
  cronos: {
    id: 'cronos',
    name: 'Cronos',
    symbol: 'CRO',
    color: '#002D74',
    explorer: 'https://cronoscan.com',
    coingeckoId: 'crypto-com-chain',
  },
  celo: {
    id: 'celo',
    name: 'Celo',
    symbol: 'CELO',
    color: '#FCFF52',
    explorer: 'https://celoscan.io',
    coingeckoId: 'celo',
  },
}

export const CHAIN_LIST = Object.values(CHAINS)

export function getChain(id: ChainId): ChainConfig {
  return CHAINS[id]
}

// Short hex display
export function shortenAddress(addr: string, start = 6, end = 4): string {
  if (!addr) return ''
  if (addr.length <= start + end) return addr
  return `${addr.slice(0, start)}...${addr.slice(-end)}`
}
