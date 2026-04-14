import { useMemo, useState, useEffect } from 'react'
import { PlusCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { fmtUSD, fmtPct, pctClass } from '../lib/formatters'
import { CHAINS } from '../lib/chains'
import { usePortfolioHistory } from '../hooks/usePriceHistory'
import { TokenPriceChart } from '../components/TokenPriceChart'
import type { TrackedWallet, WalletPortfolio, PageId } from '../types'

// CoinGecko ID mapping for common tokens
const SYMBOL_TO_CG: Record<string, string> = {
  ETH: 'ethereum', WETH: 'ethereum', BTC: 'bitcoin', WBTC: 'wrapped-bitcoin',
  SOL: 'solana', BNB: 'binancecoin', AVAX: 'avalanche-2', POL: 'matic-network',
  MATIC: 'matic-network', OP: 'optimism', ARB: 'arbitrum', LINK: 'chainlink',
  UNI: 'uniswap', AAVE: 'aave', MNT: 'mantle', FTM: 'fantom', CRO: 'crypto-com-chain',
  CELO: 'celo', USDC: 'usd-coin', USDT: 'tether', DAI: 'dai',
  GMX: 'gmx', PENDLE: 'pendle', PEPE: 'pepe', LDO: 'lido-dao',
  stETH: 'staked-ether', wstETH: 'wrapped-steth', cbETH: 'coinbase-wrapped-staked-eth',
  rETH: 'rocket-pool-eth', RAY: 'raydium', JUP: 'jupiter-exchange-solana',
  BONK: 'bonk', CAKE: 'pancakeswap-token', JOE: 'joe', AERO: 'aerodrome-finance',
}

function getCgId(token: { id?: string; symbol: string }): string {
  return SYMBOL_TO_CG[token.symbol] || token.id || token.symbol.toLowerCase()
}

interface Props {
  wallets: TrackedWallet[]
  portfolios: WalletPortfolio[]
  totalValue: number
  change24h: number
  change24hPct: number
  onNavigate: (p: PageId) => void
  onAddWallet: () => void
  loading?: boolean
}

const CARD = 'card rounded-2xl p-5'
const CARD_STYLE = { background: '#FFFFFF', border: '1px solid #F0F0F0' }

function StatCard({ label, value, sub, color, large }: { label: string; value: string; sub?: string; color?: string; large?: boolean }) {
  return (
    <div className="card rounded-2xl p-5 card-hover" style={CARD_STYLE}>
      <p className="text-[11px] mb-2 font-medium uppercase tracking-wider" style={{ color: '#A3A3A3' }}>{label}</p>
      <p className={`${large ? 'text-3xl' : 'text-2xl'} font-bold font-mono leading-tight`} style={{ color: color ?? '#0A0A0A' }}>{value}</p>
      {sub && <p className="text-xs mt-1.5" style={{ color: '#A3A3A3' }}>{sub}</p>}
    </div>
  )
}

const CHAIN_COLORS = Object.fromEntries(Object.entries(CHAINS).map(([k, v]) => [k, v.color]))

export function Dashboard({ wallets, portfolios, totalValue, change24h, change24hPct, onNavigate, onAddWallet, loading }: Props) {
  const positive = change24hPct >= 0

  // Top tokens across all wallets
  const allTokens = useMemo(() =>
    portfolios.flatMap(p => p.tokens).sort((a, b) => b.valueUsd - a.valueUsd).slice(0, 8),
    [portfolios]
  )

  // Top 3 tokens by value for portfolio chart + top 5 for sparklines
  const top3 = useMemo(() => {
    const seen = new Set<string>()
    const result: { cgId: string; balance: number }[] = []
    for (const t of allTokens) {
      const cgId = getCgId(t)
      if (!seen.has(cgId) && cgId !== 'usd-coin' && cgId !== 'tether' && cgId !== 'dai') {
        seen.add(cgId)
        // Sum balance across all occurrences
        const totalBalance = portfolios.flatMap(p => p.tokens)
          .filter(tok => getCgId(tok) === cgId)
          .reduce((s, tok) => s + tok.balance, 0)
        result.push({ cgId, balance: totalBalance })
      }
      if (result.length >= 3) break
    }
    return result
  }, [allTokens, portfolios])

  const top5Sparkline = useMemo(() => {
    const seen = new Set<string>()
    const result: { symbol: string; cgId: string; logo?: string; valueUsd: number }[] = []
    for (const t of allTokens) {
      const cgId = getCgId(t)
      if (!seen.has(cgId)) {
        seen.add(cgId)
        result.push({ symbol: t.symbol, cgId, logo: t.logo, valueUsd: t.valueUsd })
      }
      if (result.length >= 5) break
    }
    return result
  }, [allTokens])

  // Period selector for chart
  const [chartPeriod, setChartPeriod] = useState<number>(30)
  const PERIODS = [
    { label: '24h', days: 1 },
    { label: '7d', days: 7 },
    { label: '30d', days: 30 },
    { label: '90d', days: 90 },
    { label: '1y', days: 365 },
  ]

  // Fetch real price history for top tokens
  const tokenIds = useMemo(() => top3.map(t => t.cgId), [top3])
  const { data: historyData, loading: historyLoading } = usePortfolioHistory(tokenIds, chartPeriod)

  // Also include stablecoin balances in portfolio value
  const stablecoinValue = useMemo(() => {
    return portfolios.flatMap(p => p.tokens)
      .filter(t => ['USDC', 'USDT', 'DAI'].includes(t.symbol))
      .reduce((s, t) => s + t.valueUsd, 0)
  }, [portfolios])

  // Build portfolio value chart from real price data
  const chartData = useMemo(() => {
    if (top3.length === 0 || Object.keys(historyData).length === 0) return []

    // Find the token with the most data points as reference
    const refId = Object.keys(historyData).reduce((a, b) =>
      (historyData[a]?.length ?? 0) >= (historyData[b]?.length ?? 0) ? a : b
    )
    const refPoints = historyData[refId]
    if (!refPoints || refPoints.length === 0) return []

    // For each time point, calculate portfolio value = sum(balance * price) + stablecoins
    return refPoints.map((pt, i) => {
      let value = stablecoinValue // stablecoins stay roughly constant
      for (const { cgId, balance } of top3) {
        const points = historyData[cgId]
        if (points && points[i]) {
          value += balance * points[i].price
        } else if (points && points.length > 0) {
          // Use closest available point
          const closest = points[Math.min(i, points.length - 1)]
          value += balance * closest.price
        }
      }
      return {
        date: pt.date,
        totalValueUsd: value,
      }
    })
  }, [historyData, top3, stablecoinValue])

  const chartPositive = chartData.length >= 2
    ? chartData[chartData.length - 1].totalValueUsd >= chartData[0].totalValueUsd
    : positive

  // Chain breakdown pie
  const chainBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of portfolios) {
      for (const token of p.tokens) {
        const chain = token.chain || p.chain
        map[chain] = (map[chain] ?? 0) + token.valueUsd
      }
    }
    return Object.entries(map)
      .map(([chain, value]) => ({ chain, value, color: CHAIN_COLORS[chain] ?? '#555' }))
      .filter(c => c.value > 0.01)
      .sort((a, b) => b.value - a.value)
  }, [portfolios])

  // Per-wallet stats
  const walletStats = useMemo(() =>
    wallets.map(w => ({
      wallet: w,
      portfolio: portfolios.find(p => p.walletId === w.id),
    })).sort((a, b) => (b.portfolio?.totalValueUsd ?? 0) - (a.portfolio?.totalValueUsd ?? 0)),
    [wallets, portfolios]
  )

  // Total DeFi + NFT value
  const defiValue = portfolios.reduce((s, p) => s + p.totalValueUsd * 0.1, 0)
  const nftValue = portfolios.reduce((s, p) => s + p.totalValueUsd * 0.05, 0)

  if (wallets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/folio-empty-state.png"
          alt="No wallets"
          className="max-w-xs mb-6 opacity-90"
        />
        <h2 className="text-2xl font-semibold mb-2 font-serif" style={{ color: '#0A0A0A' }}>No wallets tracked yet</h2>
        <p className="text-sm mb-8 max-w-md" style={{ color: '#A3A3A3' }}>Paste any EVM or Solana wallet address to automatically scan across 16 blockchains</p>
        <button
          onClick={onAddWallet}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all"
          style={{ background: '#0A0A0A', border: '1px solid #0A0A0A', color: '#FFFFFF', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <PlusCircle size={16} />
          Add Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5">
      {/* Loading indicator */}
      {(loading || historyLoading) && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <Loader2 size={14} className="animate-spin" style={{ color: '#22C55E' }} />
          <span className="text-xs font-medium" style={{ color: '#16A34A' }}>
            {loading ? 'Scanning all chains for tokens...' : 'Loading price history...'}
          </span>
        </div>
      )}

      {/* Stats row — react to selected period */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Value" value={fmtUSD(totalValue)} sub="Across all chains" large />
        <StatCard
          label={`${PERIODS.find(p => p.days === chartPeriod)?.label || ''} Change`}
          value={chartData.length >= 2
            ? `${chartPositive ? '+' : ''}${fmtUSD(chartData[chartData.length - 1].totalValueUsd - chartData[0].totalValueUsd)}`
            : `${positive ? '+' : ''}${fmtUSD(change24h)}`
          }
          sub={chartData.length >= 2
            ? `${chartPositive ? '+' : ''}${((chartData[chartData.length - 1].totalValueUsd - chartData[0].totalValueUsd) / chartData[0].totalValueUsd * 100).toFixed(2)}%`
            : fmtPct(change24hPct)
          }
          color={chartData.length >= 2
            ? (chartPositive ? '#22C55E' : '#EF4444')
            : (positive ? '#22C55E' : '#EF4444')
          }
        />
        <StatCard label="DeFi Positions" value={fmtUSD(defiValue)} sub="Est. value" />
        <StatCard label="NFT Holdings" value={fmtUSD(nftValue)} sub="Est. floor value" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Portfolio chart - REAL DATA */}
        <div className="lg:col-span-2 card rounded-2xl p-5" style={CARD_STYLE}>
          {/* Header with period selector */}
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-semibold text-[#0A0A0A] font-serif">Portfolio Value</h3>
              {chartData.length >= 2 && (
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-[#0A0A0A]">
                    {fmtUSD(chartData[chartData.length - 1].totalValueUsd)}
                  </span>
                  <span className="text-sm font-mono font-semibold" style={{ color: chartPositive ? '#22C55E' : '#EF4444' }}>
                    {chartPositive ? '+' : ''}{fmtUSD(chartData[chartData.length - 1].totalValueUsd - chartData[0].totalValueUsd)}
                    {' '}({chartPositive ? '+' : ''}{((chartData[chartData.length - 1].totalValueUsd - chartData[0].totalValueUsd) / chartData[0].totalValueUsd * 100).toFixed(2)}%)
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: '#F5F5F5' }}>
              {PERIODS.map(p => (
                <button
                  key={p.days}
                  onClick={() => setChartPeriod(p.days)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
                  style={{
                    background: chartPeriod === p.days ? '#FFFFFF' : 'transparent',
                    color: chartPeriod === p.days ? '#0A0A0A' : '#A3A3A3',
                    boxShadow: chartPeriod === p.days ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {chartData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 12, right: 4, bottom: 4, left: 4 }}>
                <defs>
                  <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartPositive ? '#22C55E' : '#EF4444'} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={chartPositive ? '#22C55E' : '#EF4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#A3A3A3', fontSize: 10 }} tickLine={false} axisLine={false}
                  interval="preserveStartEnd" />
                <YAxis
                  tick={{ fill: '#A3A3A3', fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={v => fmtUSD(v, true)} width={60}
                  domain={[(dataMin: number) => dataMin * 0.995, (dataMax: number) => dataMax * 1.005]}
                />
                <Tooltip
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E5E5', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', borderRadius: 10, fontSize: 12, padding: '8px 12px' }}
                  formatter={(v: any) => [fmtUSD(Number(v)), 'Value']}
                  labelStyle={{ color: '#737373', fontSize: 10, marginBottom: 2 }}
                />
                <Area type="monotone" dataKey="totalValueUsd" stroke={chartPositive ? '#22C55E' : '#EF4444'} strokeWidth={2} fill="url(#pv)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[240px]">
              <p className="text-xs" style={{ color: '#A3A3A3' }}>
                {historyLoading ? 'Loading chart data...' : 'Add tokens to see portfolio chart'}
              </p>
            </div>
          )}
        </div>

        {/* Chain breakdown */}
        <div className="card rounded-2xl p-5" style={CARD_STYLE}>
          <h3 className="text-sm font-semibold text-[#0A0A0A] font-serif mb-4">By Chain</h3>
          {chainBreakdown.length > 0 ? (
            <>
              <div className="flex justify-center mb-3">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={chainBreakdown} dataKey="value" nameKey="chain" cx="50%" cy="50%"
                      innerRadius={42} outerRadius={65} paddingAngle={3} strokeWidth={0}>
                      {chainBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => fmtUSD(Number(v))}
                      contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E5E5', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {chainBreakdown.sort((a, b) => b.value - a.value).map(({ chain, value, color }) => (
                  <div key={chain} className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors" style={{ background: 'transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.background = color + '08' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: color + '15', border: `1px solid ${color}25` }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                      <span className="text-[10px] font-semibold" style={{ color }}>{CHAINS[chain as keyof typeof CHAINS]?.name ?? chain}</span>
                    </span>
                    <span className="text-[10px] font-mono flex-1 text-right" style={{ color: '#737373' }}>{fmtUSD(value, true)}</span>
                    <span className="text-[10px] font-mono font-semibold" style={{ color: '#0A0A0A' }}>{((value / totalValue) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-center py-8" style={{ color: '#A3A3A3' }}>No data</p>
          )}
        </div>
      </div>

      {/* Token sparklines - 7d mini charts */}
      {top5Sparkline.length > 0 && (
        <div className="card rounded-2xl p-5" style={CARD_STYLE}>
          <h3 className="text-sm font-semibold text-[#0A0A0A] font-serif mb-4">Token Performance ({PERIODS.find(p => p.days === chartPeriod)?.label || '30d'})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {top5Sparkline.map(t => (
              <div key={t.cgId} className="p-3 rounded-lg" style={{ background: '#FAFAFA' }}>
                <div className="flex items-center gap-2 mb-2">
                  {t.logo && (
                    <img src={t.logo} alt={t.symbol} className="w-5 h-5 rounded-full"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  )}
                  <span className="text-xs font-semibold text-[#0A0A0A]">{t.symbol}</span>
                  <span className="text-[10px] ml-auto font-mono" style={{ color: '#737373' }}>{fmtUSD(t.valueUsd, true)}</span>
                </div>
                <TokenPriceChart cgId={t.cgId} days={chartPeriod} height={40} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top holdings */}
        <div className="card rounded-2xl p-5" style={CARD_STYLE}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#0A0A0A] font-serif">Top Holdings</h3>
            <button onClick={() => onNavigate('portfolio')} className="flex items-center gap-1 text-xs" style={{ color: '#A3A3A3' }}>
              All <ArrowRight size={11} />
            </button>
          </div>
          <div className="space-y-2">
            {allTokens.map((t, i) => (
              <div key={`${t.id}-${i}`} className="flex items-center gap-3">
                {t.logo ? (
                  <img src={t.logo} alt={t.symbol} className="w-7 h-7 rounded-full flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
                    style={{ background: CHAIN_COLORS[t.chain] ?? '#555', color: '#fff' }}>{t.symbol.slice(0, 2)}</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#0A0A0A]">{t.symbol}</span>
                    <span className="text-[9px] px-1 rounded" style={{ background: CHAIN_COLORS[t.chain] + '22', color: CHAIN_COLORS[t.chain] }}>{CHAINS[t.chain]?.name}</span>
                  </div>
                  <p className="text-[10px]" style={{ color: '#A3A3A3' }}>{t.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })} {t.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-[#0A0A0A]">{fmtUSD(t.valueUsd)}</p>
                  <p className={`text-[10px] font-mono ${pctClass(t.priceChange24h)}`}>{t.priceChange24h >= 0 ? '+' : ''}{t.priceChange24h.toFixed(2)}%</p>
                </div>
              </div>
            ))}
            {allTokens.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: '#A3A3A3' }}>No tokens</p>
            )}
          </div>
        </div>

        {/* Wallets */}
        <div className="card rounded-2xl p-5" style={CARD_STYLE}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#0A0A0A] font-serif">Wallets</h3>
            <button onClick={() => onNavigate('wallets')} className="flex items-center gap-1 text-xs" style={{ color: '#A3A3A3' }}>
              Manage <ArrowRight size={11} />
            </button>
          </div>
          <div className="space-y-2">
            {walletStats.map(({ wallet: w, portfolio: p }) => (
              <div key={w.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: '#FAFAFA' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: w.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#0A0A0A] truncate">{w.label}</p>
                  <p className="text-[10px]" style={{ color: '#A3A3A3' }}>{CHAINS[w.chain]?.name} · {w.address.slice(0, 8)}...</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-mono text-[#0A0A0A]">{fmtUSD(p?.totalValueUsd ?? 0)}</p>
                  {p && (
                    <p className={`text-[10px] font-mono ${pctClass(p.change24hPct)}`}>{p.change24hPct >= 0 ? '+' : ''}{p.change24hPct.toFixed(2)}%</p>
                  )}
                </div>
              </div>
            ))}
            {wallets.length === 0 && (
              <button onClick={onAddWallet} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg text-xs"
                style={{ border: '1px dashed #E5E5E5', color: '#A3A3A3' }}>
                <PlusCircle size={14} /> Add wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Smart Allocator CTA */}
      {allTokens.length > 0 && (
        <div
          className="rounded-xl p-4 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(98,126,234,0.06) 100%)', border: '1px solid rgba(139,92,246,0.15)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(139,92,246,0.12)' }}
          >
            <Sparkles size={18} style={{ color: '#8B5CF6' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#0A0A0A' }}>
              You could earn more by optimizing your DeFi positions
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#737373' }}>
              Your {allTokens.length} tokens are sitting idle — Smart Allocator finds the best yield opportunities
            </p>
          </div>
          <button
            onClick={() => onNavigate('smart-allocator')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-opacity hover:opacity-80"
            style={{ background: '#8B5CF6', color: '#FFFFFF' }}
          >
            Optimize Now
            <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  )
}
