import { useState, useMemo } from 'react'
import { Eye, EyeOff, ExternalLink, Plus, Activity } from 'lucide-react'
import { fmtUSD } from '../lib/formatters'
import { CHAINS, shortenAddress } from '../lib/chains'
import type { WhaleWallet, ChainId } from '../types'

const WHALE_KEY = 'wallet-tracker-whales'

// Famous whale wallets (public info)
const DEFAULT_WHALES: WhaleWallet[] = [
  {
    id: '1', address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', label: 'vitalik.eth',
    chain: 'ethereum', tags: ['founder', 'eth'],
    totalValueUsd: 1_200_000_000,
    topHoldings: [{ symbol: 'ETH', valueUsd: 800_000_000, pct: 67 }, { symbol: 'USDC', valueUsd: 200_000_000, pct: 17 }],
    txCount30d: 12, lastActive: Date.now() - 2 * 86400 * 1000, isFollowing: false, color: '#627EEA',
  },
  {
    id: '2', address: '0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296', label: 'Justin Sun',
    chain: 'ethereum', tags: ['exchange', 'tron'],
    totalValueUsd: 4_500_000_000,
    topHoldings: [{ symbol: 'USDT', valueUsd: 2_000_000_000, pct: 44 }, { symbol: 'TRX', valueUsd: 1_000_000_000, pct: 22 }],
    txCount30d: 45, lastActive: Date.now() - 6 * 3600 * 1000, isFollowing: false, color: '#EF4444',
  },
  {
    id: '3', address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', label: 'SOL Whale',
    chain: 'solana', tags: ['defi', 'sol'],
    totalValueUsd: 85_000_000,
    topHoldings: [{ symbol: 'SOL', valueUsd: 50_000_000, pct: 59 }, { symbol: 'JUP', valueUsd: 15_000_000, pct: 18 }],
    txCount30d: 88, lastActive: Date.now() - 1 * 3600 * 1000, isFollowing: false, color: '#9945FF',
  },
  {
    id: '4', address: '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503', label: 'Binance Hot Wallet',
    chain: 'ethereum', tags: ['exchange', 'cex'],
    totalValueUsd: 15_000_000_000,
    topHoldings: [{ symbol: 'ETH', valueUsd: 6_000_000_000, pct: 40 }, { symbol: 'BNB', valueUsd: 3_000_000_000, pct: 20 }],
    txCount30d: 1240, lastActive: Date.now() - 5 * 60 * 1000, isFollowing: false, color: '#F3BA2F',
  },
  {
    id: '5', address: '0x28C6c06298d514Db089934071355E5743bf21d60', label: 'Binance Wallet 2',
    chain: 'ethereum', tags: ['exchange', 'cex'],
    totalValueUsd: 8_200_000_000,
    topHoldings: [{ symbol: 'USDT', valueUsd: 4_000_000_000, pct: 49 }, { symbol: 'ETH', valueUsd: 2_000_000_000, pct: 24 }],
    txCount30d: 890, lastActive: Date.now() - 15 * 60 * 1000, isFollowing: false, color: '#F59E0B',
  },
  {
    id: '6', address: '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8', label: 'Kraken 7',
    chain: 'ethereum', tags: ['exchange', 'cex'],
    totalValueUsd: 6_100_000_000,
    topHoldings: [{ symbol: 'ETH', valueUsd: 3_000_000_000, pct: 49 }, { symbol: 'USDC', valueUsd: 1_500_000_000, pct: 25 }],
    txCount30d: 560, lastActive: Date.now() - 45 * 60 * 1000, isFollowing: false, color: '#8B5CF6',
  },
]

function loadState(): { whales: WhaleWallet[]; following: Set<string> } {
  try {
    const raw = localStorage.getItem(WHALE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      return { whales: data.whales ?? DEFAULT_WHALES, following: new Set(data.following ?? []) }
    }
  } catch {}
  return { whales: DEFAULT_WHALES, following: new Set() }
}

function saveState(whales: WhaleWallet[], following: Set<string>) {
  try { localStorage.setItem(WHALE_KEY, JSON.stringify({ whales, following: [...following] })) } catch {}
}

function timeAgo(ts: number) {
  const d = (Date.now() - ts) / 1000
  if (d < 60) return `${Math.floor(d)}s ago`
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  return `${Math.floor(d / 86400)}d ago`
}

export function WhaleTracker() {
  const init = loadState()
  const [whales, setWhales] = useState<WhaleWallet[]>(init.whales)
  const [following, setFollowing] = useState<Set<string>>(init.following)
  const [filterChain, setFilterChain] = useState<string>('all')
  const [filterTag, setFilterTag] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAddr, setNewAddr] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newChain, setNewChain] = useState<ChainId>('ethereum')

  const filtered = useMemo(() => {
    let list = [...whales]
    if (filterChain !== 'all') list = list.filter(w => w.chain === filterChain)
    if (filterTag !== 'all') list = list.filter(w => w.tags.includes(filterTag))
    return list.sort((a, b) => b.totalValueUsd - a.totalValueUsd)
  }, [whales, filterChain, filterTag])

  const allTags = [...new Set(whales.flatMap(w => w.tags))]

  function toggleFollow(id: string) {
    const next = new Set(following)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setFollowing(next)
    saveState(whales, next)
  }

  function addCustomWhale() {
    if (!newAddr.trim()) return
    const w: WhaleWallet = {
      id: Date.now().toString(),
      address: newAddr.trim(),
      label: newLabel.trim() || shortenAddress(newAddr.trim()),
      chain: newChain,
      tags: ['custom'],
      totalValueUsd: 0,
      topHoldings: [],
      txCount30d: 0,
      lastActive: Date.now(),
      isFollowing: true,
      color: '#22C55E',
    }
    const next = [...whales, w]
    const nextFollowing = new Set([...following, w.id])
    setWhales(next)
    setFollowing(nextFollowing)
    saveState(next, nextFollowing)
    setShowAddForm(false)
    setNewAddr('')
    setNewLabel('')
  }

  const inputStyle = {
    background: '#F5F5F5', border: '1px solid #E5E5E5',
    borderRadius: 8, color: '#0A0A0A', outline: 'none', fontSize: 13,
    padding: '8px 12px',
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-[#0A0A0A] font-serif">Whale Tracker</h2>
          <p className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>
            {following.size} following · {whales.length} known whales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterChain} onChange={e => setFilterChain(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
            style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#737373' }}>
            <option value="all">All Chains</option>
            {[...new Set(whales.map(w => w.chain))].map(c => (
              <option key={c} value={c}>{CHAINS[c]?.name ?? c}</option>
            ))}
          </select>
          <select value={filterTag} onChange={e => setFilterTag(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
            style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#737373' }}>
            <option value="all">All Tags</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={() => setShowAddForm(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
            style={{ background: '#F0F0F0', border: '1px solid #D4D4D4', color: '#0A0A0A' }}>
            <Plus size={13} /> Track Wallet
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="rounded-xl p-4 mb-5 grid grid-cols-1 md:grid-cols-4 gap-3" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
          <input value={newAddr} onChange={e => setNewAddr(e.target.value)} placeholder="Wallet address" style={{ ...inputStyle, flex: 1 }} />
          <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Label (optional)" style={inputStyle} />
          <select value={newChain} onChange={e => setNewChain(e.target.value as ChainId)} style={{ ...inputStyle, cursor: 'pointer' }}>
            {Object.values(CHAINS).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={addCustomWhale} className="flex-1 px-3 py-2 rounded-lg text-xs font-medium"
              style={{ background: '#E5E5E5', border: '1px solid #E5E5E5', color: '#0A0A0A' }}>
              Add
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-3 py-2 rounded-lg text-xs" style={{ color: '#737373' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Whale list */}
      <div className="space-y-3">
        {filtered.map(whale => {
          const chain = CHAINS[whale.chain as ChainId]
          const isFollowed = following.has(whale.id)

          return (
            <div key={whale.id} className="rounded-xl p-4"
              style={{ background: '#FFFFFF', border: `1px solid ${isFollowed ? 'rgba(34,197,94,0.2)' : '#E5E5E5'}` }}>
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: whale.color + '22', border: `1px solid ${whale.color}44`, color: whale.color }}>
                  {whale.label.slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#0A0A0A]">{whale.label}</span>
                    <span className="text-[9px] px-1.5 rounded" style={{ background: chain.color + '22', color: chain.color }}>{chain.name}</span>
                    {whale.tags.map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: '#F0F0F0', color: '#A3A3A3' }}>{t}</span>
                    ))}
                    {isFollowed && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>following</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <a href={`${chain.explorer}/address/${whale.address}`} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-mono flex items-center gap-1" style={{ color: '#A3A3A3' }}>
                      {shortenAddress(whale.address, 10, 8)}
                      <ExternalLink size={9} />
                    </a>
                    <span style={{ color: '#A3A3A3' }}>·</span>
                    <span className="text-[10px] flex items-center gap-1" style={{ color: '#A3A3A3' }}>
                      <Activity size={9} />
                      {whale.txCount30d} txs / 30d
                    </span>
                    <span style={{ color: '#A3A3A3' }}>·</span>
                    <span className="text-[10px]" style={{ color: '#A3A3A3' }}>Active {timeAgo(whale.lastActive)}</span>
                  </div>
                </div>

                {/* Value */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold font-mono text-[#0A0A0A]">{fmtUSD(whale.totalValueUsd, true)}</p>
                  <p className="text-[10px]" style={{ color: '#A3A3A3' }}>Portfolio Value</p>
                </div>

                {/* Follow button */}
                <button onClick={() => toggleFollow(whale.id)}
                  className="p-2 rounded-lg transition-colors flex-shrink-0"
                  style={{
                    background: isFollowed ? 'rgba(34,197,94,0.1)' : '#F5F5F5',
                    border: isFollowed ? '1px solid rgba(34,197,94,0.3)' : '1px solid #E5E5E5',
                    color: isFollowed ? '#22C55E' : '#4A4A52',
                  }}
                  title={isFollowed ? 'Unfollow' : 'Follow'}>
                  {isFollowed ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>

              {/* Holdings */}
              {whale.topHoldings.length > 0 && (
                <div className="mt-3 pt-3 flex items-center gap-2 flex-wrap" style={{ borderTop: '1px solid #F0F0F0' }}>
                  <span className="text-[10px]" style={{ color: '#A3A3A3' }}>Top holdings:</span>
                  {whale.topHoldings.map((h: { symbol: string; valueUsd: number; pct: number }) => (
                    <div key={h.symbol} className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: '#F5F5F5' }}>
                      <span className="text-[10px] font-semibold text-[#0A0A0A]">{h.symbol}</span>
                      <span className="text-[9px]" style={{ color: '#A3A3A3' }}>{h.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
