import { useState } from 'react'
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react'
import { fmtUSD } from '../lib/formatters'
import type { PriceData } from '../hooks/usePrices'
import type { PriceAlert } from '../types'

interface Props {
  prices: Record<string, PriceData>
  priceMap?: Record<string, number>
}

const ALERTS_KEY = 'wallet-tracker-alerts'

function loadAlerts(): PriceAlert[] {
  try { return JSON.parse(localStorage.getItem(ALERTS_KEY) ?? '[]') } catch { return [] }
}

function saveAlerts(a: PriceAlert[]) {
  try { localStorage.setItem(ALERTS_KEY, JSON.stringify(a)) } catch {}
}

export function Alerts({ prices }: Props) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(loadAlerts)
  const [showForm, setShowForm] = useState(false)
  const [tokenId, setTokenId] = useState('ethereum')
  const [condition, setCondition] = useState<'above' | 'below'>('above')
  const [threshold, setThreshold] = useState('')

  const priceList = Object.values(prices).sort((a, b) => b.marketCap - a.marketCap)

  function addAlert() {
    if (!threshold || isNaN(Number(threshold))) return
    const a: PriceAlert = {
      id: Math.random().toString(36).slice(2),
      tokenId,
      symbol: (prices[tokenId]?.symbol ?? tokenId).toUpperCase(),
      condition,
      threshold: Number(threshold),
      enabled: true,
      triggered: false,
      createdAt: Date.now(),
    }
    const next = [...alerts, a]
    setAlerts(next)
    saveAlerts(next)
    setShowForm(false)
    setThreshold('')
  }

  function removeAlert(id: string) {
    const next = alerts.filter(a => a.id !== id)
    setAlerts(next)
    saveAlerts(next)
  }

  function toggleAlert(id: string) {
    const next = alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a)
    setAlerts(next)
    saveAlerts(next)
  }

  // Check which alerts would be triggered now
  const withStatus = alerts.map(a => {
    const price = prices[a.tokenId]?.price ?? 0
    const wouldTrigger = a.condition === 'above' ? price >= a.threshold : price <= a.threshold
    return { ...a, currentPrice: price, wouldTrigger }
  })

  const inputStyle = {
    background: '#F5F5F5', border: '1px solid #E5E5E5',
    borderRadius: 8, color: '#0A0A0A', outline: 'none', fontSize: 13,
    padding: '8px 12px', width: '100%',
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-[#0A0A0A] font-serif">Price Alerts</h2>
          <p className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>
            {withStatus.filter(a => a.enabled).length} active · {withStatus.filter(a => a.wouldTrigger && a.enabled).length} triggered
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
          style={{ background: '#F0F0F0', border: '1px solid #D4D4D4', color: '#0A0A0A' }}
        >
          <Plus size={13} /> New Alert
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl p-5 mb-5" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
          <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Create Alert</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#737373' }}>Token</label>
              <select value={tokenId} onChange={e => setTokenId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {priceList.slice(0, 30).map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.symbol})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#737373' }}>Condition</label>
              <select value={condition} onChange={e => setCondition(e.target.value as 'above' | 'below')} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="above">Price goes above</option>
                <option value="below">Price goes below</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#737373' }}>
                Threshold {prices[tokenId] ? `(now ${fmtUSD(prices[tokenId].price)})` : ''}
              </label>
              <input
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                placeholder="Enter price in USD"
                type="number"
                style={inputStyle}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addAlert}
              className="px-4 py-2 rounded-lg text-xs font-medium"
              style={{ background: '#E5E5E5', border: '1px solid #E5E5E5', color: '#0A0A0A' }}>
              Create Alert
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-xs" style={{ color: '#737373' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Alert list */}
      {withStatus.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
            style={{ background: '#F0F0F0', border: '1px solid #E5E5E5' }}>
            <Bell size={20} style={{ color: '#A3A3A3' }} />
          </div>
          <p className="text-sm mb-4" style={{ color: '#A3A3A3' }}>No alerts yet</p>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: '#F0F0F0', border: '1px solid #D4D4D4', color: '#0A0A0A' }}>
            <Plus size={14} /> Create your first alert
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {withStatus.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: '#FFFFFF', border: `1px solid ${a.wouldTrigger && a.enabled ? 'rgba(34,197,94,0.3)' : '#E5E5E5'}` }}>
              {/* Triggered badge */}
              {a.wouldTrigger && a.enabled && (
                <CheckCircle size={16} style={{ color: '#22C55E', flexShrink: 0 }} />
              )}
              {!(a.wouldTrigger && a.enabled) && (
                <Bell size={16} style={{ color: a.enabled ? '#F59E0B' : '#4A4A52', flexShrink: 0 }} />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#0A0A0A]">{a.symbol}</span>
                  <span className="text-xs" style={{ color: '#737373' }}>
                    {a.condition === 'above' ? 'goes above' : 'goes below'}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#0A0A0A]">{fmtUSD(a.threshold)}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px]" style={{ color: '#A3A3A3' }}>
                    Current: {fmtUSD(a.currentPrice)}
                  </span>
                  {a.wouldTrigger && a.enabled && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                      TRIGGERED
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleAlert(a.id)} title={a.enabled ? 'Disable' : 'Enable'}>
                  {a.enabled
                    ? <ToggleRight size={20} style={{ color: '#22C55E' }} />
                    : <ToggleLeft size={20} style={{ color: '#A3A3A3' }} />
                  }
                </button>
                <button onClick={() => removeAlert(a.id)} title="Delete">
                  <Trash2 size={14} style={{ color: '#A3A3A3' }}
                    onMouseEnter={(e: any) => { e.currentTarget.style.color = '#EF4444' }}
                    onMouseLeave={(e: any) => { e.currentTarget.style.color = '#4A4A52' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
