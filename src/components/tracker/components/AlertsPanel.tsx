import { useState } from 'react'
import { Bell, X, Plus, Trash2, ToggleLeft, ToggleRight, Zap, Cpu, TrendingUp } from 'lucide-react'
import type { AlertRule, AlertType, Coin } from '../types'

interface AlertsPanelProps {
  rules: AlertRule[]
  coins: Coin[]
  onAdd: (type: AlertType, label: string, threshold: number, extra?: { assetId?: string; assetSymbol?: string }) => void
  onRemove: (id: string) => void
  onToggle: (id: string) => void
  onClose: () => void
  onRequestPermission: () => void
}

const TYPE_META: Record<AlertType, { label: string; icon: React.ReactNode; unit: string; placeholder: string }> = {
  price_above:   { label: 'Price above',    icon: <TrendingUp size={13} />, unit: '$',       placeholder: '100000' },
  price_below:   { label: 'Price below',    icon: <TrendingUp size={13} />, unit: '$',       placeholder: '40000'  },
  gas_above:     { label: 'ETH Gas above',  icon: <Zap size={13} />,         unit: 'gwei',    placeholder: '50'     },
  mempool_above: { label: 'Mempool above',  icon: <Cpu size={13} />,         unit: 'TXs',     placeholder: '80000'  },
  fng_above:     { label: 'Fear&Greed ↑',  icon: <Bell size={13} />,        unit: '',        placeholder: '80'     },
  fng_below:     { label: 'Fear&Greed ↓',  icon: <Bell size={13} />,        unit: '',        placeholder: '20'     },
}

const PRICE_ALERT_TYPES: AlertType[] = ['price_above', 'price_below']

export function AlertsPanel({ rules, coins, onAdd, onRemove, onToggle, onClose, onRequestPermission }: AlertsPanelProps) {
  const [type, setType]     = useState<AlertType>('price_above')
  const [coinId, setCoinId] = useState(coins[0]?.id ?? 'bitcoin')
  const [value, setValue]   = useState('')

  const notifEnabled = 'Notification' in window && Notification.permission === 'granted'

  function handleAdd() {
    const n = parseFloat(value)
    if (isNaN(n) || n <= 0) return

    const isPriceAlert = PRICE_ALERT_TYPES.includes(type)
    const coin = isPriceAlert ? coins.find(c => c.id === coinId) : undefined
    const meta = TYPE_META[type]
    const label = isPriceAlert && coin
      ? `${coin.symbol.toUpperCase()} ${meta.label.toLowerCase()} $${n.toLocaleString()}`
      : `${meta.label} ${n}${meta.unit ? ' ' + meta.unit : ''}`

    onAdd(type, label, n, isPriceAlert && coin ? { assetId: coin.id, assetSymbol: coin.symbol } : undefined)
    setValue('')
  }

  const card = { background: '#FFFFFF', border: '1px solid #E5E5E5' }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose}
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

      {/* Panel */}
      <div className="fixed right-4 top-14 z-50 flex flex-col rounded-2xl overflow-hidden"
        style={{ width: 380, maxHeight: 'calc(100vh - 80px)', ...card, boxShadow: '0 24px 60px rgba(0,0,0,0.8)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid #F0F0F0', background: '#0E0E11' }}>
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-[#0A0A0A]" />
            <h2 className="text-sm font-bold text-[#0A0A0A]">Price Alerts</h2>
            {rules.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
                style={{ background: '#F0F0F0', color: '#737373' }}>
                {rules.filter(r => r.enabled).length} active
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#A3A3A3' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F0F0F0')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <X size={16} />
          </button>
        </div>

        {/* Notification permission banner */}
        {!notifEnabled && (
          <div className="px-5 py-3 flex items-center justify-between"
            style={{ background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.15)' }}>
            <p className="text-[11px]" style={{ color: '#F59E0B' }}>
              Enable browser notifications to receive alerts
            </p>
            <button
              onClick={onRequestPermission}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
              Enable
            </button>
          </div>
        )}

        {/* Add new alert form */}
        <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid #F0F0F0' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: '#A3A3A3' }}>New Alert</p>

          {/* Alert type */}
          <div className="grid grid-cols-3 gap-1 mb-3">
            {(Object.keys(TYPE_META) as AlertType[]).map(t => (
              <button key={t}
                onClick={() => setType(t)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: type === t ? '#E5E5E5' : '#FAFAFA',
                  border: `1px solid ${type === t ? '#D4D4D4' : '#F0F0F0'}`,
                  color: type === t ? '#FFFFFF' : '#8C8C96',
                }}>
                {TYPE_META[t].icon}
                <span className="truncate">{TYPE_META[t].label}</span>
              </button>
            ))}
          </div>

          {/* Coin selector for price alerts */}
          {PRICE_ALERT_TYPES.includes(type) && (
            <select
              value={coinId}
              onChange={e => setCoinId(e.target.value)}
              className="w-full mb-2 px-3 py-2 rounded-lg text-xs font-medium outline-none"
              style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', color: '#0A0A0A' }}>
              {coins.slice(0, 50).map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.symbol.toUpperCase()}) — ${c.current_price.toLocaleString()}
                </option>
              ))}
            </select>
          )}

          {/* Value input + add button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder={`Threshold (${TYPE_META[type].unit || 'value'})`}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono"
                style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', color: '#0A0A0A' }}
                onFocus={e => (e.target.style.borderColor = '#D4D4D4')}
                onBlur={e  => (e.target.style.borderColor = '#E5E5E5')}
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={!value}
              className="px-3 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 flex-shrink-0 transition-all"
              style={{
                background: value ? '#22C55E' : '#F0F0F0',
                color: value ? '#000000' : '#4A4A52',
                cursor: value ? 'pointer' : 'not-allowed',
              }}>
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>

        {/* Rules list */}
        <div className="flex-1 overflow-y-auto">
          {rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-5">
              <Bell size={28} style={{ color: '#A3A3A3' }} className="mb-3" />
              <p className="text-sm text-center" style={{ color: '#A3A3A3' }}>No alerts set up yet.</p>
              <p className="text-xs text-center mt-1" style={{ color: '#A3A3A3' }}>Create an alert above to get browser notifications when conditions are met.</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {rules.map(rule => (
                <div key={rule.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                  style={{ background: '#FAFAFA', border: '1px solid #F0F0F0' }}>
                  {/* Icon */}
                  <div className="flex-shrink-0" style={{ color: rule.enabled ? '#22C55E' : '#4A4A52' }}>
                    {TYPE_META[rule.type].icon}
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: rule.enabled ? '#FFFFFF' : '#8C8C96' }}>
                      {rule.label}
                    </p>
                    {rule.lastTriggered && (
                      <p className="text-[10px] mt-0.5" style={{ color: '#A3A3A3' }}>
                        Last fired: {new Date(rule.lastTriggered).toLocaleTimeString()}
                      </p>
                    )}
                  </div>

                  {/* Toggle */}
                  <button onClick={() => onToggle(rule.id)} className="flex-shrink-0 transition-colors"
                    style={{ color: rule.enabled ? '#22C55E' : '#4A4A52' }}>
                    {rule.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>

                  {/* Delete */}
                  <button onClick={() => onRemove(rule.id)}
                    className="flex-shrink-0 p-1 rounded transition-colors"
                    style={{ color: '#A3A3A3' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#4A4A52')}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: '1px solid #F0F0F0', background: '#0E0E11' }}>
          <p className="text-[10px]" style={{ color: '#A3A3A3' }}>
            Alerts are checked every 60s · stored in browser · no account needed
          </p>
        </div>
      </div>
    </>
  )
}
