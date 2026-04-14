import type { ChainId, ChainConfig } from '../types'

export const CHAINS: Record<ChainId, ChainConfig> = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    color: '#627EEA',
    explorer: 'https://etherscan.io',
    coingeckoId: 'ethereum',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    color: '#9945FF',
    explorer: 'https://solscan.io',
    coingeckoId: 'solana',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
  },
  base: {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    color: '#0052FF',
    explorer: 'https://basescan.org',
    coingeckoId: 'ethereum',
    rpcUrl: 'https://mainnet.base.org',
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ETH',
    color: '#12AAFF',
    explorer: 'https://arbiscan.io',
    coingeckoId: 'ethereum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'POL',
    color: '#8247E5',
    explorer: 'https://polygonscan.com',
    coingeckoId: 'matic-network',
    rpcUrl: 'https://polygon-rpc.com',
  },
  bsc: {
    id: 'bsc',
    name: 'BNB Chain',
    symbol: 'BNB',
    color: '#F3BA2F',
    explorer: 'https://bscscan.com',
    coingeckoId: 'binancecoin',
    rpcUrl: 'https://bsc-dataseed.binance.org',
  },
  avalanche: {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    color: '#E84142',
    explorer: 'https://snowtrace.io',
    coingeckoId: 'avalanche-2',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  },
  optimism: {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'ETH',
    color: '#FF0420',
    explorer: 'https://optimistic.etherscan.io',
    coingeckoId: 'ethereum',
    rpcUrl: 'https://mainnet.optimism.io',
  },
  linea: {
    id: 'linea',
    name: 'Linea',
    symbol: 'ETH',
    color: '#61DFFF',
    explorer: 'https://lineascan.build',
    coingeckoId: 'ethereum',
    rpcUrl: 'https://rpc.linea.build',
  },
  scroll: {
    id: 'scroll',
    name: 'Scroll',
    symbol: 'ETH',
    color: '#FFEEDA',
    explorer: 'https://scrollscan.com',
    coingeckoId: 'ethereum',
    rpcUrl: 'https://rpc.scroll.io',
  },
  zksync: {
    id: 'zksync',
    name: 'zkSync Era',
    symbol: 'ETH',
    color: '#8C8DFC',
    explorer: 'https://explorer.zksync.io',
    coingeckoId: 'ethereum',
    rpcUrl: 'https://mainnet.era.zksync.io',
  },
  mantle: {
    id: 'mantle',
    name: 'Mantle',
    symbol: 'MNT',
    color: '#000000',
    explorer: 'https://mantlescan.info',
    coingeckoId: 'mantle',
    rpcUrl: 'https://rpc.mantle.xyz',
  },
  gnosis: {
    id: 'gnosis',
    name: 'Gnosis',
    symbol: 'xDAI',
    color: '#04795B',
    explorer: 'https://gnosisscan.io',
    coingeckoId: 'xdai',
    rpcUrl: 'https://rpc.gnosischain.com',
  },
  fantom: {
    id: 'fantom',
    name: 'Fantom',
    symbol: 'FTM',
    color: '#1969FF',
    explorer: 'https://ftmscan.com',
    coingeckoId: 'fantom',
    rpcUrl: 'https://rpc.ftm.tools',
  },
  cronos: {
    id: 'cronos',
    name: 'Cronos',
    symbol: 'CRO',
    color: '#002D74',
    explorer: 'https://cronoscan.com',
    coingeckoId: 'crypto-com-chain',
    rpcUrl: 'https://evm.cronos.org',
  },
  celo: {
    id: 'celo',
    name: 'Celo',
    symbol: 'CELO',
    color: '#FCFF52',
    explorer: 'https://celoscan.io',
    coingeckoId: 'celo',
    rpcUrl: 'https://forno.celo.org',
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
