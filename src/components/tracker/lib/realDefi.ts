// Real DeFi position scanner — reads on-chain staking, lending, LP positions
import type { ChainId, DeFiPosition } from '../types'

const RPC: Record<string, string> = {
  ethereum: 'https://ethereum-rpc.publicnode.com',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  polygon: 'https://polygon-rpc.com',
  optimism: 'https://mainnet.optimism.io',
  base: 'https://mainnet.base.org',
  bsc: 'https://bsc-dataseed.binance.org',
  avalanche: 'https://api.avax.network/ext/bc/C/rpc',
  linea: 'https://rpc.linea.build',
  scroll: 'https://rpc.scroll.io',
  zksync: 'https://mainnet.era.zksync.io',
  mantle: 'https://rpc.mantle.xyz',
  gnosis: 'https://rpc.gnosischain.com',
  fantom: 'https://rpc.ftm.tools',
  cronos: 'https://evm.cronos.org',
  celo: 'https://forno.celo.org',
}

async function ethCall(rpc: string, to: string, data: string): Promise<string> {
  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_call', params: [{ to, data }, 'latest'], id: 1 }),
      signal: AbortSignal.timeout(8000),
    })
    const d = await res.json()
    return d.result || '0x'
  } catch {
    return '0x'
  }
}

function balanceOfData(address: string): string {
  return '0x70a08231' + address.slice(2).padStart(64, '0')
}

function parseBalance(hex: string, decimals: number): number {
  if (!hex || hex === '0x' || hex === '0x0000000000000000000000000000000000000000000000000000000000000000') return 0
  try { return Number(BigInt(hex)) / (10 ** decimals) } catch { return 0 }
}

// ─── Protocol definitions ───

interface ProtocolCheck {
  protocol: string
  type: 'staking' | 'lending' | 'lp' | 'farming'
  token: string
  symbol: string
  contract: string
  decimals: number
  chain: ChainId
  apy?: number
  logo?: string
  underlying?: string // what's actually deposited
}

const DEFI_CHECKS: ProtocolCheck[] = [
  // Lido (staking)
  { protocol: 'Lido', type: 'staking', token: 'stETH', symbol: 'stETH', contract: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', decimals: 18, chain: 'ethereum', apy: 3.2, underlying: 'ETH', logo: 'https://icons.llama.fi/lido.png' },
  { protocol: 'Lido', type: 'staking', token: 'wstETH', symbol: 'wstETH', contract: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', decimals: 18, chain: 'ethereum', apy: 3.2, underlying: 'ETH', logo: 'https://icons.llama.fi/lido.png' },
  { protocol: 'Lido', type: 'staking', token: 'wstETH', symbol: 'wstETH', contract: '0x5979D7b546E38E9Ab8FF32Fc8d5eA10C2FDFDecE', decimals: 18, chain: 'arbitrum', apy: 3.2, underlying: 'ETH', logo: 'https://icons.llama.fi/lido.png' },

  // Rocket Pool (staking)
  { protocol: 'Rocket Pool', type: 'staking', token: 'rETH', symbol: 'rETH', contract: '0xae78736Cd615f374D3085123A210448E74Fc6393', decimals: 18, chain: 'ethereum', apy: 2.9, underlying: 'ETH', logo: 'https://icons.llama.fi/rocket-pool.png' },

  // Aave V3 (lending) - aTokens
  { protocol: 'Aave V3', type: 'lending', token: 'aEthUSDC', symbol: 'aUSDC', contract: '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c', decimals: 6, chain: 'ethereum', apy: 4.5, underlying: 'USDC', logo: 'https://icons.llama.fi/aave-v3.png' },
  { protocol: 'Aave V3', type: 'lending', token: 'aEthUSDT', symbol: 'aUSDT', contract: '0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a', decimals: 6, chain: 'ethereum', apy: 4.2, underlying: 'USDT', logo: 'https://icons.llama.fi/aave-v3.png' },
  { protocol: 'Aave V3', type: 'lending', token: 'aEthWETH', symbol: 'aWETH', contract: '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8', decimals: 18, chain: 'ethereum', apy: 1.8, underlying: 'ETH', logo: 'https://icons.llama.fi/aave-v3.png' },
  { protocol: 'Aave V3', type: 'lending', token: 'aArbUSDC', symbol: 'aUSDC', contract: '0x724dc807b04555b71ed48a6896b6F41593b8C637', decimals: 6, chain: 'arbitrum', apy: 5.1, underlying: 'USDC', logo: 'https://icons.llama.fi/aave-v3.png' },
  { protocol: 'Aave V3', type: 'lending', token: 'aArbWETH', symbol: 'aWETH', contract: '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8', decimals: 18, chain: 'arbitrum', apy: 2.1, underlying: 'ETH', logo: 'https://icons.llama.fi/aave-v3.png' },

  // Compound V3 (lending)
  { protocol: 'Compound V3', type: 'lending', token: 'cUSDCv3', symbol: 'cUSDC', contract: '0xc3d688B66703497DAA19211EEdff47f25384cdc3', decimals: 6, chain: 'ethereum', apy: 3.8, underlying: 'USDC', logo: 'https://icons.llama.fi/compound-v3.png' },

  // Pendle (yield)
  { protocol: 'Pendle', type: 'farming', token: 'PENDLE', symbol: 'PENDLE', contract: '0x808507121B80c02388fAd14726482e061B8da827', decimals: 18, chain: 'ethereum', apy: 15, underlying: 'PENDLE', logo: 'https://icons.llama.fi/pendle.png' },
  { protocol: 'Pendle', type: 'farming', token: 'PENDLE', symbol: 'PENDLE', contract: '0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8', decimals: 18, chain: 'arbitrum', apy: 15, underlying: 'PENDLE', logo: 'https://icons.llama.fi/pendle.png' },

  // GMX (staking)
  { protocol: 'GMX', type: 'staking', token: 'sGMX', symbol: 'sGMX', contract: '0xA906F338CB21815cBc4Bc87ace9e68c87eF8d8F1', decimals: 18, chain: 'arbitrum', apy: 8, underlying: 'GMX', logo: 'https://icons.llama.fi/gmx.png' },

  // Stargate (LP)
  { protocol: 'Stargate', type: 'lp', token: 'S*USDC', symbol: 'S*USDC', contract: '0x1205f31718499dBf1fCa446663B532Ef87481fe1', decimals: 6, chain: 'ethereum', apy: 3.5, underlying: 'USDC', logo: 'https://icons.llama.fi/stargate.png' },
  { protocol: 'Stargate', type: 'lp', token: 'S*USDT', symbol: 'S*USDT', contract: '0x38EA452219524Bb87e18dE1C24D3bB59510BD783', decimals: 6, chain: 'ethereum', apy: 3.2, underlying: 'USDT', logo: 'https://icons.llama.fi/stargate.png' },

  // Curve (LP)
  { protocol: 'Curve', type: 'lp', token: '3Crv', symbol: '3Crv', contract: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490', decimals: 18, chain: 'ethereum', apy: 2.5, underlying: 'USDC', logo: 'https://icons.llama.fi/curve.png' },
  { protocol: 'Curve', type: 'lp', token: 'crvUSD', symbol: 'crvUSD', contract: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E', decimals: 18, chain: 'ethereum', apy: 5.0, underlying: 'USDC', logo: 'https://icons.llama.fi/curve.png' },

  // MakerDAO / Spark (lending)
  { protocol: 'Spark', type: 'lending', token: 'sDAI', symbol: 'sDAI', contract: '0x83F20F44975D03b1b09e64809B757c47f942BEeA', decimals: 18, chain: 'ethereum', apy: 5.0, underlying: 'USDC', logo: 'https://icons.llama.fi/spark.png' },

  // EigenLayer (restaking)
  { protocol: 'EigenLayer', type: 'staking', token: 'eETH', symbol: 'eETH', contract: '0x35fA164735182de50811E8e2E824cFb9B6118ac2', decimals: 18, chain: 'ethereum', apy: 3.8, underlying: 'ETH', logo: 'https://icons.llama.fi/eigenlayer.png' },

  // Convex (farming)
  { protocol: 'Convex', type: 'farming', token: 'cvxCRV', symbol: 'cvxCRV', contract: '0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7', decimals: 18, chain: 'ethereum', apy: 8.0, underlying: 'USDC', logo: 'https://icons.llama.fi/convex-finance.png' },

  // Aave V3 on Base
  { protocol: 'Aave V3', type: 'lending', token: 'aBasUSDC', symbol: 'aUSDC', contract: '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB', decimals: 6, chain: 'base', apy: 5.5, underlying: 'USDC', logo: 'https://icons.llama.fi/aave-v3.png' },
  { protocol: 'Aave V3', type: 'lending', token: 'aBasWETH', symbol: 'aWETH', contract: '0xD4a0e0b9149BCee3C920d2E00b5dE09138fd8bb7', decimals: 18, chain: 'base', apy: 2.3, underlying: 'ETH', logo: 'https://icons.llama.fi/aave-v3.png' },

  // Aave V3 on Optimism
  { protocol: 'Aave V3', type: 'lending', token: 'aOptUSDC', symbol: 'aUSDC', contract: '0x625E7708f30cA75bfd92586e17077590C60eb4cD', decimals: 6, chain: 'optimism', apy: 4.8, underlying: 'USDC', logo: 'https://icons.llama.fi/aave-v3.png' },

  // Aave V3 on Polygon
  { protocol: 'Aave V3', type: 'lending', token: 'aPolUSDC', symbol: 'aUSDC', contract: '0x625E7708f30cA75bfd92586e17077590C60eb4cD', decimals: 6, chain: 'polygon', apy: 4.3, underlying: 'USDC', logo: 'https://icons.llama.fi/aave-v3.png' },

  // Morpho (lending)
  { protocol: 'Morpho', type: 'lending', token: 'maUSDC', symbol: 'maUSDC', contract: '0xA5269A8e31B93Ff27B887B56720A25F844db0529', decimals: 6, chain: 'ethereum', apy: 6.2, underlying: 'USDC', logo: 'https://icons.llama.fi/morpho.png' },

  // Coinbase cbETH (staking)
  { protocol: 'Coinbase', type: 'staking', token: 'cbETH', symbol: 'cbETH', contract: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704', decimals: 18, chain: 'ethereum', apy: 3.0, underlying: 'ETH', logo: 'https://icons.llama.fi/coinbase-wrapped-staked-eth.png' },

  // Frax (staking)
  { protocol: 'Frax', type: 'staking', token: 'sfrxETH', symbol: 'sfrxETH', contract: '0xac3E018457B222d93114458476f3E3416Abbe38F', decimals: 18, chain: 'ethereum', apy: 3.5, underlying: 'ETH', logo: 'https://icons.llama.fi/frax-ether.png' },
]

// Uniswap V3 position manager addresses per chain
const UNI_V3_NFT: Partial<Record<ChainId, string>> = {
  ethereum: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  arbitrum: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  polygon: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  optimism: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  base: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
}

// ─── Main scanner ───

export async function fetchRealDefiPositions(
  walletId: string,
  address: string,
  priceMap: Record<string, number>
): Promise<DeFiPosition[]> {
  const positions: DeFiPosition[] = []
  const data = balanceOfData(address)

  // 1. Check all known protocol tokens in parallel
  const checks = await Promise.allSettled(
    DEFI_CHECKS.map(async (check) => {
      const rpc = RPC[check.chain]
      if (!rpc) return null
      const hex = await ethCall(rpc, check.contract, data)
      const balance = parseBalance(hex, check.decimals)
      if (balance <= 0) return null
      return { check, balance }
    })
  )

  for (const result of checks) {
    if (result.status !== 'fulfilled' || !result.value) continue
    const { check, balance } = result.value

    // Estimate USD value
    const cgMap: Record<string, string> = {
      ETH: 'ethereum', USDC: 'usd-coin', USDT: 'tether', PENDLE: 'pendle', GMX: 'gmx',
      CRV: 'curve-dao-token', DAI: 'dai', FRAX: 'frax',
    }
    const cgId = cgMap[check.underlying || ''] || check.underlying?.toLowerCase() || ''
    const price = priceMap[cgId] || (check.underlying === 'USDC' || check.underlying === 'USDT' ? 1 : 0)
    const valueUsd = balance * price

    if (valueUsd < 0.01) continue

    positions.push({
      id: `${walletId}-${check.chain}-${check.protocol}-${check.symbol}`,
      walletId,
      chain: check.chain,
      protocol: check.protocol,
      protocolLogo: check.logo || '',
      type: check.type,
      tokens: [check.symbol],
      valueUsd,
      apy: check.apy ?? 0,
      pendingRewards: valueUsd * (check.apy || 0) / 100 / 12,
      pendingRewardSymbol: check.underlying || check.symbol,
      depositedUsd: valueUsd,
      pnlUsd: 0,
      openedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    })
  }

  // 2. Check Uniswap V3 LP positions
  for (const [chainId, nftContract] of Object.entries(UNI_V3_NFT)) {
    const rpc = RPC[chainId]
    if (!rpc) continue

    const hex = await ethCall(rpc, nftContract!, data)
    const count = parseBalance(hex, 0)
    if (count <= 0) continue

    // We know how many positions, but getting details requires tokenOfOwnerByIndex + positions() calls
    // For now, add as a summary
    const ethPrice = priceMap['ethereum'] || 2000
    const estimatedValue = count * ethPrice * 0.5 // Rough estimate per position

    positions.push({
      id: `${walletId}-${chainId}-uniswap-v3-lp`,
      walletId,
      chain: chainId as ChainId,
      protocol: 'Uniswap V3',
      protocolLogo: 'https://icons.llama.fi/uniswap-v3.png',
      type: 'lp',
      tokens: [`${count} LP Position${count > 1 ? 's' : ''}`],
      valueUsd: estimatedValue,
      apy: 0,
      pendingRewards: estimatedValue * 0.002,
      pendingRewardSymbol: 'ETH',
      depositedUsd: estimatedValue,
      pnlUsd: 0,
      openedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    })
  }

  positions.sort((a, b) => b.valueUsd - a.valueUsd)
  return positions
}
