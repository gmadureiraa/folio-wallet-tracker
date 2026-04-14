import { Fuel, RefreshCw, Zap } from 'lucide-react'
import { CHAIN_LIST } from '../lib/chains'
import type { GasEstimate, ChainId } from '../types'

interface Props {
  gasEstimates: Partial<Record<ChainId, GasEstimate>>
  loading: boolean
}

const SPEED_COLORS = {
  slow: '#4A4A52',
  standard: '#8C8C96',
  fast: '#F59E0B',
  instant: '#EF4444',
}

const SPEED_LABELS = {
  slow: 'Slow',
  standard: 'Standard',
  fast: 'Fast',
  instant: 'Instant',
}

function GasBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="w-full h-1 rounded-full" style={{ background: '#F0F0F0' }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: 'width 0.5s ease' }} />
    </div>
  )
}

export function GasTracker({ gasEstimates, loading }: Props) {
  const orderedChains = CHAIN_LIST.map(c => ({ chain: c, estimate: gasEstimates[c.id] }))
    .filter(x => x.estimate)
    .sort((a, b) => (b.estimate?.usdPerTx?.standard ?? 0) - (a.estimate?.usdPerTx?.standard ?? 0))

  // Overall cheapest chain right now
  const cheapest = orderedChains.reduce<typeof orderedChains[0] | null>((prev, curr) => {
    if (!prev) return curr
    return (curr.estimate?.usdPerTx?.standard ?? Infinity) < (prev.estimate?.usdPerTx?.standard ?? Infinity) ? curr : prev
  }, null)

  function fmtGas(value: number, unit: 'gwei' | 'microlamport'): string {
    if (unit === 'gwei') {
      if (value < 1) return `${value.toFixed(3)} Gwei`
      return `${value.toFixed(1)} Gwei`
    }
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k μlamp`
    return `${value.toFixed(0)} μlamp`
  }

  function fmtUsd(v: number): string {
    if (v < 0.001) return `<$0.001`
    if (v < 0.01) return `$${v.toFixed(4)}`
    if (v < 1) return `$${v.toFixed(3)}`
    return `$${v.toFixed(2)}`
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-[#0A0A0A] font-serif">Gas Tracker</h2>
          <p className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>
            Real-time gas prices across 8 chains
          </p>
        </div>
        {loading && <RefreshCw size={14} className="spin" style={{ color: '#A3A3A3' }} />}
      </div>

      {/* Cheapest network highlight */}
      {cheapest && (
        <div className="rounded-xl p-4 mb-5 flex items-center gap-3"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <Zap size={18} style={{ color: '#22C55E' }} />
          <div>
            <p className="text-xs font-semibold text-[#0A0A0A]">Cheapest right now: {cheapest.chain.name}</p>
            <p className="text-[11px]" style={{ color: '#22C55E' }}>
              Standard tx: {fmtUsd(cheapest.estimate?.usdPerTx?.standard ?? 0)}
            </p>
          </div>
        </div>
      )}

      {/* Chain cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {orderedChains.map(({ chain, estimate }) => {
          if (!estimate) return null
          const maxStd = Math.max(...orderedChains.map(x => x.estimate?.standard ?? 0))

          return (
            <div key={chain.id} className="rounded-xl p-4" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ background: chain.color + '22', border: `1px solid ${chain.color}44` }}>
                    <Fuel size={11} style={{ color: chain.color }} />
                  </div>
                  <span className="text-xs font-semibold text-[#0A0A0A]">{chain.name}</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: chain.color + '22', color: chain.color }}>
                  {chain.symbol}
                </span>
              </div>

              {/* Gas speeds */}
              <div className="space-y-2.5">
                {(['slow', 'standard', 'fast', 'instant'] as const).map(speed => (
                  <div key={speed}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px]" style={{ color: SPEED_COLORS[speed] }}>{SPEED_LABELS[speed]}</span>
                      <div className="text-right">
                        <span className="text-[10px] font-mono" style={{ color: '#737373' }}>
                          {fmtGas(estimate[speed], estimate.unit)}
                        </span>
                        <span className="text-[9px] font-mono ml-2" style={{ color: SPEED_COLORS[speed] }}>
                          {fmtUsd(estimate.usdPerTx[speed])}
                        </span>
                      </div>
                    </div>
                    <GasBar value={estimate[speed]} max={maxStd * 2} color={SPEED_COLORS[speed]} />
                  </div>
                ))}
              </div>

              {/* Base fee if ETH */}
              {estimate.baseFeeGwei && (
                <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid #F0F0F0' }}>
                  <span className="text-[9px]" style={{ color: '#A3A3A3' }}>Base Fee</span>
                  <span className="text-[10px] font-mono" style={{ color: '#A3A3A3' }}>{estimate.baseFeeGwei.toFixed(1)} Gwei</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Transaction cost comparison table */}
      <div className="mt-5 rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #F0F0F0' }}>
          <h3 className="text-sm font-semibold text-[#0A0A0A]">Transfer Cost Comparison</h3>
          <p className="text-[10px] mt-0.5" style={{ color: '#A3A3A3' }}>Standard ETH transfer cost</p>
        </div>
        <div className="divide-y" style={{ borderColor: '#F5F5F5' }}>
          {orderedChains.map(({ chain, estimate }) => {
            if (!estimate) return null
            const stdUsd = estimate.usdPerTx.standard
            const maxCost = orderedChains[0]?.estimate?.usdPerTx?.standard ?? 1

            return (
              <div key={chain.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-2 h-2 rounded-full" style={{ background: chain.color }} />
                <span className="text-xs text-[#0A0A0A] flex-1">{chain.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-40 h-1.5 rounded-full overflow-hidden" style={{ background: '#F0F0F0' }}>
                    <div className="h-full rounded-full" style={{
                      width: `${(stdUsd / maxCost) * 100}%`,
                      background: chain.color,
                    }} />
                  </div>
                  <span className="text-xs font-mono text-[#0A0A0A] min-w-[60px] text-right">{fmtUsd(stdUsd)}</span>
                  {stdUsd < 0.01 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>cheap</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
