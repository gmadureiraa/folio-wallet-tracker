import { useMemo, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { fmtUSD, pctClass } from '../lib/formatters'
import { CHAINS } from '../lib/chains'
import { usePortfolioHistory } from '../hooks/usePriceHistory'
import { TokenPriceChart } from '../components/TokenPriceChart'
import type { TrackedWallet, WalletPortfolio } from '../types'

// CoinGecko ID mapping
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
  portfolios: WalletPortfolio[]
  wallets: TrackedWallet[]
}

const CARD_STYLE = { background: '#FFFFFF', border: '1px solid #E5E5E5' }

const PERIODS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '1y', days: 365 },
]

export function PnL({ portfolios, wallets }: Props) {
  const [period, setPeriod] = useState(30)
  const allTokens = useMemo(() =>
    portfolios.flatMap(p => {
      const w = wallets.find(x => x.id === p.walletId)
      return p.tokens.map(t => ({ ...t, walletLabel: w?.label ?? 'Unknown', walletColor: w?.color ?? '#555' }))
    }).sort((a, b) => Math.abs(b.pnlUsd) - Math.abs(a.pnlUsd)),
    [portfolios, wallets]
  )

  // Get unique tokens for price history
  const uniqueTokens = useMemo(() => {
    const seen = new Map<string, { cgId: string; balance: number; symbol: string; logo?: string; currentPrice: number }>()
    for (const t of allTokens) {
      const cgId = getCgId(t)
      if (!seen.has(cgId)) {
        seen.set(cgId, { cgId, balance: t.balance, symbol: t.symbol, logo: t.logo, currentPrice: t.priceUsd })
      } else {
        seen.get(cgId)!.balance += t.balance
      }
    }
    return Array.from(seen.values())
  }, [allTokens])

  // Fetch top 5 token histories for the portfolio chart
  const top5Ids = useMemo(() =>
    uniqueTokens
      .filter(t => t.cgId !== 'usd-coin' && t.cgId !== 'tether' && t.cgId !== 'dai')
      .slice(0, 5)
      .map(t => t.cgId),
    [uniqueTokens]
  )
  const { data: historyData, loading: historyLoading } = usePortfolioHistory(top5Ids, period)

  // Stablecoin value
  const stablecoinValue = useMemo(() =>
    allTokens.filter(t => ['USDC', 'USDT', 'DAI'].includes(t.symbol))
      .reduce((s, t) => s + t.valueUsd, 0),
    [allTokens]
  )

  // Build portfolio value over 30d
  const portfolioChart = useMemo(() => {
    if (top5Ids.length === 0 || Object.keys(historyData).length === 0) return []
    const refId = Object.keys(historyData).reduce((a, b) =>
      (historyData[a]?.length ?? 0) >= (historyData[b]?.length ?? 0) ? a : b
    )
    const refPoints = historyData[refId]
    if (!refPoints || refPoints.length === 0) return []

    const balanceMap = Object.fromEntries(uniqueTokens.map(t => [t.cgId, t.balance]))

    return refPoints.map((pt, i) => {
      let value = stablecoinValue
      for (const id of top5Ids) {
        const points = historyData[id]
        const balance = balanceMap[id] ?? 0
        if (points && points[i]) {
          value += balance * points[i].price
        } else if (points && points.length > 0) {
          value += balance * points[Math.min(i, points.length - 1)].price
        }
      }
      return { date: pt.date, totalValueUsd: value }
    })
  }, [historyData, top5Ids, uniqueTokens, stablecoinValue])

  // Calculate daily PnL from the portfolio chart
  const dailyPnlChart = useMemo(() => {
    if (portfolioChart.length < 2) return []
    return portfolioChart.map((pt, i) => {
      const prev = i > 0 ? portfolioChart[i - 1].totalValueUsd : pt.totalValueUsd
      return { date: pt.date, dailyPnlUsd: pt.totalValueUsd - prev }
    })
  }, [portfolioChart])

  // Calculate cumulative PnL
  const cumulativeChart = useMemo(() => {
    if (portfolioChart.length < 2) return []
    const startValue = portfolioChart[0].totalValueUsd
    return portfolioChart.map(pt => ({
      date: pt.date,
      cumulativePnlUsd: pt.totalValueUsd - startValue,
    }))
  }, [portfolioChart])

  // Per-token PnL using current price vs price 30 days ago
  const tokenPnlData = useMemo(() => {
    return uniqueTokens
      .filter(t => t.cgId !== 'usd-coin' && t.cgId !== 'tether' && t.cgId !== 'dai')
      .map(t => {
        const points = historyData[t.cgId]
        const price30dAgo = points && points.length > 0 ? points[0].price : t.currentPrice
        const pnlPct = price30dAgo > 0 ? ((t.currentPrice - price30dAgo) / price30dAgo) * 100 : 0
        const pnlUsd = t.balance * (t.currentPrice - price30dAgo)
        return { ...t, price30dAgo, pnlPct, pnlUsd }
      })
      .sort((a, b) => Math.abs(b.pnlUsd) - Math.abs(a.pnlUsd))
  }, [uniqueTokens, historyData])

  const totalPnl = allTokens.reduce((s, t) => s + t.pnlUsd, 0)
  const winners = allTokens.filter(t => t.pnlUsd > 0)
  const losers = allTokens.filter(t => t.pnlUsd < 0)
  const totalValue = portfolios.reduce((s, p) => s + p.totalValueUsd, 0)
  const winRate = allTokens.length > 0 ? (winners.length / allTokens.length) * 100 : 0

  // Per-wallet breakdown
  const walletPnl = useMemo(() =>
    portfolios.map(p => {
      const w = wallets.find(x => x.id === p.walletId)
      const pnl = p.tokens.reduce((s, t) => s + t.pnlUsd, 0)
      return { label: w?.label ?? 'Unknown', color: w?.color ?? '#555', value: p.totalValueUsd, pnl }
    }).sort((a, b) => b.value - a.value),
    [portfolios, wallets]
  )

  return (
    <div className="p-6 space-y-5">
      {/* Header stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Unrealized PnL', value: (totalPnl >= 0 ? '+' : '') + fmtUSD(totalPnl), color: totalPnl >= 0 ? '#22C55E' : '#EF4444' },
          { label: 'Total Value', value: fmtUSD(totalValue), color: '#0A0A0A' },
          { label: 'Win Rate', value: `${winRate.toFixed(0)}%`, sub: `${winners.length}W / ${losers.length}L`, color: winRate > 50 ? '#22C55E' : '#EF4444' },
          { label: 'Best Performer', value: allTokens[0]?.symbol ?? '--', sub: allTokens[0] ? `${allTokens[0].pnlPct >= 0 ? '+' : ''}${allTokens[0].pnlPct.toFixed(1)}%` : '', color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={CARD_STYLE}>
            <p className="text-xs mb-1.5" style={{ color: '#A3A3A3' }}>{s.label}</p>
            <p className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
            {s.sub && <p className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-1 rounded-lg p-0.5 w-fit" style={{ background: '#F5F5F5' }}>
        {PERIODS.map(p => (
          <button
            key={p.days}
            onClick={() => setPeriod(p.days)}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={{
              background: period === p.days ? '#FFFFFF' : 'transparent',
              color: period === p.days ? '#0A0A0A' : '#A3A3A3',
              boxShadow: period === p.days ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Cumulative PnL chart - REAL DATA */}
        <div className="rounded-xl p-4" style={CARD_STYLE}>
          <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Cumulative PnL</h3>
          {cumulativeChart.length >= 2 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cumulativeChart} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                <defs>
                  <linearGradient id="cpnl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#4A4A52', fontSize: 9 }} tickLine={false} axisLine={false}
                  interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#A3A3A3', fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={v => (v >= 0 ? '+' : '') + fmtUSD(v, true)} width={65}
                  domain={['auto', 'auto']} />
                <ReferenceLine y={0} stroke="#E5E5E5" strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: any) => [(v >= 0 ? '+' : '') + fmtUSD(Number(v)), 'PnL']}
                  labelStyle={{ color: '#737373', fontSize: 10 }}
                />
                <Area type="monotone" dataKey="cumulativePnlUsd" stroke="#22C55E" strokeWidth={1.5} fill="url(#cpnl)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-xs" style={{ color: '#A3A3A3' }}>
                {historyLoading ? 'Loading price history...' : 'No data available'}
              </p>
            </div>
          )}
        </div>

        {/* Daily PnL bar chart - REAL DATA */}
        <div className="rounded-xl p-4" style={CARD_STYLE}>
          <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Daily PnL</h3>
          {dailyPnlChart.length >= 2 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyPnlChart} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                <XAxis dataKey="date" tick={{ fill: '#4A4A52', fontSize: 9 }} tickLine={false} axisLine={false}
                  interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#A3A3A3', fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={v => (v >= 0 ? '+' : '') + fmtUSD(v, true)} width={65}
                  domain={['auto', 'auto']} />
                <ReferenceLine y={0} stroke="#E5E5E5" />
                <Tooltip
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: any) => [(v >= 0 ? '+' : '') + fmtUSD(Number(v)), 'Daily PnL']}
                  labelStyle={{ color: '#737373', fontSize: 10 }}
                />
                <Bar dataKey="dailyPnlUsd" fill="#22C55E" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-xs" style={{ color: '#A3A3A3' }}>
                {historyLoading ? 'Loading price history...' : 'No data available'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Token PnL table with 30d real data */}
      <div className="rounded-xl overflow-hidden" style={CARD_STYLE}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #F0F0F0' }}>
          <h3 className="text-sm font-semibold text-[#0A0A0A]">Token P&L (Real Data)</h3>
        </div>
        <div className="divide-y" style={{ borderColor: '#F5F5F5' }}>
          {tokenPnlData.slice(0, 20).map((t, i) => (
            <div key={`${t.cgId}-${i}`} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
              {/* Token */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {t.logo ? (
                  <img src={t.logo} alt={t.symbol} className="w-7 h-7 rounded-full"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ background: '#A3A3A3', color: '#737373' }}>{t.symbol.slice(0, 2)}</div>
                )}
                <div>
                  <span className="text-xs font-semibold text-[#0A0A0A]">{t.symbol}</span>
                  <p className="text-[10px]" style={{ color: '#A3A3A3' }}>
                    {t.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })} tokens
                  </p>
                </div>
              </div>

              {/* 30d ago price */}
              <div className="text-right hidden md:block">
                <p className="text-[9px]" style={{ color: '#A3A3A3' }}>30d Ago</p>
                <p className="text-xs font-mono" style={{ color: '#737373' }}>{fmtUSD(t.price30dAgo)}</p>
              </div>

              {/* Current price */}
              <div className="text-right hidden md:block">
                <p className="text-[9px]" style={{ color: '#A3A3A3' }}>Current</p>
                <p className="text-xs font-mono text-[#0A0A0A]">{fmtUSD(t.currentPrice)}</p>
              </div>

              {/* Sparkline */}
              <div className="w-20 hidden lg:block">
                <TokenPriceChart cgId={t.cgId} days={period} height={28} />
              </div>

              {/* PnL */}
              <div className="text-right min-w-[80px]">
                <p className={`text-xs font-mono font-semibold ${pctClass(t.pnlUsd)}`}>
                  {t.pnlUsd >= 0 ? '+' : ''}{fmtUSD(t.pnlUsd)}
                </p>
                <p className={`text-[10px] font-mono ${pctClass(t.pnlPct)}`}>
                  {t.pnlPct >= 0 ? '+' : ''}{t.pnlPct.toFixed(1)}%
                </p>
              </div>

              {/* Bar indicator */}
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: '#F0F0F0' }}>
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.abs(t.pnlPct))}%`,
                    background: t.pnlUsd >= 0 ? '#22C55E' : '#EF4444',
                  }} />
              </div>
            </div>
          ))}

          {tokenPnlData.length === 0 && (
            <p className="text-xs text-center py-8" style={{ color: '#A3A3A3' }}>
              {historyLoading ? 'Loading token data...' : 'No tokens in portfolio'}
            </p>
          )}
        </div>
      </div>

      {/* Per-wallet breakdown */}
      {walletPnl.length > 1 && (
        <div className="rounded-xl p-4" style={CARD_STYLE}>
          <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">PnL by Wallet</h3>
          <div className="space-y-3">
            {walletPnl.map(w => (
              <div key={w.label} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: w.color }} />
                <span className="text-xs text-[#0A0A0A] flex-1">{w.label}</span>
                <span className="text-xs font-mono" style={{ color: '#737373' }}>{fmtUSD(w.value)}</span>
                <span className={`text-xs font-mono font-semibold min-w-[70px] text-right ${pctClass(w.pnl)}`}>
                  {w.pnl >= 0 ? '+' : ''}{fmtUSD(w.pnl)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
