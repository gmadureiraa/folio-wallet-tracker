import { useState, useMemo, useEffect } from 'react'
import { Shield, Flame, Zap, Filter, Loader2, Star, AlertTriangle } from 'lucide-react'
import { fmtUSD } from '../lib/formatters'
import { CHAINS } from '../lib/chains'
import type { ChainId } from '../types'

interface Pool {
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apy: number
  apyBase?: number
  apyReward?: number
  stablecoin: boolean
  ilRisk?: string
  pool: string
  rewardTokens?: string[]
  apyPct7D?: number
  volumeUsd7d?: number
  exposure?: string
}

const CARD_STYLE = { background: '#FFFFFF', border: '1px solid #E5E5E5' }

type Category = 'recommended' | 'stablecoins' | 'eth-staking' | 'high-yield' | 'all'

const CATEGORIES: { id: Category; label: string; icon: typeof Shield; desc: string; color: string }[] = [
  { id: 'recommended', label: 'Recomendados', icon: Star, desc: 'Equilibrio entre rendimento e seguranca', color: '#F59E0B' },
  { id: 'stablecoins', label: 'Stablecoins', icon: Shield, desc: 'Pools de stablecoins — baixo risco', color: '#22C55E' },
  { id: 'eth-staking', label: 'ETH Staking', icon: Zap, desc: 'Liquid staking e restaking de ETH', color: '#627EEA' },
  { id: 'high-yield', label: 'Alto Rendimento', icon: Flame, desc: 'APY alto — mais risco', color: '#EF4444' },
  { id: 'all', label: 'Todos', icon: Filter, desc: 'Todas as pools disponiveis', color: '#737373' },
]

const CHAIN_FILTER_LIST: ChainId[] = ['ethereum', 'arbitrum', 'polygon', 'optimism', 'base', 'bsc', 'avalanche', 'linea', 'scroll', 'zksync', 'fantom', 'gnosis']

type SortKey = 'default' | 'apy-desc' | 'apy-asc' | 'tvl-desc' | 'tvl-asc'

function getRiskLevel(pool: Pool): { label: string; color: string } {
  if (pool.stablecoin && pool.tvlUsd > 50_000_000) return { label: 'Very Safe', color: '#22C55E' }
  if (pool.stablecoin) return { label: 'Safe', color: '#22C55E' }
  if (pool.tvlUsd > 100_000_000 && pool.apy < 10) return { label: 'Low Risk', color: '#3B82F6' }
  if (pool.tvlUsd > 10_000_000 && pool.apy < 20) return { label: 'Medium', color: '#F59E0B' }
  if (pool.apy > 50) return { label: 'High Risk', color: '#EF4444' }
  return { label: 'Moderate', color: '#F59E0B' }
}

interface PoolsProps {
  yields?: any[]
  protocols?: any[]
  loading?: boolean
  priceMap?: Record<string, number>
}

export function Pools(_props: PoolsProps) {
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<Category>('recommended')
  const [chainFilter, setChainFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('default')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('https://yields.llama.fi/pools', { signal: AbortSignal.timeout(15000) })
        const data = await res.json()
        const valid = (data.data || []).filter((p: Pool) =>
          p.tvlUsd > 100000 && p.apy > 0.1 && p.apy < 500 && p.symbol && p.project
        )
        setPools(valid)
      } catch { /* silent */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = pools

    if (chainFilter !== 'all') {
      result = result.filter(p => p.chain?.toLowerCase() === chainFilter)
    }

    switch (category) {
      case 'recommended':
        result = result
          .filter(p => p.tvlUsd > 5_000_000 && p.apy > 3 && p.apy < 30 && !p.ilRisk)
          .sort((a, b) => {
            const scoreA = a.apy * Math.log10(a.tvlUsd)
            const scoreB = b.apy * Math.log10(b.tvlUsd)
            return scoreB - scoreA
          })
        break
      case 'stablecoins':
        result = result
          .filter(p => p.stablecoin && p.tvlUsd > 1_000_000 && p.apy > 1)
          .sort((a, b) => b.apy - a.apy)
        break
      case 'eth-staking':
        result = result
          .filter(p => {
            const sym = p.symbol?.toUpperCase() || ''
            return (sym.includes('ETH') || sym.includes('STETH') || sym.includes('WETH') || sym.includes('RETH') || sym.includes('WEETH') || sym.includes('CBETH'))
              && p.tvlUsd > 5_000_000 && p.apy > 0.5
          })
          .sort((a, b) => b.tvlUsd - a.tvlUsd)
        break
      case 'high-yield':
        result = result
          .filter(p => p.apy > 15 && p.tvlUsd > 1_000_000)
          .sort((a, b) => b.apy - a.apy)
        break
      default:
        result = result.sort((a, b) => b.tvlUsd - a.tvlUsd)
    }

    // Apply manual sort override
    if (sortKey !== 'default') {
      switch (sortKey) {
        case 'apy-desc': result = result.sort((a, b) => b.apy - a.apy); break
        case 'apy-asc': result = result.sort((a, b) => a.apy - b.apy); break
        case 'tvl-desc': result = result.sort((a, b) => b.tvlUsd - a.tvlUsd); break
        case 'tvl-asc': result = result.sort((a, b) => a.tvlUsd - b.tvlUsd); break
      }
    }

    return result.slice(0, 80)
  }, [pools, category, chainFilter, sortKey])

  const avgApy = filtered.length > 0 ? filtered.reduce((s, p) => s + p.apy, 0) / filtered.length : 0
  const totalTvl = filtered.reduce((s, p) => s + p.tvlUsd, 0)

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin" style={{ color: '#A3A3A3' }} />
          <div>
            <p className="text-sm font-medium text-[#0A0A0A]">Loading pools from DeFiLlama...</p>
            <p className="text-xs" style={{ color: '#A3A3A3' }}>Fetching 17,000+ pools across all chains</p>
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
              <div className="flex items-center gap-4">
                <div className="w-6 h-4 rounded bg-gray-100" />
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-6 h-6 rounded-full bg-gray-100" />
                  <div>
                    <div className="w-24 h-3.5 rounded bg-gray-100 mb-1" />
                    <div className="w-16 h-2.5 rounded bg-gray-50" />
                  </div>
                </div>
                <div className="w-16 h-4 rounded bg-gray-100" />
                <div className="w-20 h-4 rounded bg-gray-100 hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5 page-enter">
      <div>
        <h2 className="text-lg font-semibold text-[#0A0A0A]">Pools & Staking</h2>
        <p className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>{pools.length.toLocaleString()} pools across all chains — powered by DeFiLlama</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => {
          const Icon = cat.icon
          const active = category === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0"
              style={{
                background: active ? cat.color + '12' : '#FFFFFF',
                border: `1px solid ${active ? cat.color + '40' : '#E5E5E5'}`,
                color: active ? cat.color : '#737373',
                cursor: 'pointer',
              }}
            >
              <Icon size={14} />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Description + stats */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs" style={{ color: '#A3A3A3' }}>
          {CATEGORIES.find(c => c.id === category)?.desc} — {filtered.length} pools
        </p>
        <div className="flex items-center gap-4">
          <span className="text-[10px]" style={{ color: '#A3A3A3' }}>Avg APY: <strong className="text-[#0A0A0A]">{avgApy.toFixed(1)}%</strong></span>
          <span className="text-[10px]" style={{ color: '#A3A3A3' }}>TVL: <strong className="text-[#0A0A0A]">${totalTvl > 1e9 ? (totalTvl / 1e9).toFixed(1) + 'B' : (totalTvl / 1e6).toFixed(0) + 'M'}</strong></span>
        </div>
      </div>

      {/* Sort control */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium" style={{ color: '#A3A3A3' }}>Sort by:</span>
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          className="px-2.5 py-1 rounded-lg text-[11px] outline-none cursor-pointer"
          style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#737373' }}
        >
          <option value="default">Category default</option>
          <option value="apy-desc">APY (high to low)</option>
          <option value="apy-asc">APY (low to high)</option>
          <option value="tvl-desc">TVL (high to low)</option>
          <option value="tvl-asc">TVL (low to high)</option>
        </select>
      </div>

      {/* Chain filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setChainFilter('all')}
          className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all shrink-0"
          style={{ background: chainFilter === 'all' ? '#0A0A0A' : '#F5F5F5', color: chainFilter === 'all' ? '#FFFFFF' : '#737373', cursor: 'pointer' }}
        >
          All Chains
        </button>
        {CHAIN_FILTER_LIST.map(chain => {
          const c = CHAINS[chain]
          if (!c) return null
          const active = chainFilter === chain
          return (
            <button
              key={chain}
              onClick={() => setChainFilter(active ? 'all' : chain)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all shrink-0"
              style={{
                background: active ? c.color + '15' : '#F5F5F5',
                color: active ? c.color : '#737373',
                border: active ? `1px solid ${c.color}30` : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
              {c.name}
            </button>
          )
        })}
      </div>

      {/* Pools list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16"><p className="text-sm" style={{ color: '#A3A3A3' }}>No pools match your filters</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((pool, i) => {
            const risk = getRiskLevel(pool)
            const chainInfo = CHAINS[pool.chain?.toLowerCase() as ChainId]
            return (
              <div key={pool.pool || i} className="rounded-xl p-4 transition-all hover:shadow-sm" style={CARD_STYLE}>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono w-6 text-center shrink-0" style={{ color: '#A3A3A3' }}>{i + 1}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <img src={`https://icons.llama.fi/${pool.project}.png`} alt="" className="w-6 h-6 rounded-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-[#0A0A0A] truncate">{pool.symbol}</span>
                          {chainInfo && <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: chainInfo.color + '12', color: chainInfo.color }}>{chainInfo.name}</span>}
                        </div>
                        <span className="text-[10px]" style={{ color: '#A3A3A3' }}>{pool.project}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 w-20">
                    <p className="text-sm font-bold font-mono tabular-nums" style={{ color: pool.apy > 10 ? '#F59E0B' : '#22C55E' }}>{pool.apy.toFixed(1)}%</p>
                    <p className="text-[9px]" style={{ color: '#A3A3A3' }}>APY</p>
                  </div>

                  <div className="text-right shrink-0 w-24 hidden sm:block">
                    <p className="text-xs font-mono tabular-nums text-[#0A0A0A]">${pool.tvlUsd > 1e9 ? (pool.tvlUsd / 1e9).toFixed(1) + 'B' : pool.tvlUsd > 1e6 ? (pool.tvlUsd / 1e6).toFixed(1) + 'M' : (pool.tvlUsd / 1e3).toFixed(0) + 'K'}</p>
                    <p className="text-[9px]" style={{ color: '#A3A3A3' }}>TVL</p>
                  </div>

                  <div className="shrink-0 hidden md:block">
                    <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ background: risk.color + '12', color: risk.color }}>{risk.label}</span>
                  </div>

                  <div className="shrink-0 hidden lg:block w-28">
                    {pool.apyBase !== undefined && pool.apyBase > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-[9px]" style={{ color: '#A3A3A3' }}>Base:</span>
                        <span className="text-[10px] font-mono tabular-nums" style={{ color: '#22C55E' }}>{pool.apyBase.toFixed(1)}%</span>
                      </div>
                    )}
                    {pool.apyReward !== undefined && pool.apyReward > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-[9px]" style={{ color: '#A3A3A3' }}>Reward:</span>
                        <span className="text-[10px] font-mono tabular-nums" style={{ color: '#F59E0B' }}>{pool.apyReward.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {pool.apy > 30 && (
                  <div className="flex items-center gap-1.5 mt-2 ml-10 text-[10px]" style={{ color: '#F59E0B' }}>
                    <AlertTriangle size={10} />
                    Alto rendimento — verifique os riscos do protocolo antes de investir
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
