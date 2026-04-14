import { useState } from 'react'
import { Target, Plus, Trash2, DollarSign, Coins, PieChart as PieIcon, CheckCircle2 } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { fmtUSD } from '../lib/formatters'
import type { WalletPortfolio, Goal, AllocationTarget, GoalType } from '../types'

const GOALS_KEY = 'wallet-tracker-goals'
const ALLOC_KEY = 'wallet-tracker-allocation'

function loadGoals(): Goal[] { try { return JSON.parse(localStorage.getItem(GOALS_KEY) ?? '[]') } catch { return [] } }
function saveGoals(g: Goal[]) { try { localStorage.setItem(GOALS_KEY, JSON.stringify(g)) } catch {} }
function loadAlloc(): AllocationTarget[] { try { return JSON.parse(localStorage.getItem(ALLOC_KEY) ?? '[]') } catch { return [] } }
function saveAlloc(a: AllocationTarget[]) { try { localStorage.setItem(ALLOC_KEY, JSON.stringify(a)) } catch {} }
function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

const GOAL_COLORS = ['#627EEA', '#22C55E', '#F59E0B', '#EF4444', '#9945FF', '#14B8A6', '#F471B5', '#60A5FA']
const ALLOC_COLORS = ['#627EEA', '#F7931A', '#9945FF', '#22C55E', '#F59E0B', '#14B8A6', '#EF4444', '#60A5FA']

const GOAL_ICONS: Record<GoalType, React.ComponentType<{ size?: number; className?: string }>> = {
  token_amount: Coins,
  total_value: DollarSign,
  allocation: PieIcon,
}

const COMMON_TOKENS = [
  { id: 'bitcoin', symbol: 'BTC', logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
  { id: 'ethereum', symbol: 'ETH', logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  { id: 'solana', symbol: 'SOL', logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
  { id: 'chainlink', symbol: 'LINK', logo: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png' },
  { id: 'avalanche-2', symbol: 'AVAX', logo: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png' },
]

function getCurrentAmount(goal: Goal, portfolios: WalletPortfolio[], totalValue: number): number {
  if (goal.type === 'total_value') return totalValue
  if (goal.type === 'token_amount' && goal.targetTokenId) {
    return portfolios.reduce((s, p) => s + (p.tokens.find(t => t.id === goal.targetTokenId)?.valueUsd ?? 0), 0)
  }
  return 0
}

interface GoalFormProps {
  onAdd: (g: Omit<Goal, 'id' | 'createdAt' | 'color' | 'icon'>) => void
  onCancel: () => void
}

function GoalForm({ onAdd, onCancel }: GoalFormProps) {
  const [type, setType] = useState<GoalType>('total_value')
  const [title, setTitle] = useState('')
  const [description] = useState('')
  const [tokenId, setTokenId] = useState('bitcoin')
  const [amount, setAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')

  const token = COMMON_TOKENS.find(t => t.id === tokenId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !amount) return
    onAdd({
      title,
      description,
      type,
      targetTokenId: type === 'token_amount' ? tokenId : undefined,
      targetTokenSymbol: type === 'token_amount' ? token?.symbol : undefined,
      targetAmount: parseFloat(amount),
      targetDate: targetDate || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-xl border space-y-4" style={{ background: '#161618', borderColor: '#F0F0F0' }}>
      <h3 className="text-base font-semibold text-[#0A0A0A]">New Goal</h3>
      <div className="grid grid-cols-3 gap-2">
        {(['total_value', 'token_amount'] as GoalType[]).map(t => {
          const Icon = GOAL_ICONS[t]
          const label = t === 'total_value' ? 'Portfolio Value' : 'Token Target'
          return (
            <button key={t} type="button" onClick={() => setType(t)} className="flex flex-col items-center gap-2 p-3 rounded-lg border transition-all"
              style={{ background: type === t ? 'rgba(98,126,234,0.15)' : '#FAFAFA', borderColor: type === t ? 'rgba(98,126,234,0.4)' : '#F0F0F0' }}>
              <Icon size={18} className={type === t ? 'text-[#627EEA]' : 'text-[#8C8C96]'} />
              <span className="text-xs font-medium" style={{ color: type === t ? '#FFFFFF' : '#8C8C96' }}>{label}</span>
            </button>
          )
        })}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium mb-1.5 block" style={{ color: '#737373' }}>Goal title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Reach $50k total" className="w-full px-3 py-2 rounded-lg text-sm text-[#0A0A0A] focus:outline-none" style={{ background: '#1E1E22', border: '1px solid #E5E5E5' }} />
        </div>
        {type === 'token_amount' && (
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#737373' }}>Token</label>
            <select value={tokenId} onChange={e => setTokenId(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm text-[#0A0A0A] focus:outline-none" style={{ background: '#1E1E22', border: '1px solid #E5E5E5' }}>
              {COMMON_TOKENS.map(t => <option key={t.id} value={t.id}>{t.symbol}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: '#737373' }}>Target value (USD)</label>
          <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="50000" className="w-full px-3 py-2 rounded-lg text-sm text-[#0A0A0A] focus:outline-none" style={{ background: '#1E1E22', border: '1px solid #E5E5E5' }} />
        </div>
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: '#737373' }}>Target date (optional)</label>
          <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm text-[#0A0A0A] focus:outline-none" style={{ background: '#1E1E22', border: '1px solid #E5E5E5' }} />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 py-2 rounded-lg text-sm font-semibold text-[#0A0A0A] hover:opacity-80" style={{ background: '#627EEA' }}>Add Goal</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80" style={{ background: '#E5E5E5', color: '#737373' }}>Cancel</button>
      </div>
    </form>
  )
}

function GoalCard({ goal, currentAmount, onRemove }: { goal: Goal; currentAmount: number; onRemove: (id: string) => void }) {
  const Icon = GOAL_ICONS[goal.type]
  const pct = Math.min(goal.targetAmount > 0 ? (currentAmount / goal.targetAmount) * 100 : 0, 100)
  const done = pct >= 100

  return (
    <div className="p-4 rounded-xl border" style={{ background: '#161618', borderColor: done ? 'rgba(34,197,94,0.2)' : '#F0F0F0' }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${goal.color}20`, color: goal.color }}>
          {done ? <CheckCircle2 size={18} className="text-[#22C55E]" /> : <Icon size={18} />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#0A0A0A]">{goal.title}</p>
            {done && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>ACHIEVED</span>}
          </div>
          {goal.description && <p className="text-xs mt-0.5" style={{ color: '#737373' }}>{goal.description}</p>}
          {goal.targetDate && <p className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>Target: {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</p>}
        </div>
        <button onClick={() => onRemove(goal.id)} className="p-1.5 rounded-lg hover:bg-white/10">
          <Trash2 size={13} style={{ color: '#A3A3A3' }} />
        </button>
      </div>
      <div className="h-2 rounded-full mb-2 overflow-hidden" style={{ background: '#F0F0F0' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: done ? '#22C55E' : goal.color }} />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: '#737373' }}>{fmtUSD(currentAmount, true)} of {fmtUSD(goal.targetAmount, true)}</span>
        <span className="font-semibold" style={{ color: done ? '#22C55E' : goal.color }}>{pct.toFixed(1)}%</span>
      </div>
    </div>
  )
}

function AllocationManager({ targets, portfolios, totalValue, onChange }: {
  targets: AllocationTarget[]
  portfolios: WalletPortfolio[]
  totalValue: number
  onChange: (t: AllocationTarget[]) => void
}) {
  const [newToken, setNewToken] = useState('bitcoin')
  const [newPct, setNewPct] = useState('50')
  const usedPct = targets.reduce((s, t) => s + t.targetPct, 0)

  const tokenValues: Record<string, number> = {}
  portfolios.forEach(p => p.tokens.forEach(t => { tokenValues[t.id] = (tokenValues[t.id] ?? 0) + t.valueUsd }))

  const currentPie = [
    ...targets.map(t => ({ name: t.tokenSymbol, value: totalValue > 0 ? ((tokenValues[t.tokenId] ?? 0) / totalValue) * 100 : 0, color: t.color })),
    ...(totalValue > 0 ? [{ name: 'Other', value: Math.max(0, 100 - targets.reduce((s, t) => s + (totalValue > 0 ? ((tokenValues[t.tokenId] ?? 0) / totalValue) * 100 : 0), 0)), color: '#A3A3A3' }] : []),
  ]
  const targetPie = [
    ...targets.map(t => ({ name: t.tokenSymbol, value: t.targetPct, color: t.color })),
    ...(100 - usedPct > 0 ? [{ name: 'Unallocated', value: 100 - usedPct, color: '#A3A3A3' }] : []),
  ]

  function addTarget() {
    const pct = parseFloat(newPct)
    if (!pct || pct <= 0 || usedPct + pct > 100) return
    const tok = COMMON_TOKENS.find(t => t.id === newToken)
    if (!tok || targets.find(t => t.tokenId === newToken)) return
    const color = ALLOC_COLORS[targets.length % ALLOC_COLORS.length]
    onChange([...targets, { id: genId(), tokenId: tok.id, tokenSymbol: tok.symbol, tokenLogo: tok.logo, targetPct: pct, color }])
  }

  return (
    <div className="space-y-4">
      {targets.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {[{ title: 'Current', data: currentPie }, { title: 'Target', data: targetPie }].map(p => (
            <div key={p.title} className="p-4 rounded-xl border" style={{ background: '#161618', borderColor: '#E5E5E5' }}>
              <p className="text-xs font-medium mb-3 text-center" style={{ color: '#737373' }}>{p.title} allocation</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={p.data} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2}>
                    {p.data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${typeof v === 'number' ? (v as number).toFixed(1) : v}%`]} contentStyle={{ background: '#1E1E22', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {p.data.filter(d => d.name !== 'Other' && d.name !== 'Unallocated').map(d => (
                  <div key={d.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-[10px]" style={{ color: '#737373' }}>{d.name} {d.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {targets.length > 0 && (
        <div className="rounded-xl border p-4 space-y-2.5" style={{ background: '#161618', borderColor: '#E5E5E5' }}>
          <p className="text-xs font-medium" style={{ color: '#737373' }}>Deviation from target</p>
          {targets.map(t => {
            const current = totalValue > 0 ? ((tokenValues[t.tokenId] ?? 0) / totalValue) * 100 : 0
            const diff = current - t.targetPct
            return (
              <div key={t.id} className="flex items-center gap-3">
                <span className="text-xs w-10 text-right font-medium text-[#0A0A0A]">{t.tokenSymbol}</span>
                <div className="flex-1 h-4 rounded-full relative overflow-hidden" style={{ background: '#F5F5F5' }}>
                  <div className="absolute inset-y-0 left-1/2 w-px" style={{ background: '#D4D4D4' }} />
                  <div className="absolute top-0 bottom-0 rounded-full transition-all" style={{
                    width: `${Math.min(Math.abs(diff) * 2, 49)}%`,
                    left: diff < 0 ? `${Math.max(50 - Math.abs(diff) * 2, 1)}%` : '50%',
                    background: Math.abs(diff) > 5 ? (diff < 0 ? '#EF4444' : '#F59E0B') : t.color,
                  }} />
                </div>
                <span className="text-xs w-14 font-mono" style={{ color: Math.abs(diff) > 5 ? (diff < 0 ? '#EF4444' : '#F59E0B') : '#8C8C96' }}>
                  {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                </span>
                <button onClick={() => onChange(targets.filter(x => x.id !== t.id))} style={{ color: '#A3A3A3' }} className="hover:text-red-400 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex gap-2 p-3 rounded-xl border" style={{ background: '#FAFAFA', borderColor: '#E5E5E5' }}>
        <select value={newToken} onChange={e => setNewToken(e.target.value)} className="flex-1 px-3 py-2 rounded-lg text-xs text-[#0A0A0A] focus:outline-none" style={{ background: '#1E1E22', border: '1px solid #E5E5E5' }}>
          {COMMON_TOKENS.filter(t => !targets.find(x => x.tokenId === t.id)).map(t => <option key={t.id} value={t.id}>{t.symbol}</option>)}
        </select>
        <input type="number" value={newPct} onChange={e => setNewPct(e.target.value)} min="1" max={100 - usedPct} className="w-20 px-3 py-2 rounded-lg text-xs text-[#0A0A0A] text-center focus:outline-none" style={{ background: '#1E1E22', border: '1px solid #E5E5E5' }} placeholder="%" />
        <button onClick={addTarget} className="px-3 py-2 rounded-lg text-xs font-semibold text-[#0A0A0A] hover:opacity-80" style={{ background: '#627EEA' }}>Add</button>
      </div>
      {usedPct > 0 && <p className="text-xs text-center" style={{ color: '#A3A3A3' }}>{usedPct.toFixed(0)}% allocated · {(100 - usedPct).toFixed(0)}% remaining</p>}
    </div>
  )
}

interface GoalsProps {
  portfolios: WalletPortfolio[]
  priceMap: Record<string, number>
  totalValue: number
}

export function Goals({ portfolios, totalValue }: GoalsProps) {
  const [goals, setGoals] = useState<Goal[]>(loadGoals)
  const [alloc, setAlloc] = useState<AllocationTarget[]>(loadAlloc)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'goals' | 'allocation'>('goals')

  function handleAddGoal(data: Omit<Goal, 'id' | 'createdAt' | 'color' | 'icon'>) {
    const color = GOAL_COLORS[goals.length % GOAL_COLORS.length]
    const updated = [...goals, { ...data, id: genId(), createdAt: new Date().toISOString(), color, icon: data.type }]
    setGoals(updated); saveGoals(updated); setShowForm(false)
  }

  function handleRemoveGoal(id: string) {
    const updated = goals.filter(g => g.id !== id)
    setGoals(updated); saveGoals(updated)
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0A0A0A] font-serif flex items-center gap-2">
            <Target size={20} style={{ color: '#627EEA' }} />
            Goals & Allocation
          </h1>
          <p className="text-sm mt-1" style={{ color: '#737373' }}>Track your crypto targets and portfolio allocation</p>
        </div>
        {activeTab === 'goals' && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#0A0A0A] hover:opacity-80" style={{ background: '#627EEA' }}>
            <Plus size={15} />New Goal
          </button>
        )}
      </div>

      <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#F5F5F5' }}>
        {(['goals', 'allocation'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: activeTab === tab ? '#1E1E22' : 'transparent', color: activeTab === tab ? '#FFFFFF' : '#8C8C96' }}>
            {tab === 'goals' ? 'Goals' : 'Allocation Targets'}
          </button>
        ))}
      </div>

      {activeTab === 'goals' ? (
        <>
          {showForm && <GoalForm onAdd={handleAddGoal} onCancel={() => setShowForm(false)} />}
          {goals.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {goals.map(goal => <GoalCard key={goal.id} goal={goal} currentAmount={getCurrentAmount(goal, portfolios, totalValue)} onRemove={handleRemoveGoal} />)}
            </div>
          ) : !showForm && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(98,126,234,0.1)', border: '1px solid rgba(98,126,234,0.2)' }}>
                <Target size={28} style={{ color: '#627EEA' }} />
              </div>
              <h3 className="text-base font-semibold text-[#0A0A0A] mb-1">No goals yet</h3>
              <p className="text-sm max-w-xs" style={{ color: '#737373' }}>Set targets like "reach $50k in ETH" and track automatically.</p>
              <button onClick={() => setShowForm(true)} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#0A0A0A]" style={{ background: '#627EEA' }}>
                <Plus size={14} />Add first goal
              </button>
            </div>
          )}
        </>
      ) : (
        <AllocationManager targets={alloc} portfolios={portfolios} totalValue={totalValue} onChange={t => { setAlloc(t); saveAlloc(t) }} />
      )}
    </div>
  )
}
