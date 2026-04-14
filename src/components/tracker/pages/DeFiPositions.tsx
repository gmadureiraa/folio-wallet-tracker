import { useState, useMemo } from 'react'
import { Layers, TrendingUp, Clock, Coins, Percent, Gift } from 'lucide-react'
import { fmtUSD, pctClass } from '../lib/formatters'
import { CHAINS } from '../lib/chains'
import type { TrackedWallet, DeFiPosition, DeFiPositionType } from '../types'

interface Props {
  positions: DeFiPosition[]
  wallets: TrackedWallet[]
}

const TYPE_LABELS: Record<DeFiPositionType, string> = {
  staking: 'Staking',
  lending: 'Lending',
  lp: 'Liquidity Pool',
  farming: 'Farming',
}

const TYPE_ICONS: Record<DeFiPositionType, typeof Coins> = {
  staking: Coins,
  lending: Percent,
  lp: Layers,
  farming: Gift,
}

const TYPE_COLORS: Record<DeFiPositionType, string> = {
  staking: '#8B5CF6',
  lending: '#3B82F6',
  lp: '#22C55E',
  farming: '#F59E0B',
}

export function DeFiPositions({ positions, wallets }: Props) {
  const [filterType, setFilterType] = useState<string>('all')
  const [filterWallet, setFilterWallet] = useState<string>('all')

  const filtered = useMemo(() => {
    let list = [...positions]
    if (filterType !== 'all') list = list.filter(p => p.type === filterType)
    if (filterWallet !== 'all') list = list.filter(p => p.walletId === filterWallet)
    return list.sort((a, b) => b.valueUsd - a.valueUsd)
  }, [positions, filterType, filterWallet])

  const totalValue = filtered.reduce((s, p) => s + p.valueUsd, 0)
  const totalRewards = filtered.reduce((s, p) => s + p.pendingRewards, 0)
  const totalPnl = filtered.reduce((s, p) => s + p.pnlUsd, 0)
  const totalDeposited = filtered.reduce((s, p) => s + p.depositedUsd, 0)
  const avgApy = filtered.length > 0
    ? filtered.reduce((s, p) => s + p.apy * p.valueUsd, 0) / (totalValue || 1)
    : 0

  // Type breakdown
  const typeBreakdown = useMemo(() => {
    const map = new Map<DeFiPositionType, { count: number; value: number }>()
    for (const p of filtered) {
      const existing = map.get(p.type) ?? { count: 0, value: 0 }
      map.set(p.type, { count: existing.count + 1, value: existing.value + p.valueUsd })
    }
    return map
  }, [filtered])

  return (
    <div className="p-6 page-enter">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-[#0A0A0A] font-serif">DeFi Positions</h2>
          <p className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>
            {filtered.length} positions · {fmtUSD(totalValue)} total value
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5 stagger-children">
        {[
          { label: 'Total Deposited', value: fmtUSD(totalDeposited), icon: Coins, color: '#0A0A0A' },
          { label: 'Current Value', value: fmtUSD(totalValue), icon: TrendingUp, color: '#3B82F6' },
          { label: 'Pending Rewards', value: fmtUSD(totalRewards), icon: Gift, color: '#F59E0B' },
          { label: 'Total PnL', value: (totalPnl >= 0 ? '+' : '') + fmtUSD(totalPnl), icon: Percent, color: totalPnl >= 0 ? '#22C55E' : '#EF4444' },
          { label: 'Avg APY', value: `${avgApy.toFixed(1)}%`, icon: TrendingUp, color: '#8B5CF6' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-xl p-4 card-hover" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: s.color + '12' }}>
                  <Icon size={12} style={{ color: s.color }} />
                </div>
                <p className="text-[10px] font-medium" style={{ color: '#A3A3A3' }}>{s.label}</p>
              </div>
              <p className="text-lg font-bold font-mono tabular-nums" style={{ color: s.color }}>{s.value}</p>
            </div>
          )
        })}
      </div>

      {/* Type filter pills */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilterType('all')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: filterType === 'all' ? '#0A0A0A' : '#F5F5F5',
            color: filterType === 'all' ? '#FFFFFF' : '#737373',
            border: `1px solid ${filterType === 'all' ? '#0A0A0A' : '#E5E5E5'}`,
            cursor: 'pointer',
          }}
        >
          All ({filtered.length})
        </button>
        {(Object.keys(TYPE_LABELS) as DeFiPositionType[]).map(type => {
          const breakdown = typeBreakdown.get(type)
          if (!breakdown) return null
          return (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filterType === type ? TYPE_COLORS[type] + '18' : '#F5F5F5',
                color: filterType === type ? TYPE_COLORS[type] : '#737373',
                border: `1px solid ${filterType === type ? TYPE_COLORS[type] + '44' : '#E5E5E5'}`,
                cursor: 'pointer',
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[type] }} />
              {TYPE_LABELS[type]} ({breakdown.count})
            </button>
          )
        })}
        {wallets.length > 1 && (
          <select value={filterWallet} onChange={e => setFilterWallet(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer ml-auto"
            style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#737373' }}>
            <option value="all">All Wallets</option>
            {wallets.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(34,197,94,0.1))', border: '1px solid rgba(139,92,246,0.15)' }}>
            <Layers size={24} style={{ color: '#8B5CF6' }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: '#0A0A0A' }}>
            {wallets.length === 0 ? 'No wallets added' : 'No DeFi positions found'}
          </p>
          <p className="text-xs" style={{ color: '#A3A3A3' }}>
            {wallets.length === 0
              ? 'Add wallets to see your DeFi positions'
              : 'Positions from protocols like Aave, Uniswap, Lido will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {filtered.map(pos => {
            const typeColor = TYPE_COLORS[pos.type]
            const TypeIcon = TYPE_ICONS[pos.type]
            const chain = CHAINS[pos.chain]
            const wallet = wallets.find(w => w.id === pos.walletId)
            const ageMonths = (Date.now() - pos.openedAt) / (30 * 86400 * 1000)
            const pnlPct = pos.depositedUsd > 0 ? ((pos.valueUsd - pos.depositedUsd) / pos.depositedUsd) * 100 : 0

            return (
              <div key={pos.id} className="defi-card rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                {/* Color accent top bar */}
                <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${typeColor}, ${chain.color})` }} />

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img src={pos.protocolLogo} alt={pos.protocol} className="w-9 h-9 rounded-xl"
                          onError={e => {
                            const el = e.target as HTMLImageElement
                            el.style.display = 'none'
                            el.parentElement!.innerHTML = `<div class="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold" style="background: ${typeColor}15; color: ${typeColor}">${pos.protocol.slice(0, 2)}</div>`
                          }} />
                        {/* Chain badge */}
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold border-2 border-white"
                          style={{ background: chain.color, color: '#fff' }}>
                          {chain.name.slice(0, 1)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0A0A0A]">{pos.protocol}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md font-semibold"
                            style={{ background: typeColor + '15', color: typeColor }}>
                            <TypeIcon size={9} />
                            {TYPE_LABELS[pos.type]}
                          </span>
                          <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: chain.color + '15', color: chain.color }}>
                            {chain.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* APY badge */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#22C55E12', border: '1px solid #22C55E22' }}>
                        <TrendingUp size={10} style={{ color: '#22C55E' }} />
                        <span className="text-xs font-mono tabular-nums font-bold" style={{ color: '#22C55E' }}>{pos.apy.toFixed(1)}%</span>
                      </div>
                      <p className="text-[9px] mt-0.5" style={{ color: '#A3A3A3' }}>APY</p>
                    </div>
                  </div>

                  {/* Tokens in pool */}
                  <div className="flex items-center gap-1.5 mb-3">
                    {pos.tokens.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                        style={{ background: '#F5F5F5', color: '#737373', border: '1px solid #E5E5E5' }}>{t}</span>
                    ))}
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-3 py-3 px-3 rounded-lg" style={{ background: '#FAFAFA' }}>
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-wider" style={{ color: '#A3A3A3' }}>Deposited</p>
                      <p className="text-sm font-mono tabular-nums" style={{ color: '#737373' }}>{fmtUSD(pos.depositedUsd)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-wider" style={{ color: '#A3A3A3' }}>Current Value</p>
                      <p className="text-sm font-mono tabular-nums font-semibold text-[#0A0A0A]">{fmtUSD(pos.valueUsd)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-wider" style={{ color: '#A3A3A3' }}>Rewards</p>
                      <p className="text-sm font-mono tabular-nums font-semibold" style={{ color: '#F59E0B' }}>
                        {fmtUSD(pos.pendingRewards)}
                        <span className="text-[9px] ml-0.5 font-normal" style={{ color: '#A3A3A3' }}>{pos.pendingRewardSymbol}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-wider" style={{ color: '#A3A3A3' }}>PnL</p>
                      <div className="flex items-center gap-1.5">
                        <p className={`text-sm font-mono tabular-nums font-semibold ${pctClass(pos.pnlUsd)}`}>
                          {pos.pnlUsd >= 0 ? '+' : ''}{fmtUSD(pos.pnlUsd)}
                        </p>
                        <span className={`text-[9px] font-mono tabular-nums ${pctClass(pnlPct)}`}>
                          ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #F0F0F0' }}>
                    <div className="flex items-center gap-2">
                      {wallet && (
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: wallet.color }} />
                          <span className="text-[9px] font-medium" style={{ color: '#737373' }}>{wallet.label}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={9} style={{ color: '#A3A3A3' }} />
                      <span className="text-[9px]" style={{ color: '#A3A3A3' }}>
                        {ageMonths < 1 ? `${Math.floor(ageMonths * 30)}d` : `${ageMonths.toFixed(1)}mo`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
