// ─── Chain ────────────────────────────────────────────────────────────────────

export type ChainId =
  | 'ethereum'
  | 'solana'
  | 'base'
  | 'arbitrum'
  | 'polygon'
  | 'bsc'
  | 'avalanche'
  | 'optimism'
  | 'linea'
  | 'scroll'
  | 'zksync'
  | 'mantle'
  | 'gnosis'
  | 'fantom'
  | 'cronos'
  | 'celo'

export interface ChainConfig {
  id: ChainId
  name: string
  symbol: string
  color: string
  explorer: string
  coingeckoId: string
  rpcUrl?: string
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export interface TrackedWallet {
  id: string
  address: string
  label: string
  chain: ChainId
  addedAt: number
  color: string
}

// ─── Token / Portfolio ────────────────────────────────────────────────────────

export interface TokenPosition {
  id: string
  symbol: string
  name: string
  logo?: string
  chain: ChainId
  walletId: string
  balance: number
  priceUsd: number
  priceChange24h: number
  valueUsd: number
  costBasis: number
  pnlUsd: number
  pnlPct: number
  allocation: number
  contractAddress?: string
}

export interface WalletPortfolio {
  walletId: string
  chain: ChainId
  totalValueUsd: number
  change24hUsd: number
  change24hPct: number
  tokens: TokenPosition[]
  lastFetched: number
}

// ─── Transaction ──────────────────────────────────────────────────────────────

export type TxType = 'send' | 'receive' | 'swap' | 'approve' | 'contract' | 'nft_buy'

export interface Transaction {
  hash: string
  type: TxType
  chain: ChainId
  walletId: string
  timestamp: number
  from: string
  to: string
  valueUsd: number
  feeUsd: number
  tokenSymbol?: string
  tokenAmount?: number
  toTokenSymbol?: string
  toTokenAmount?: number
  status: 'confirmed' | 'pending' | 'failed'
}

// ─── NFT ─────────────────────────────────────────────────────────────────────

export interface NFTItem {
  id: string
  tokenId: string
  name: string
  collection: string
  image: string
  chain: ChainId
  walletId: string
  contractAddress: string
  standard: string
  floorPriceEth: number
  floorPriceUsd: number
  lastSaleUsd: number
  rarity: number
}

// ─── DeFi Positions ───────────────────────────────────────────────────────────

export type DeFiPositionType = 'staking' | 'lending' | 'lp' | 'farming'

export interface DeFiPosition {
  id: string
  type: DeFiPositionType
  protocol: string
  protocolLogo: string
  chain: ChainId
  walletId: string
  tokens: string[]
  valueUsd: number
  apy: number
  pendingRewards: number
  pendingRewardSymbol: string
  depositedUsd: number
  pnlUsd: number
  openedAt: number
}

// ─── PnL Snapshot ────────────────────────────────────────────────────────────

export interface PnLSnapshot {
  date: string
  totalValueUsd: number
  dailyPnlUsd: number
  cumulativePnlUsd: number
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export type AlertType = 'price_above' | 'price_below' | 'gas_above' | 'mempool_above' | 'fng_above' | 'fng_below'

export interface AlertRule {
  id: string
  type: AlertType
  label: string
  threshold: number
  assetId?: string
  assetSymbol?: string
  enabled: boolean
  lastTriggered?: number
}

export interface PriceAlert {
  id: string
  tokenId: string
  symbol: string
  condition: 'above' | 'below'
  threshold: number
  enabled: boolean
  triggered: boolean
  lastTriggeredAt?: number
  createdAt: number
}

// ─── Whale ────────────────────────────────────────────────────────────────────

export interface WhaleWallet {
  id: string
  address: string
  label: string
  chain: ChainId
  tags: string[]
  totalValueUsd: number
  topHoldings: Array<{ symbol: string; valueUsd: number; pct: number }>
  txCount30d: number
  lastActive: number
  isFollowing: boolean
  color: string
}

// ─── Gas ─────────────────────────────────────────────────────────────────────

export interface GasEstimate {
  slow: number
  standard: number
  fast: number
  instant: number
  baseFeeGwei?: number
  unit: 'gwei' | 'microlamport'
  usdPerTx: { slow: number; standard: number; fast: number; instant: number }
  updatedAt: number
}

// ─── Coin (CoinGecko) ────────────────────────────────────────────────────────

export interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation?: number | null
  total_volume: number
  high_24h?: number
  low_24h?: number
  price_change_24h: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency: number
  market_cap_change_24h?: number
  market_cap_change_percentage_24h?: number
  circulating_supply?: number
  total_supply?: number | null
  max_supply?: number | null
  ath?: number
  ath_change_percentage?: number
  ath_date?: string
  atl?: number
  atl_change_percentage?: number
  atl_date?: string
  sparkline_in_7d: { price: number[] }
  last_updated: string
  categories?: string[]
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type PageId =
  | 'dashboard'
  | 'wallets'
  | 'portfolio'
  | 'transactions'
  | 'nfts'
  | 'defi'
  | 'pnl'
  | 'dca'
  | 'goals'
  | 'pools'
  | 'smart-allocator'
  | 'alerts'
  | 'whales'
  | 'gas'
  | 'markets'
  | 'screener'
  | 'yields'
  | 'analytics'
  | 'trends'
  | 'predictions'
  | 'scout'
  | 'news'
  | 'raises'
  | 'stablecoins'
  | 'bitcoin'
  | 'calculator'

// ─── DCA ─────────────────────────────────────────────────────────────────────

export type DCAFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly'

export interface DCAExecution {
  id: string
  date: string
  amountUsd: number
  priceAtExecution: number
  tokensAcquired: number
}

export interface DCAEntry {
  id: string
  tokenId: string
  tokenSymbol: string
  tokenName: string
  tokenLogo: string
  amountUsd: number
  frequency: DCAFrequency
  startDate: string
  lastExecuted?: string
  nextDate: string
  enabled: boolean
  history: DCAExecution[]
  totalInvested: number
  totalTokens: number
  avgCostBasis: number
  color: string
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export type GoalType = 'token_amount' | 'total_value' | 'allocation'

export interface Goal {
  id: string
  title: string
  description: string
  type: GoalType
  targetTokenId?: string
  targetTokenSymbol?: string
  targetAmount: number
  targetDate?: string
  createdAt: string
  color: string
  icon: string
}

export interface AllocationTarget {
  id: string
  tokenId: string
  tokenSymbol: string
  tokenLogo: string
  targetPct: number
  color: string
}

// ─── Price Data ───────────────────────────────────────────────────────────────

export interface PriceData {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_24h: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency: number
  market_cap: number
  total_volume: number
  sparkline_in_7d?: { price: number[] }
}

// ─── DeFi / Pools data (from DeFiLlama) ─────────────────────────────────────

export interface YieldPool {
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apyBase: number | null
  apyReward: number | null
  apy: number
  apyPct1D: number | null
  apyPct7D: number | null
  apyPct30D: number | null
  stablecoin: boolean
  ilRisk: string
  exposure: string
  pool: string
  poolMeta: string | null
  mu: number | null
  sigma: number | null
  count: number | null
  outlier: boolean
  underlyingTokens: string[] | null
  il7d: number | null
  apyBase7d: number | null
  apyMean30d: number | null
  volumeUsd1d: number | null
  volumeUsd7d: number | null
  apyBaseInception: number | null
}

export interface Protocol {
  id: string
  name: string
  symbol: string
  url: string
  description: string
  logo: string
  audits: string | null
  category: string
  chain?: string
  chains: string[]
  tvl: number
  change_1h: number | null
  change_1d: number | null
  change_7d: number | null
  mcap: number | null
  forkedFrom: string[]
  slug: string
  listedAt: number | null
  twitter: string | null
  parentProtocol: string | null
  chainTvls: Record<string, number>
}

// ─── Legacy types (for backward compatibility) ───────────────────────────────

export interface GasNow {
  slow: number
  standard: number
  fast: number
  rapid: number
  timestamp: number
}

export interface MempoolStats {
  count: number
  vsize: number
  total_fee: number
}

export interface FearGreed {
  value: string
  value_classification: string
  timestamp: string
  time_until_update: string | null
}
