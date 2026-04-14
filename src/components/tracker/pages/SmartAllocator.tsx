import { useState, useMemo, useEffect } from 'react'
import { Sparkles, Shield, TrendingUp, Flame, Loader2, ArrowRight, ChevronRight } from 'lucide-react'
import { fmtUSD, fmtNumber } from '../lib/formatters'
import type { WalletPortfolio, TokenPosition } from '../types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LlamaPool {
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apy: number
  apyBase: number | null
  apyReward: number | null
  stablecoin: boolean
  pool: string
  exposure: string
  ilRisk: string
}

interface Allocation {
  token: string
  balance: number
  valueUsd: number
  protocol: string
  chain: string
  apy: number
  poolSymbol: string
  monthlyEarnings: number
  yearlyEarnings: number
}

interface Strategy {
  id: 'conservative' | 'balanced' | 'aggressive'
  label: string
  description: string
  icon: typeof Shield
  color: string
  bgColor: string
  borderColor: string
  badgeColor: string
  apyRange: string
  riskScore: number
  allocations: Allocation[]
  totalMonthly: number
  totalYearly: number
}

// ─── Pool matching ────────────────────────────────────────────────────────────

function findPoolsForToken(symbol: string, pools: LlamaPool[]): LlamaPool[] {
  const sym = symbol.toUpperCase()
  return pools
    .filter(p => {
      const poolSym = (p.symbol || '').toUpperCase()
      return poolSym.includes(sym) && p.tvlUsd > 1_000_000 && p.apy > 0.5
    })
    .sort((a, b) => b.apy - a.apy)
}

function pickPoolForStrategy(
  pools: LlamaPool[],
  strategy: 'conservative' | 'balanced' | 'aggressive',
): LlamaPool | null {
  if (pools.length === 0) return null

  // Filter by APY range per strategy
  let filtered: LlamaPool[]
  switch (strategy) {
    case 'conservative':
      filtered = pools.filter(p => p.apy >= 0.5 && p.apy <= 12 && p.tvlUsd > 10_000_000)
      // Prefer stablecoins and high TVL
      filtered.sort((a, b) => {
        if (a.stablecoin !== b.stablecoin) return a.stablecoin ? -1 : 1
        return b.tvlUsd - a.tvlUsd
      })
      break
    case 'balanced':
      filtered = pools.filter(p => p.apy >= 3 && p.apy <= 25 && p.tvlUsd > 5_000_000)
      // Balance between APY and TVL
      filtered.sort((a, b) => {
        const scoreA = a.apy * 0.6 + Math.log10(a.tvlUsd) * 0.4
        const scoreB = b.apy * 0.6 + Math.log10(b.tvlUsd) * 0.4
        return scoreB - scoreA
      })
      break
    case 'aggressive':
      filtered = pools.filter(p => p.apy >= 10 && p.tvlUsd > 1_000_000)
      // Highest APY first
      filtered.sort((a, b) => b.apy - a.apy)
      break
  }

  return filtered[0] || pools[0]
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  portfolios: WalletPortfolio[]
  priceMap: Record<string, number>
}

const CARD_STYLE = { background: '#FFFFFF', border: '1px solid #E5E5E5' }

// ─── Component ────────────────────────────────────────────────────────────────

export function SmartAllocator({ portfolios, priceMap }: Props) {
  const [pools, setPools] = useState<LlamaPool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStrategy, setSelectedStrategy] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced')

  // Fetch DeFiLlama pools
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('https://yields.llama.fi/pools')
        if (!res.ok) throw new Error('Failed to fetch pools')
        const json = await res.json()
        if (!cancelled) setPools(json.data || [])
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load pool data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Aggregate tokens across all wallets
  const userTokens = useMemo(() => {
    const map = new Map<string, { symbol: string; balance: number; valueUsd: number; logo?: string }>()
    for (const p of portfolios) {
      for (const t of p.tokens) {
        const existing = map.get(t.symbol)
        if (existing) {
          existing.balance += t.balance
          existing.valueUsd += t.valueUsd
        } else {
          map.set(t.symbol, { symbol: t.symbol, balance: t.balance, valueUsd: t.valueUsd, logo: t.logo })
        }
      }
    }
    return [...map.values()].sort((a, b) => b.valueUsd - a.valueUsd).filter(t => t.valueUsd > 1)
  }, [portfolios])

  const totalPortfolioValue = useMemo(
    () => userTokens.reduce((s, t) => s + t.valueUsd, 0),
    [userTokens],
  )

  // Build strategies
  const strategies = useMemo<Strategy[]>(() => {
    if (pools.length === 0 || userTokens.length === 0) return []

    const strategyDefs: Array<{
      id: 'conservative' | 'balanced' | 'aggressive'
      label: string
      description: string
      icon: typeof Shield
      color: string
      bgColor: string
      borderColor: string
      badgeColor: string
      apyRange: string
      riskScore: number
    }> = [
      {
        id: 'conservative',
        label: 'Conservative',
        description: 'Low risk, established protocols with proven track record',
        icon: Shield,
        color: '#22C55E',
        bgColor: 'rgba(34,197,94,0.06)',
        borderColor: 'rgba(34,197,94,0.2)',
        badgeColor: 'rgba(34,197,94,0.12)',
        apyRange: '2-8%',
        riskScore: 2,
      },
      {
        id: 'balanced',
        label: 'Balanced',
        description: 'Medium risk, solid protocols with higher yield potential',
        icon: TrendingUp,
        color: '#F59E0B',
        bgColor: 'rgba(245,158,11,0.06)',
        borderColor: 'rgba(245,158,11,0.2)',
        badgeColor: 'rgba(245,158,11,0.12)',
        apyRange: '5-15%',
        riskScore: 5,
      },
      {
        id: 'aggressive',
        label: 'Aggressive',
        description: 'Higher risk, newer protocols with maximum yield',
        icon: Flame,
        color: '#EF4444',
        bgColor: 'rgba(239,68,68,0.06)',
        borderColor: 'rgba(239,68,68,0.2)',
        badgeColor: 'rgba(239,68,68,0.12)',
        apyRange: '15%+',
        riskScore: 8,
      },
    ]

    return strategyDefs.map(def => {
      const allocations: Allocation[] = []

      for (const token of userTokens) {
        const matchingPools = findPoolsForToken(token.symbol, pools)
        const bestPool = pickPoolForStrategy(matchingPools, def.id)
        if (bestPool) {
          const yearly = token.valueUsd * (bestPool.apy / 100)
          allocations.push({
            token: token.symbol,
            balance: token.balance,
            valueUsd: token.valueUsd,
            protocol: bestPool.project,
            chain: bestPool.chain,
            apy: bestPool.apy,
            poolSymbol: bestPool.symbol,
            monthlyEarnings: yearly / 12,
            yearlyEarnings: yearly,
          })
        }
      }

      const totalMonthly = allocations.reduce((s, a) => s + a.monthlyEarnings, 0)
      const totalYearly = allocations.reduce((s, a) => s + a.yearlyEarnings, 0)

      return { ...def, allocations, totalMonthly, totalYearly }
    })
  }, [pools, userTokens])

  const currentStrategy = strategies.find(s => s.id === selectedStrategy)

  // Current estimated yield (assume 0 for idle tokens)
  const currentYield = 0
  const optimizedYield = currentStrategy?.totalMonthly ?? 0
  const maxYield = strategies.length > 0 ? Math.max(...strategies.map(s => s.totalMonthly)) : 0

  // ─── Empty state ──────────────────────────────────────────────────────────────

  if (portfolios.length === 0 || userTokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <Sparkles size={28} style={{ color: '#8B5CF6' }} />
        </div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: '#0A0A0A' }}>No tokens to optimize</h2>
        <p className="text-sm" style={{ color: '#A3A3A3' }}>
          Add wallets with tokens to get personalized DeFi allocation strategies
        </p>
      </div>
    )
  }

  // ─── Loading state ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Loader2 size={32} className="animate-spin mb-4" style={{ color: '#8B5CF6' }} />
        <h2 className="text-lg font-semibold mb-1" style={{ color: '#0A0A0A' }}>Analyzing DeFi opportunities</h2>
        <p className="text-sm" style={{ color: '#A3A3A3' }}>
          Scanning {userTokens.length} tokens across DeFiLlama pools...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <p className="text-sm" style={{ color: '#EF4444' }}>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={20} style={{ color: '#8B5CF6' }} />
          <h1 className="text-xl font-bold font-serif" style={{ color: '#0A0A0A' }}>Smart Allocator</h1>
        </div>
        <p className="text-sm" style={{ color: '#A3A3A3' }}>
          Optimize your portfolio yield across {pools.length.toLocaleString()} DeFi pools
        </p>
      </div>

      {/* Current yield vs optimized */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl p-4" style={CARD_STYLE}>
          <p className="text-xs mb-1" style={{ color: '#A3A3A3' }}>Current est. yield</p>
          <p className="text-2xl font-bold font-mono" style={{ color: '#737373' }}>
            {fmtUSD(currentYield)}<span className="text-sm font-normal">/mo</span>
          </p>
          <p className="text-[10px] mt-1" style={{ color: '#A3A3A3' }}>Idle tokens earning nothing</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: currentStrategy?.bgColor ?? '#FFFFFF', border: `1px solid ${currentStrategy?.borderColor ?? '#E5E5E5'}` }}>
          <p className="text-xs mb-1" style={{ color: '#A3A3A3' }}>Optimized yield ({currentStrategy?.label})</p>
          <p className="text-2xl font-bold font-mono" style={{ color: currentStrategy?.color ?? '#0A0A0A' }}>
            {fmtUSD(optimizedYield)}<span className="text-sm font-normal">/mo</span>
          </p>
          <p className="text-[10px] mt-1" style={{ color: '#A3A3A3' }}>
            {fmtUSD(optimizedYield * 12)}/year on {fmtUSD(totalPortfolioValue, true)} portfolio
          </p>
        </div>
        <div className="rounded-xl p-4" style={CARD_STYLE}>
          <p className="text-xs mb-1" style={{ color: '#A3A3A3' }}>Optimization potential</p>
          <p className="text-2xl font-bold font-mono" style={{ color: '#8B5CF6' }}>
            +{fmtUSD(optimizedYield)}
          </p>
          <p className="text-[10px] mt-1" style={{ color: '#A3A3A3' }}>
            Extra monthly earnings available
          </p>
        </div>
      </div>

      {/* Yield comparison bar */}
      <div className="rounded-xl p-4" style={CARD_STYLE}>
        <p className="text-xs font-semibold mb-3" style={{ color: '#0A0A0A' }}>Monthly yield comparison</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] w-16 text-right font-medium" style={{ color: '#A3A3A3' }}>Current</span>
            <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: '#F5F5F5' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: maxYield > 0 ? `${Math.max(1, (currentYield / maxYield) * 100)}%` : '1%',
                  background: '#D4D4D4',
                }}
              />
            </div>
            <span className="text-xs font-mono w-20 text-right" style={{ color: '#737373' }}>{fmtUSD(currentYield)}</span>
          </div>
          {strategies.map(s => (
            <div key={s.id} className="flex items-center gap-3">
              <span className="text-[10px] w-16 text-right font-medium" style={{ color: s.color }}>{s.label}</span>
              <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: '#F5F5F5' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: maxYield > 0 ? `${Math.max(2, (s.totalMonthly / maxYield) * 100)}%` : '2%',
                    background: s.color,
                    opacity: 0.7,
                  }}
                />
              </div>
              <span className="text-xs font-mono w-20 text-right" style={{ color: '#0A0A0A' }}>{fmtUSD(s.totalMonthly)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {strategies.map(s => {
          const Icon = s.icon
          const isSelected = selectedStrategy === s.id
          return (
            <button
              key={s.id}
              onClick={() => setSelectedStrategy(s.id)}
              className="rounded-xl p-4 text-left transition-all duration-150"
              style={{
                background: isSelected ? s.bgColor : '#FFFFFF',
                border: `2px solid ${isSelected ? s.color : '#E5E5E5'}`,
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: s.badgeColor }}
                >
                  <Icon size={16} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#0A0A0A' }}>{s.label}</p>
                  <p className="text-[10px]" style={{ color: '#A3A3A3' }}>APY {s.apyRange}</p>
                </div>
              </div>
              <p className="text-[11px] mb-3" style={{ color: '#737373' }}>{s.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono" style={{ color: s.color }}>
                  {fmtUSD(s.totalMonthly)}
                </span>
                <span className="text-[10px]" style={{ color: '#A3A3A3' }}>/month</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px]" style={{ color: '#A3A3A3' }}>{fmtUSD(s.totalYearly)}/year</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: s.badgeColor, color: s.color }}>
                  Risk {s.riskScore}/10
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Allocation details for selected strategy */}
      {currentStrategy && currentStrategy.allocations.length > 0 && (
        <div className="rounded-xl p-4" style={CARD_STYLE}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: currentStrategy.badgeColor }}
              >
                <currentStrategy.icon size={13} style={{ color: currentStrategy.color }} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: '#0A0A0A' }}>
                {currentStrategy.label} Strategy — Suggested allocations
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{ background: currentStrategy.badgeColor, color: currentStrategy.color }}>
              {currentStrategy.allocations.length} positions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider pb-2 pr-4" style={{ color: '#A3A3A3' }}>Action</th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider pb-2 pr-4" style={{ color: '#A3A3A3' }}>Protocol</th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider pb-2 pr-4" style={{ color: '#A3A3A3' }}>Chain</th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-wider pb-2 pr-4" style={{ color: '#A3A3A3' }}>APY</th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-wider pb-2 pr-4" style={{ color: '#A3A3A3' }}>Value</th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-wider pb-2" style={{ color: '#A3A3A3' }}>Monthly est.</th>
                </tr>
              </thead>
              <tbody>
                {currentStrategy.allocations.map((a, i) => (
                  <tr
                    key={`${a.token}-${i}`}
                    className="group"
                    style={{ borderBottom: i < currentStrategy.allocations.length - 1 ? '1px solid #FAFAFA' : 'none' }}
                  >
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium" style={{ color: '#0A0A0A' }}>
                          Deposit {fmtNumber(a.balance, true)} {a.token}
                        </span>
                        <ArrowRight size={10} style={{ color: '#A3A3A3' }} />
                        <span className="text-xs" style={{ color: '#737373' }}>{a.poolSymbol}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-xs font-medium capitalize" style={{ color: '#0A0A0A' }}>{a.protocol}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-[10px] px-1.5 py-0.5 rounded capitalize" style={{ background: '#F5F5F5', color: '#737373' }}>
                        {a.chain}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      <span className="text-xs font-mono font-semibold" style={{ color: currentStrategy.color }}>
                        {a.apy.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      <span className="text-xs font-mono" style={{ color: '#0A0A0A' }}>{fmtUSD(a.valueUsd)}</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-xs font-mono font-semibold" style={{ color: currentStrategy.color }}>
                        +{fmtUSD(a.monthlyEarnings)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #F0F0F0' }}>
                  <td colSpan={4} className="py-3 text-right">
                    <span className="text-xs font-semibold" style={{ color: '#0A0A0A' }}>Total estimated</span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-xs font-mono font-bold" style={{ color: '#0A0A0A' }}>{fmtUSD(totalPortfolioValue)}</span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-sm font-mono font-bold" style={{ color: currentStrategy.color }}>
                      +{fmtUSD(currentStrategy.totalMonthly)}/mo
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* No matches message */}
      {currentStrategy && currentStrategy.allocations.length === 0 && (
        <div className="rounded-xl p-6 text-center" style={CARD_STYLE}>
          <p className="text-sm" style={{ color: '#A3A3A3' }}>
            No matching pools found for your tokens in this strategy tier.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl p-3 text-center" style={{ background: '#FFFBEB', border: '1px solid #FEF3C7' }}>
        <p className="text-[10px]" style={{ color: '#92400E' }}>
          These are estimates based on current APY data from DeFiLlama. Actual yields vary. DYOR before depositing. Smart contract risk applies.
        </p>
      </div>
    </div>
  )
}
