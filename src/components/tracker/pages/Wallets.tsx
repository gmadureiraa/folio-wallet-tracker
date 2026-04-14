import { useState, useMemo } from 'react'
import { Plus, Trash2, Edit2, ExternalLink, Check, X, Copy, Loader2, Shield } from 'lucide-react'
import { fmtUSD, fmtPct, pctClass } from '../lib/formatters'
import { CHAINS, CHAIN_LIST } from '../lib/chains'
import type { TrackedWallet, WalletPortfolio, ChainId } from '../types'
import { isValidAddress } from '../lib/realPortfolio'

interface Props {
  wallets: TrackedWallet[]
  portfolios: WalletPortfolio[]
  onAdd: (address: string, label: string, chain: ChainId) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, updates: Partial<Pick<TrackedWallet, 'label' | 'chain'>>) => void
  addOpen: boolean
  onAddOpenChange: (v: boolean) => void
}

const CARD_STYLE = { background: '#FFFFFF', border: '1px solid #E5E5E5' }

// All EVM chains for scanning display
const EVM_CHAINS: ChainId[] = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism', 'base', 'linea', 'scroll', 'zksync', 'avalanche', 'fantom', 'gnosis', 'mantle', 'cronos', 'celo']

function ScanningAnimation() {
  return (
    <div className="rounded-xl p-5 mb-5" style={CARD_STYLE}>
      <div className="flex items-center gap-3 mb-4">
        <Loader2 size={16} className="spin" style={{ color: '#627EEA' }} />
        <div>
          <p className="text-sm font-semibold text-[#0A0A0A]">Scanning 16 chains...</p>
          <p className="text-[10px]" style={{ color: '#A3A3A3' }}>Checking balances across all supported networks</p>
        </div>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {[...EVM_CHAINS, 'solana' as ChainId].map((chain, i) => {
          const c = CHAINS[chain]
          return (
            <div
              key={chain}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg scan-dot"
              style={{
                background: c.color + '08',
                border: `1px solid ${c.color}22`,
                animationDelay: `${i * 150}ms`,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
              <span className="text-[9px] font-medium truncate" style={{ color: c.color }}>{c.name}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: '#F0F0F0' }}>
        <div className="h-full rounded-full chain-scan-bar" style={{ background: 'linear-gradient(90deg, #627EEA, #22C55E)' }} />
      </div>
    </div>
  )
}

function AddWalletForm({ onAdd, onClose }: { onAdd: Props['onAdd']; onClose: () => void }) {
  const [address, setAddress] = useState('')
  const [label, setLabel] = useState('')
  const [chain, setChain] = useState<ChainId>('ethereum')
  const [err, setErr] = useState('')
  const [scanning, setScanning] = useState(false)

  function submit() {
    const addr = address.trim()
    if (!addr) { setErr('Enter a wallet address'); return }
    if (!isValidAddress(addr, chain)) {
      setErr(chain === 'solana' ? 'Invalid Solana address' : 'Invalid EVM address (must start with 0x)')
      return
    }
    setScanning(true)
    // Small delay to show animation
    setTimeout(() => {
      onAdd(addr, label || `Wallet ${addr.slice(0, 6)}`, chain)
      setScanning(false)
      onClose()
    }, 800)
  }

  const inputStyle = {
    background: '#F5F5F5',
    border: '1px solid #E5E5E5',
    borderRadius: 8,
    color: '#0A0A0A',
    outline: 'none',
    fontSize: 13,
    padding: '8px 12px',
    width: '100%',
  }

  if (scanning) return <ScanningAnimation />

  return (
    <div className="rounded-xl p-5 mb-5" style={CARD_STYLE}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(98,126,234,0.15), rgba(34,197,94,0.15))', border: '1px solid rgba(98,126,234,0.2)' }}>
            <Shield size={14} style={{ color: '#627EEA' }} />
          </div>
          <h3 className="text-sm font-semibold text-[#0A0A0A]">Add Wallet</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[#F5F5F5] transition-colors">
          <X size={15} style={{ color: '#A3A3A3' }} />
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs mb-1.5 block font-medium" style={{ color: '#737373' }}>Wallet Address</label>
          <input
            value={address}
            onChange={e => { setAddress(e.target.value); setErr('') }}
            placeholder="0x... or Solana address"
            style={inputStyle}
            className="focus:border-[#627EEA] transition-colors"
          />
        </div>
        <div>
          <label className="text-xs mb-1.5 block font-medium" style={{ color: '#737373' }}>Label (optional)</label>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="My main wallet"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="text-xs mb-1.5 block font-medium" style={{ color: '#737373' }}>Chain</label>
          <select
            value={chain}
            onChange={e => setChain(e.target.value as ChainId)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {CHAIN_LIST.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <p className="text-[10px] mt-1" style={{ color: '#A3A3A3' }}>
            EVM wallets are auto-scanned across all 15 EVM chains
          </p>
        </div>
        {err && <p className="text-xs font-medium" style={{ color: '#EF4444' }}>{err}</p>}
        <div className="flex gap-2 pt-1">
          <button
            onClick={submit}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: '#0A0A0A', color: '#FFFFFF', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#262626' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0A0A0A' }}
          >
            <Plus size={13} />
            Add & Scan All Chains
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs transition-colors hover:bg-[#F5F5F5]" style={{ color: '#737373' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// Chain indicators showing which chains have funds
function ChainIndicators({ portfolio }: { portfolio?: WalletPortfolio }) {
  if (!portfolio) return null

  // Parse funded chains from the portfolio tokens
  const fundedChains = new Set(portfolio.tokens.map(t => t.chain))

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {[...EVM_CHAINS, 'solana' as ChainId].map(chain => {
        const c = CHAINS[chain]
        const hasFunds = fundedChains.has(chain)
        return (
          <span
            key={chain}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold transition-all ${hasFunds ? 'chain-dot-funded' : ''}`}
            style={{
              background: hasFunds ? c.color + '22' : '#F5F5F5',
              color: hasFunds ? c.color : '#D4D4D4',
              border: hasFunds ? `1.5px solid ${c.color}44` : '1px solid #E5E5E5',
            }}
            title={`${c.name}${hasFunds ? ' - Has funds' : ' - Empty'}`}
          >
            {c.name.slice(0, 1)}
          </span>
        )
      })}
    </div>
  )
}

export function Wallets({ wallets, portfolios, onAdd, onRemove, onUpdate, addOpen, onAddOpenChange }: Props) {
  const [editing, setEditing] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  function startEdit(w: TrackedWallet) {
    setEditing(w.id)
    setEditLabel(w.label)
  }

  function saveEdit(id: string) {
    onUpdate(id, { label: editLabel })
    setEditing(null)
  }

  function copyAddress(addr: string) {
    navigator.clipboard.writeText(addr).catch(() => {})
    setCopied(addr)
    setTimeout(() => setCopied(null), 2000)
  }

  const totalValue = portfolios.reduce((s, p) => s + p.totalValueUsd, 0)

  // Sort wallets by value
  const sortedWallets = useMemo(() => {
    return [...wallets].sort((a, b) => {
      const aVal = portfolios.find(p => p.walletId === a.id)?.totalValueUsd ?? 0
      const bVal = portfolios.find(p => p.walletId === b.id)?.totalValueUsd ?? 0
      return bVal - aVal
    })
  }, [wallets, portfolios])

  return (
    <div className="p-6 page-enter">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-[#0A0A0A] font-serif">Wallets</h2>
          <p className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>
            {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} · {fmtUSD(totalValue)} total across 16 chains
          </p>
        </div>
        {!addOpen && (
          <button
            onClick={() => onAddOpenChange(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: '#0A0A0A', color: '#FFFFFF', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#262626' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0A0A0A' }}
          >
            <Plus size={13} /> Add Wallet
          </button>
        )}
      </div>

      {addOpen && <AddWalletForm onAdd={onAdd} onClose={() => onAddOpenChange(false)} />}

      {wallets.length === 0 && !addOpen ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(98,126,234,0.1), rgba(34,197,94,0.1))', border: '1px solid rgba(98,126,234,0.15)' }}>
            <Shield size={24} style={{ color: '#627EEA' }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: '#0A0A0A' }}>No wallets tracked yet</p>
          <p className="text-xs mb-4" style={{ color: '#A3A3A3' }}>Add your first wallet to start tracking across 16 chains</p>
          <button
            onClick={() => onAddOpenChange(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: '#0A0A0A', color: '#FFFFFF', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#262626' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0A0A0A' }}
          >
            <Plus size={14} /> Add Your First Wallet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedWallets.map(w => {
            const p = portfolios.find(x => x.walletId === w.id)
            const chain = CHAINS[w.chain]
            const walletValue = p?.totalValueUsd ?? 0
            const valuePct = totalValue > 0 ? (walletValue / totalValue) * 100 : 0

            return (
              <div key={w.id} className="wallet-card rounded-xl p-4" style={CARD_STYLE}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ background: `linear-gradient(135deg, ${w.color}22, ${w.color}11)`, border: `1.5px solid ${w.color}33`, color: w.color }}>
                      {w.label.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      {editing === w.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            value={editLabel}
                            onChange={e => setEditLabel(e.target.value)}
                            className="text-sm font-semibold text-[#0A0A0A] rounded px-1.5 py-0.5"
                            style={{ background: '#F0F0F0', border: '1px solid #E5E5E5', outline: 'none' }}
                            onKeyDown={e => e.key === 'Enter' && saveEdit(w.id)}
                            autoFocus
                          />
                          <button onClick={() => saveEdit(w.id)}><Check size={12} style={{ color: '#22C55E' }} /></button>
                          <button onClick={() => setEditing(null)}><X size={12} style={{ color: '#EF4444' }} /></button>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-[#0A0A0A]">{w.label}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: chain.color + '15', color: chain.color }}>
                          {chain.name}
                        </span>
                        <span className="text-[10px]" style={{ color: '#A3A3A3' }}>
                          {p?.tokens.length ?? 0} tokens
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => startEdit(w)} title="Rename"
                      className="p-1.5 rounded transition-colors hover:bg-[#F5F5F5]" style={{ color: '#A3A3A3' }}>
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => onRemove(w.id)} title="Remove"
                      className="p-1.5 rounded transition-colors hover:bg-[#FEF2F2]" style={{ color: '#A3A3A3' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-1.5 mb-3 px-2.5 py-2 rounded-lg" style={{ background: '#FAFAFA', border: '1px solid #F0F0F0' }}>
                  <span className="text-[10px] font-mono flex-1 truncate tabular-nums" style={{ color: '#737373' }}>{w.address}</span>
                  <button onClick={() => copyAddress(w.address)} className="flex-shrink-0 p-0.5 rounded hover:bg-[#F0F0F0] transition-colors" title="Copy">
                    {copied === w.address ? <Check size={11} style={{ color: '#22C55E' }} /> : <Copy size={11} style={{ color: '#A3A3A3' }} />}
                  </button>
                  <a href={`${chain.explorer}/address/${w.address}`} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 p-0.5 rounded hover:bg-[#F0F0F0] transition-colors">
                    <ExternalLink size={11} style={{ color: '#A3A3A3' }} />
                  </a>
                </div>

                {/* Value */}
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-[10px] mb-0.5" style={{ color: '#A3A3A3' }}>Total Value</p>
                    <p className="text-xl font-bold font-mono tabular-nums text-[#0A0A0A]">{fmtUSD(walletValue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] mb-0.5" style={{ color: '#A3A3A3' }}>24h Change</p>
                    <p className={`text-sm font-mono tabular-nums font-semibold ${pctClass(p?.change24hPct ?? 0)}`}>
                      {(p?.change24hPct ?? 0) >= 0 ? '+' : ''}{fmtPct(p?.change24hPct ?? 0)}
                    </p>
                  </div>
                </div>

                {/* Allocation bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px]" style={{ color: '#A3A3A3' }}>Portfolio share</span>
                    <span className="text-[10px] font-mono tabular-nums font-medium" style={{ color: '#737373' }}>{valuePct.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F0F0F0' }}>
                    <div className="h-full rounded-full bar-animate" style={{ width: `${valuePct}%`, background: w.color }} />
                  </div>
                </div>

                {/* Chain indicators */}
                <div className="pt-3" style={{ borderTop: '1px solid #F0F0F0' }}>
                  <p className="text-[9px] font-medium uppercase tracking-wider mb-1.5" style={{ color: '#A3A3A3' }}>Chains with funds</p>
                  <ChainIndicators portfolio={p} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
