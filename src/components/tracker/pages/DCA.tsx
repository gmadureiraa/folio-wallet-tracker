import { useState, useMemo } from 'react'
import { Plus, Trash2, TrendingUp, Calendar, DollarSign, ChevronDown, ChevronUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { fmtUSD, fmtNumber } from '../lib/formatters'
import type { DCAEntry, DCAFrequency, WalletPortfolio } from '../types'

const DCA_KEY = 'wallet-tracker-dca'

function loadDCA(): DCAEntry[] { try { return JSON.parse(localStorage.getItem(DCA_KEY) ?? '[]') } catch { return [] } }
function saveDCA(d: DCAEntry[]) { try { localStorage.setItem(DCA_KEY, JSON.stringify(d)) } catch {} }
function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

const FREQ_DAYS: Record<DCAFrequency, number> = { daily: 1, weekly: 7, biweekly: 14, monthly: 30 }
const FREQ_LABELS: Record<DCAFrequency, string> = { daily: 'Daily', weekly: 'Weekly', biweekly: 'Bi-weekly', monthly: 'Monthly' }

const TOKENS = [
  { id: 'bitcoin', symbol: 'BTC', color: '#F7931A' },
  { id: 'ethereum', symbol: 'ETH', color: '#627EEA' },
  { id: 'solana', symbol: 'SOL', color: '#9945FF' },
  { id: 'chainlink', symbol: 'LINK', color: '#375BD2' },
  { id: 'avalanche-2', symbol: 'AVAX', color: '#E84142' },
  { id: 'polkadot', symbol: 'DOT', color: '#E6007A' },
  { id: 'uniswap', symbol: 'UNI', color: '#FF007A' },
  { id: 'aave', symbol: 'AAVE', color: '#B6509E' },
]

const TOKEN_COLORS = ['#627EEA', '#F7931A', '#9945FF', '#22C55E', '#F59E0B', '#14B8A6', '#EF4444', '#60A5FA']

function getNextDate(start: string, freq: DCAFrequency): string {
  const days = FREQ_DAYS[freq]
  const d = new Date(start)
  const now = new Date()
  while (d <= now) d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function simulateHistory(entry: DCAEntry, priceMap: Record<string, number>): DCAEntry {
  const currentPrice = priceMap[entry.tokenId] ?? 100
  const days = FREQ_DAYS[entry.frequency]
  const start = new Date(entry.startDate)
  const now = new Date()
  const history = []
  let d = new Date(start)
  let seed = entry.tokenId.charCodeAt(0) + entry.amountUsd

  while (d < now) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    const priceFactor = 0.4 + (seed % 1000) / 833
    const price = currentPrice * priceFactor
    history.push({
      id: genId(),
      date: d.toISOString().split('T')[0],
      amountUsd: entry.amountUsd,
      priceAtExecution: price,
      tokensAcquired: entry.amountUsd / price,
    })
    d = new Date(d)
    d.setDate(d.getDate() + days)
  }

  const totalTokens = history.reduce((s, h) => s + h.tokensAcquired, 0)
  const totalInvested = history.reduce((s, h) => s + h.amountUsd, 0)
  return {
    ...entry,
    history,
    totalInvested,
    totalTokens,
    avgCostBasis: totalTokens > 0 ? totalInvested / totalTokens : 0,
    nextDate: getNextDate(entry.startDate, entry.frequency),
  }
}

function DCAChart({ entry, priceMap }: { entry: DCAEntry; priceMap: Record<string, number> }) {
  const currentPrice = priceMap[entry.tokenId] ?? 0
  const data = entry.history.map((h, i) => {
    const cumInvested = entry.history.slice(0, i + 1).reduce((s, x) => s + x.amountUsd, 0)
    const cumTokens = entry.history.slice(0, i + 1).reduce((s, x) => s + x.tokensAcquired, 0)
    return { date: h.date.slice(5), invested: cumInvested, value: cumTokens * currentPrice }
  })
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`gi-${entry.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={entry.color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={entry.color} stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`gv-${entry.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fill: '#4A4A52', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fill: '#4A4A52', fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
        <Tooltip contentStyle={{ background: '#1E1E22', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 11 }} formatter={(v) => fmtUSD(v as number)} />
        <Area type="monotone" dataKey="invested" stroke={entry.color} strokeWidth={1.5} fill={`url(#gi-${entry.id})`} strokeDasharray="4 2" />
        <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={1.5} fill={`url(#gv-${entry.id})`} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function DCACard({ entry, priceMap, onRemove, onToggle }: {
  entry: DCAEntry; priceMap: Record<string, number>; onRemove: (id: string) => void; onToggle: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const currentPrice = priceMap[entry.tokenId] ?? 0
  const currentValue = entry.totalTokens * currentPrice
  const pnl = currentValue - entry.totalInvested
  const pnlPct = entry.totalInvested > 0 ? (pnl / entry.totalInvested) * 100 : 0
  const positive = pnl >= 0

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: '#161618', borderColor: `${entry.color}30` }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold" style={{ background: `${entry.color}20`, color: entry.color }}>
              {entry.tokenSymbol}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0A0A0A]">{entry.tokenSymbol} DCA</p>
              <p className="text-xs" style={{ color: '#737373' }}>{FREQ_LABELS[entry.frequency]} · {fmtUSD(entry.amountUsd)}/execution</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entry.enabled ? 'text-[#22C55E]' : 'text-[#4A4A52]'}`}
              style={{ background: entry.enabled ? 'rgba(34,197,94,0.12)' : '#F5F5F5' }}>
              {entry.enabled ? 'Active' : 'Paused'}
            </span>
            <button onClick={() => onToggle(entry.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-xs" style={{ color: '#737373' }}>
              {entry.enabled ? 'Pause' : 'Resume'}
            </button>
            <button onClick={() => onRemove(entry.id)} className="p-1.5 rounded-lg hover:bg-white/10">
              <Trash2 size={13} className="text-[#4A4A52] hover:text-[#EF4444]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-3">
          {[
            { label: 'Invested', value: fmtUSD(entry.totalInvested, true) },
            { label: 'Current Value', value: fmtUSD(currentValue, true) },
            { label: 'Avg Cost', value: fmtUSD(entry.avgCostBasis) },
            { label: 'PnL', value: `${positive ? '+' : ''}${pnlPct.toFixed(1)}%` },
          ].map(s => (
            <div key={s.label} className="p-2.5 rounded-lg" style={{ background: '#FAFAFA' }}>
              <p className="text-[10px] mb-1" style={{ color: '#A3A3A3' }}>{s.label}</p>
              <p className="text-sm font-semibold" style={{ color: s.label === 'PnL' ? (positive ? '#22C55E' : '#EF4444') : '#FFFFFF' }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs mb-2">
          <span style={{ color: '#737373' }}>Next execution: <span className="text-[#0A0A0A] font-medium">{entry.nextDate}</span></span>
          <button onClick={() => setExpanded(x => !x)} className="flex items-center gap-1" style={{ color: '#737373' }}>
            {expanded ? 'Hide' : 'Show'} chart {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        {expanded && entry.history.length > 0 && <DCAChart entry={entry} priceMap={priceMap} />}
      </div>
    </div>
  )
}

interface DCAProps {
  portfolios: WalletPortfolio[]
  priceMap: Record<string, number>
  prices: Record<string, unknown>
}

export function DCA({ priceMap }: DCAProps) {
  const [rawEntries, setRawEntries] = useState<DCAEntry[]>(loadDCA)
  const [showForm, setShowForm] = useState(false)
  const [tokenId, setTokenId] = useState('bitcoin')
  const [amount, setAmount] = useState('100')
  const [freq, setFreq] = useState<DCAFrequency>('weekly')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  const entries = useMemo(() => rawEntries.map(e => simulateHistory(e, priceMap)), [rawEntries, priceMap])

  function addEntry() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    const tok = TOKENS.find(t => t.id === tokenId) ?? TOKENS[0]
    const color = TOKEN_COLORS[rawEntries.length % TOKEN_COLORS.length]
    const entry: DCAEntry = {
      id: genId(), tokenId: tok.id, tokenSymbol: tok.symbol, tokenName: tok.symbol,
      tokenLogo: '', amountUsd: amt, frequency: freq, startDate,
      nextDate: getNextDate(startDate, freq), enabled: true,
      history: [], totalInvested: 0, totalTokens: 0, avgCostBasis: 0, color,
    }
    const next = [...rawEntries, entry]
    setRawEntries(next); saveDCA(next); setShowForm(false)
  }

  function removeEntry(id: string) { const n = rawEntries.filter(e => e.id !== id); setRawEntries(n); saveDCA(n) }
  function toggleEntry(id: string) { const n = rawEntries.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e); setRawEntries(n); saveDCA(n) }

  const totalInvested = entries.reduce((s, e) => s + e.totalInvested, 0)
  const totalValue = entries.reduce((s, e) => s + e.totalTokens * (priceMap[e.tokenId] ?? 0), 0)
  const monthlyBudget = rawEntries.filter(e => e.enabled).reduce((s, e) => s + e.amountUsd * (30 / FREQ_DAYS[e.frequency]), 0)

  const upcoming = entries
    .filter(e => e.enabled)
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
    .slice(0, 5)

  const inputStyle = { background: '#1E1E22', border: '1px solid #E5E5E5', borderRadius: 8, color: '#0A0A0A', outline: 'none', fontSize: 13, padding: '8px 12px', width: '100%' }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0A0A0A] font-serif flex items-center gap-2">
            <TrendingUp size={20} style={{ color: '#627EEA' }} />
            DCA Planner
          </h1>
          <p className="text-sm mt-1" style={{ color: '#737373' }}>Dollar-cost averaging tracker & scheduler</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'rgba(98,126,234,0.15)', border: '1px solid rgba(98,126,234,0.3)', color: '#627EEA' }}>
          <Plus size={15} /> New Plan
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Active Plans', value: fmtNumber(entries.filter(e => e.enabled).length), icon: Calendar, color: '#627EEA' },
          { label: 'Monthly Budget', value: fmtUSD(monthlyBudget, true), icon: DollarSign, color: '#F59E0B' },
          { label: 'Total Invested', value: fmtUSD(totalInvested, true), icon: TrendingUp, color: '#9945FF' },
          { label: 'Current Value', value: fmtUSD(totalValue, true), icon: TrendingUp, color: totalValue >= totalInvested ? '#22C55E' : '#EF4444' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-xl border" style={{ background: '#161618', borderColor: '#E5E5E5' }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} style={{ color }} />
              <p className="text-xs" style={{ color: '#737373' }}>{label}</p>
            </div>
            <p className="text-lg font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="p-5 rounded-xl border" style={{ background: '#161618', borderColor: 'rgba(98,126,234,0.3)' }}>
          <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Create DCA Plan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#737373' }}>Token</label>
              <select value={tokenId} onChange={e => setTokenId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {TOKENS.map(t => <option key={t.id} value={t.id}>{t.symbol}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#737373' }}>Amount (USD)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100" style={inputStyle} />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#737373' }}>Frequency</label>
              <select value={freq} onChange={e => setFreq(e.target.value as DCAFrequency)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#737373' }}>Start date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addEntry} className="px-4 py-2 rounded-lg text-xs font-medium" style={{ background: 'rgba(98,126,234,0.2)', border: '1px solid rgba(98,126,234,0.4)', color: '#627EEA' }}>
              Create Plan
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-xs" style={{ color: '#737373' }}>Cancel</button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(98,126,234,0.1)', border: '1px solid rgba(98,126,234,0.2)' }}>
            <TrendingUp size={24} style={{ color: '#627EEA' }} />
          </div>
          <p className="text-sm font-medium text-[#0A0A0A] mb-1">No DCA plans yet</p>
          <p className="text-xs mb-5" style={{ color: '#A3A3A3' }}>Create a plan to track your dollar-cost averaging strategy</p>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(98,126,234,0.15)', border: '1px solid rgba(98,126,234,0.3)', color: '#627EEA' }}>
            <Plus size={14} /> Create your first plan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(e => <DCACard key={e.id} entry={e} priceMap={priceMap} onRemove={removeEntry} onToggle={toggleEntry} />)}
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="p-4 rounded-xl border" style={{ background: '#161618', borderColor: '#E5E5E5' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#A3A3A3' }}>Upcoming Executions</p>
          <div className="space-y-2">
            {upcoming.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: '#F5F5F5' }}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: `${e.color}20`, color: e.color }}>{e.tokenSymbol.slice(0, 1)}</div>
                  <span className="text-xs text-[#0A0A0A]">{e.tokenSymbol}</span>
                  <span className="text-xs" style={{ color: '#A3A3A3' }}>{FREQ_LABELS[e.frequency]}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-[#0A0A0A]">{fmtUSD(e.amountUsd)}</span>
                  <span className="text-xs font-medium" style={{ color: '#627EEA' }}>{e.nextDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
