import type { ChainId, TokenPosition, Transaction, NFTItem, DeFiPosition, PnLSnapshot, TxType } from '../types'

// ─── Seeded RNG ───────────────────────────────────────────────────────────────

function hashStr(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i)
  return Math.abs(h >>> 0)
}

function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}

// ─── Token definitions per chain ─────────────────────────────────────────────

interface TokenDef {
  id: string
  symbol: string
  name: string
  logo: string
  minAmt: number
  maxAmt: number
  costBasisMultiplier: [number, number]
}

const CHAIN_TOKENS: Partial<Record<ChainId, TokenDef[]>> = {
  ethereum: [
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', minAmt: 0.5, maxAmt: 40, costBasisMultiplier: [0.4, 1.2] },
    { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', minAmt: 500, maxAmt: 80000, costBasisMultiplier: [0.99, 1.01] },
    { id: 'tether', symbol: 'USDT', name: 'Tether', logo: 'https://assets.coingecko.com/coins/images/325/small/tether.png', minAmt: 200, maxAmt: 50000, costBasisMultiplier: [0.99, 1.01] },
    { id: 'wrapped-bitcoin', symbol: 'WBTC', name: 'Wrapped BTC', logo: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png', minAmt: 0.005, maxAmt: 1.5, costBasisMultiplier: [0.5, 1.1] },
    { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', logo: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png', minAmt: 20, maxAmt: 3000, costBasisMultiplier: [0.3, 1.5] },
    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', logo: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png', minAmt: 50, maxAmt: 5000, costBasisMultiplier: [0.4, 1.3] },
    { id: 'aave', symbol: 'AAVE', name: 'Aave', logo: 'https://assets.coingecko.com/coins/images/12645/small/aave-token-round.png', minAmt: 1, maxAmt: 80, costBasisMultiplier: [0.3, 1.4] },
    { id: 'lido-dao', symbol: 'LDO', name: 'Lido DAO', logo: 'https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png', minAmt: 100, maxAmt: 20000, costBasisMultiplier: [0.2, 1.6] },
  ],
  solana: [
    { id: 'solana', symbol: 'SOL', name: 'Solana', logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', minAmt: 2, maxAmt: 300, costBasisMultiplier: [0.3, 1.2] },
    { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', minAmt: 500, maxAmt: 30000, costBasisMultiplier: [0.99, 1.01] },
    { id: 'raydium', symbol: 'RAY', name: 'Raydium', logo: 'https://assets.coingecko.com/coins/images/13928/small/PSigc4ie_400x400.jpg', minAmt: 50, maxAmt: 5000, costBasisMultiplier: [0.2, 1.8] },
    { id: 'jupiter-exchange-solana', symbol: 'JUP', name: 'Jupiter', logo: 'https://assets.coingecko.com/coins/images/34188/small/jup.png', minAmt: 200, maxAmt: 15000, costBasisMultiplier: [0.3, 1.5] },
    { id: 'bonk', symbol: 'BONK', name: 'Bonk', logo: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg', minAmt: 5000000, maxAmt: 2000000000, costBasisMultiplier: [0.1, 2.0] },
  ],
  base: [
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', minAmt: 0.2, maxAmt: 20, costBasisMultiplier: [0.5, 1.2] },
    { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', minAmt: 200, maxAmt: 40000, costBasisMultiplier: [0.99, 1.01] },
    { id: 'aerodrome-finance', symbol: 'AERO', name: 'Aerodrome', logo: 'https://assets.coingecko.com/coins/images/31745/small/token.png', minAmt: 100, maxAmt: 20000, costBasisMultiplier: [0.2, 1.7] },
  ],
  arbitrum: [
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', minAmt: 0.3, maxAmt: 25, costBasisMultiplier: [0.5, 1.2] },
    { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum', logo: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg', minAmt: 200, maxAmt: 15000, costBasisMultiplier: [0.3, 1.5] },
    { id: 'gmx', symbol: 'GMX', name: 'GMX', logo: 'https://assets.coingecko.com/coins/images/18323/small/arbit.png', minAmt: 5, maxAmt: 500, costBasisMultiplier: [0.4, 1.4] },
    { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', minAmt: 300, maxAmt: 30000, costBasisMultiplier: [0.99, 1.01] },
  ],
  polygon: [
    { id: 'matic-network', symbol: 'POL', name: 'Polygon', logo: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png', minAmt: 500, maxAmt: 50000, costBasisMultiplier: [0.3, 1.6] },
    { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', minAmt: 200, maxAmt: 20000, costBasisMultiplier: [0.99, 1.01] },
    { id: 'aave', symbol: 'AAVE', name: 'Aave', logo: 'https://assets.coingecko.com/coins/images/12645/small/aave-token-round.png', minAmt: 2, maxAmt: 100, costBasisMultiplier: [0.4, 1.3] },
  ],
  bsc: [
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', minAmt: 2, maxAmt: 200, costBasisMultiplier: [0.3, 1.5] },
    { id: 'pancakeswap-token', symbol: 'CAKE', name: 'PancakeSwap', logo: 'https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo_%281%29.png', minAmt: 50, maxAmt: 5000, costBasisMultiplier: [0.2, 1.8] },
    { id: 'tether', symbol: 'USDT', name: 'Tether', logo: 'https://assets.coingecko.com/coins/images/325/small/tether.png', minAmt: 200, maxAmt: 20000, costBasisMultiplier: [0.99, 1.01] },
  ],
  avalanche: [
    { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', logo: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png', minAmt: 5, maxAmt: 500, costBasisMultiplier: [0.3, 1.6] },
    { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', minAmt: 200, maxAmt: 15000, costBasisMultiplier: [0.99, 1.01] },
    { id: 'joe', symbol: 'JOE', name: 'Trader Joe', logo: 'https://assets.coingecko.com/coins/images/17569/small/traderjoe.png', minAmt: 100, maxAmt: 10000, costBasisMultiplier: [0.2, 2.0] },
  ],
  optimism: [
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', minAmt: 0.2, maxAmt: 15, costBasisMultiplier: [0.5, 1.2] },
    { id: 'optimism', symbol: 'OP', name: 'Optimism', logo: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png', minAmt: 100, maxAmt: 10000, costBasisMultiplier: [0.3, 1.7] },
    { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', minAmt: 200, maxAmt: 20000, costBasisMultiplier: [0.99, 1.01] },
  ],
}

const FALLBACK_PRICES: Record<string, number> = {
  'ethereum': 3200, 'solana': 180, 'bitcoin': 65000,
  'usd-coin': 1, 'tether': 1,
  'wrapped-bitcoin': 64800, 'uniswap': 12, 'chainlink': 18,
  'aave': 320, 'lido-dao': 2.1, 'raydium': 2.5,
  'jupiter-exchange-solana': 0.9, 'bonk': 0.000025,
  'arbitrum': 0.85, 'gmx': 28, 'aerodrome-finance': 1.2,
  'matic-network': 0.55, 'binancecoin': 580, 'pancakeswap-token': 2.8,
  'avalanche-2': 38, 'joe': 0.22, 'optimism': 2.4,
}

const NFT_COLLECTIONS: Partial<Record<ChainId, Array<{ name: string; contract: string; floorEth: number }>>> = {
  ethereum: [
    { name: 'Bored Ape Yacht Club', contract: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', floorEth: 14.2 },
    { name: 'CryptoPunks', contract: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb', floorEth: 42.5 },
    { name: 'Azuki', contract: '0xed5af388653567af2f388e6224dc7c4b3241c544', floorEth: 8.1 },
    { name: 'Pudgy Penguins', contract: '0xbd3531da5cf5857e7cfaa92426877b022e612cf8', floorEth: 12.3 },
    { name: 'Milady Maker', contract: '0x5af0d9827e0c53e4799bb226655a1de152a425a0', floorEth: 3.2 },
  ],
  solana: [
    { name: 'Mad Lads', contract: 'J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w', floorEth: 220 },
    { name: 'DeGods', contract: '6XxjKYFbcndh2gDcsUrmZgVEsoDxXMnfsaGY6fpTJzNr', floorEth: 35 },
  ],
}

const DEFI_PROTOCOLS = [
  { name: 'Aave', logo: 'https://assets.coingecko.com/coins/images/12645/small/aave-token-round.png', apy: 4.2, type: 'lending' as const },
  { name: 'Uniswap V3', logo: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png', apy: 18.5, type: 'lp' as const },
  { name: 'Lido', logo: 'https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png', apy: 3.8, type: 'staking' as const },
  { name: 'Curve', logo: 'https://assets.coingecko.com/coins/images/12124/small/Curve.png', apy: 8.1, type: 'lp' as const },
  { name: 'Compound', logo: 'https://assets.coingecko.com/coins/images/10775/small/COMP-Token.png', apy: 3.1, type: 'lending' as const },
  { name: 'GMX', logo: 'https://assets.coingecko.com/coins/images/18323/small/arbit.png', apy: 22.4, type: 'farming' as const },
]

export function generatePortfolio(
  walletId: string,
  address: string,
  chain: ChainId,
  priceMap: Record<string, number>
): TokenPosition[] {
  const rand = seeded(hashStr(address + chain))
  const tokenDefs = CHAIN_TOKENS[chain] ?? CHAIN_TOKENS.ethereum ?? []
  const numTokens = 2 + Math.floor(rand() * (tokenDefs.length - 1))
  const selected = [...tokenDefs].sort(() => rand() - 0.5).slice(0, numTokens)

  return selected.map((def, i) => {
    const r = seeded(hashStr(address + def.id + i))
    const t = r()
    const balance = def.minAmt + t * (def.maxAmt - def.minAmt)
    const price = priceMap[def.id] ?? FALLBACK_PRICES[def.id] ?? 1
    const valueUsd = balance * price
    const cbMult = def.costBasisMultiplier[0] + r() * (def.costBasisMultiplier[1] - def.costBasisMultiplier[0])
    const costBasis = price * cbMult
    const pnl = (price - costBasis) * balance
    const pnlPct = ((price - costBasis) / costBasis) * 100

    return {
      id: def.id,
      symbol: def.symbol,
      name: def.name,
      logo: def.logo,
      chain,
      walletId,
      balance,
      priceUsd: price,
      priceChange24h: (r() - 0.5) * 12,
      valueUsd,
      costBasis,
      pnlUsd: pnl,
      pnlPct,
      allocation: 0,
    }
  })
}

export function generateTransactions(
  walletId: string,
  address: string,
  chain: ChainId,
  ethPrice: number
): Transaction[] {
  const rand = seeded(hashStr(address + 'txns' + chain))
  const count = 8 + Math.floor(rand() * 15)
  const txTypes: TxType[] = ['send', 'receive', 'swap', 'approve', 'contract', 'nft_buy']
  const tokens = (CHAIN_TOKENS[chain] ?? CHAIN_TOKENS.ethereum ?? []).map(t => t.symbol)
  const now = Date.now()

  return Array.from({ length: count }, (_, i) => {
    const r = seeded(hashStr(address + i + 'tx'))
    const type = txTypes[Math.floor(r() * txTypes.length)]
    const daysAgo = r() * 60
    const timestamp = now - daysAgo * 86400 * 1000
    const valueUsd = 50 + r() * 15000
    const feeUsd = 0.5 + r() * 8
    const fromToken = tokens[Math.floor(r() * tokens.length)]
    const toToken = tokens[Math.floor(r() * tokens.length)]
    const hash = Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(r() * 16)]).join('')

    return {
      hash: '0x' + hash,
      type,
      chain,
      walletId,
      timestamp,
      from: address,
      to: '0x' + Array.from({ length: 40 }, () => '0123456789abcdef'[Math.floor(r() * 16)]).join(''),
      valueUsd,
      feeUsd,
      tokenSymbol: fromToken,
      tokenAmount: valueUsd / (ethPrice || 3200),
      toTokenSymbol: type === 'swap' ? toToken : undefined,
      toTokenAmount: type === 'swap' ? (valueUsd / 2) / (ethPrice || 3200) : undefined,
      status: 'confirmed' as const,
    }
  }).sort((a, b) => b.timestamp - a.timestamp)
}

export function generateNFTs(
  walletId: string,
  address: string,
  chain: ChainId,
  _ethPrice?: number
): NFTItem[] {
  const collections = NFT_COLLECTIONS[chain]
  if (!collections) return []

  const rand = seeded(hashStr(address + 'nfts'))
  if (rand() > 0.7) return []

  const collection = collections[Math.floor(rand() * collections.length)]
  const count = 1 + Math.floor(rand() * 3)

  return Array.from({ length: count }, (_, i) => {
    const r = seeded(hashStr(address + collection.name + i))
    const tokenId = Math.floor(r() * 10000)
    const floorEth = collection.floorEth * (0.9 + r() * 0.3)
    const floorUsd = floorEth * 3200

    return {
      id: `nft-${chain}-${collection.name}-${tokenId}`,
      tokenId: String(tokenId),
      name: `${collection.name} #${tokenId}`,
      collection: collection.name,
      image: `https://picsum.photos/seed/${collection.name.replace(/ /g, '')}${tokenId}/400/400`,
      chain,
      walletId,
      contractAddress: collection.contract,
      standard: 'erc721',
      floorPriceEth: floorEth,
      floorPriceUsd: floorUsd,
      lastSaleUsd: floorUsd * (0.8 + r() * 0.5),
      rarity: Math.floor(r() * 100),
    }
  })
}

export function generateDeFiPositions(
  walletId: string,
  address: string,
  chain: ChainId,
  _ethPrice?: number
): DeFiPosition[] {
  const rand = seeded(hashStr(address + 'defi'))
  if (rand() > 0.6) return []

  const count = 1 + Math.floor(rand() * 3)

  return Array.from({ length: count }, (_, i) => {
    const r = seeded(hashStr(address + 'pos' + i))
    const protocol = DEFI_PROTOCOLS[Math.floor(r() * DEFI_PROTOCOLS.length)]
    const depositedUsd = 500 + r() * 50000
    const apy = protocol.apy * (0.8 + r() * 0.4)
    const ageMonths = 0.5 + r() * 18
    const earned = depositedUsd * (apy / 100) * (ageMonths / 12)
    const priceChange = (r() - 0.4) * 0.3
    const currentValue = depositedUsd * (1 + priceChange)

    return {
      id: `${walletId}-${protocol.name}-${i}`,
      type: protocol.type,
      protocol: protocol.name,
      protocolLogo: protocol.logo,
      chain: (chain === 'base' || chain === 'optimism' || chain === 'arbitrum') ? chain : ('ethereum' as ChainId),
      walletId,
      tokens: ['ETH', 'USDC'],
      valueUsd: currentValue + earned,
      apy,
      pendingRewards: earned,
      pendingRewardSymbol: protocol.type === 'staking' ? 'ETH' : 'USDC',
      depositedUsd,
      pnlUsd: currentValue - depositedUsd + earned,
      openedAt: Date.now() - ageMonths * 30 * 86400 * 1000,
    }
  })
}

export function generatePnLHistory(baseValue: number, days = 90): PnLSnapshot[] {
  const rand = seeded(hashStr(String(Math.floor(baseValue))))
  const now = Date.now()
  let cumulative = 0
  let value = baseValue * 0.7

  return Array.from({ length: days }, (_, i) => {
    const r = rand()
    const dailyChange = (r - 0.44) * baseValue * 0.04
    value += dailyChange
    cumulative += dailyChange
    const date = new Date(now - (days - i) * 86400 * 1000).toISOString().slice(0, 10)
    return { date, totalValueUsd: Math.max(value, 0), dailyPnlUsd: dailyChange, cumulativePnlUsd: cumulative }
  })
}
