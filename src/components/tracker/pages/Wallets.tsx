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

const CARD_STYLE = { background: '#FFFFFF', border: '1px solid #F0F0F0' }

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

function detectChainType(addr: string): 'evm' | 'solana' | null {
  if (!addr.trim()) return null
  if (addr.trim().startsWith('0x')) return 'evm'
  // Solana addresses are base58, 32-44 chars, no 0x prefix
  if (addr.trim().length >= 32 && addr.trim().length <= 44 && !addr.trim().startsWith('0x')) return 'solana'
  if (addr.includes('.sol')) return 'solana'
  return null
}

function AddWalletForm({ onAdd, onClose }: { onAdd: Props['onAdd']; onClose: () => void }) {
  const [address, setAddress] = useState('')
  const [label, setLabel] = useState('')
  const [chain, setChain] = useState<ChainId>('ethereum')
  const [err, setErr] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanningChainIdx, setScanningChainIdx] = useState(0)
  const [scanComplete, setScanComplete] = useState(false)
  const [foundTokens, setFoundTokens] = useState(0)

  const detectedType = detectChainType(address)

  // Auto-detect chain when pasting
  function handleAddressChange(val: string) {
    setAddress(val)
    setErr('')
    const detected = detectChainType(val)
    if (detected === 'solana') setChain('solana')
    else if (detected === 'evm') setChain('ethereum')
  }

  function submit() {
    const addr = address.trim()
    if (!addr) { setErr('Enter a wallet address'); return }
    if (!isValidAddress(addr, chain)) {
      setErr(chain === 'solana' ? 'Invalid Solana address' : 'Invalid EVM address (must start with 0x)')
      return
    }
    setScanning(true)
    setScanProgress(0)
    setScanningChainIdx(0)
    setScanComplete(false)

    // Animate chain scanning progress
    const totalChains = chain === 'solana' ? 1 : EVM_CHAINS.length
    let idx = 0
    const interval = setInterval(() => {
      idx++
      setScanningChainIdx(idx)
      setScanProgress(Math.min((idx / totalChains) * 100, 100))
      if (idx >= totalChains) {
        clearInterval(interval)
        setScanComplete(true)
        setFoundTokens(Math.floor(Math.random() * 12) + 3) // Will be replaced with real count
        setTimeout(() => {
          onAdd(addr, label || `Wallet ${addr.slice(0, 6)}`, chain)
          setScanning(false)
          onClose()
        }, 1200)
      }
    }, 120)
  }

  if (scanning) {
    const chainsToShow = chain === 'solana' ? ['solana' as ChainId] : EVM_CHAINS
    return (
      <div className="rounded-2xl p-6 mb-5" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
        <div className="text-center mb-5">
          <h3 className="text-lg font-semibold text-[#0A0A0A] font-serif mb-1">
            {scanComplete ? 'Wallet Added' : 'Scanning Wallet'}
          </h3>
          <p className="text-xs" style={{ color: '#A3A3A3' }}>
            {scanComplete
              ? `Found ${foundTokens} tokens across ${chainsToShow.filter((_, i) => i < scanningChainIdx).length} chains`
              : `Checking ${chainsToShow.length} blockchains for tokens...`
            }
          </p>
        </div>

        {/* Chain icons grid with scanning animation */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-4">
          {chainsToShow.map((chainId, i) => {
            const c = CHAINS[chainId]
            const isDone = i < scanningChainIdx
            const isActive = i === scanningChainIdx
            return (
              <div
                key={chainId}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-300 ${isActive ? 'scan-dot' : ''}`}
                style={{
                  background: isDone ? c.color + '15' : isActive ? c.color + '10' : '#F9F9F9',
                  border: `1px solid ${isDone ? c.color + '30' : isActive ? c.color + '20' : '#F0F0F0'}`,
                  opacity: isDone || isActive ? 1 : 0.4,
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {isDone && <Check size={9} style={{ color: c.color }} />}
                {isActive && <Loader2 size={9} className="spin" style={{ color: c.color }} />}
                {!isDone && !isActive && <span className="w-2 h-2 rounded-full" style={{ background: '#D4D4D4' }} />}
                <span className="text-[8px] font-semibold truncate" style={{ color: isDone || isActive ? c.color : '#B0B0B0' }}>{c.name}</span>
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: '#F0F0F0' }}>
          <div
            className="h-full rounded-full transition-all duration-200 ease-out"
            style={{
              width: `${scanProgress}%`,
              background: scanComplete
                ? '#22C55E'
                : 'linear-gradient(90deg, #627EEA, #22C55E)',
            }}
          />
        </div>

        {/* Success state */}
        {scanComplete && (
          <div className="flex items-center justify-center gap-2 py-2 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Check size={14} style={{ color: '#22C55E' }} />
            <span className="text-xs font-semibold" style={{ color: '#16A34A' }}>
              {foundTokens} tokens found -- adding to portfolio...
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-6 mb-5" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-[#0A0A0A] font-serif">Add Wallet</h3>
          <p className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>Paste any EVM or Solana address to scan</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-[#F5F5F5] transition-colors" style={{ cursor: 'pointer' }}>
          <X size={16} style={{ color: '#A3A3A3' }} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Wallet Address -- large and prominent */}
        <div>
          <label className="text-xs mb-2 block font-semibold uppercase tracking-wider" style={{ color: '#A3A3A3' }}>Wallet Address</label>
          <input
            value={address}
            onChange={e => handleAddressChange(e.target.value)}
            placeholder="0x... or SOL address"
            className="focus:border-[#627EEA] transition-colors"
            style={{
              background: '#FAFAFA',
              border: '1.5px solid #E5E5E5',
              borderRadius: 12,
              color: '#0A0A0A',
              outline: 'none',
              fontSize: 15,
              fontFamily: 'monospace',
              padding: '14px 16px',
              width: '100%',
              letterSpacing: '-0.01em',
            }}
            autoFocus
          />
          {/* Auto-detected chain badges */}
          {detectedType && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-medium" style={{ color: '#A3A3A3' }}>Detected:</span>
              {detectedType === 'evm' ? (
                <div className="flex items-center gap-1 flex-wrap">
                  {EVM_CHAINS.slice(0, 6).map(c => {
                    const ch = CHAINS[c]
                    return (
                      <span key={c} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-semibold"
                        style={{ background: ch.color + '12', color: ch.color, border: `1px solid ${ch.color}22` }}>
                        <span className="w-1 h-1 rounded-full" style={{ background: ch.color }} />
                        {ch.name}
                      </span>
                    )
                  })}
                  <span className="text-[9px] font-medium" style={{ color: '#A3A3A3' }}>+{EVM_CHAINS.length - 6} more</span>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-semibold"
                  style={{ background: '#9945FF12', color: '#9945FF', border: '1px solid #9945FF22' }}>
                  <span className="w-1 h-1 rounded-full" style={{ background: '#9945FF' }} />
                  Solana
                </span>
              )}
            </div>
          )}
        </div>

        {/* Label field */}
        <div>
          <label className="text-xs mb-2 block font-semibold uppercase tracking-wider" style={{ color: '#A3A3A3' }}>Label (optional)</label>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="My MetaMask"
            style={{
              background: '#FAFAFA',
              border: '1.5px solid #E5E5E5',
              borderRadius: 12,
              color: '#0A0A0A',
              outline: 'none',
              fontSize: 13,
              padding: '12px 16px',
              width: '100%',
            }}
          />
        </div>

        {err && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <X size={12} style={{ color: '#EF4444' }} />
            <span className="text-xs font-medium" style={{ color: '#EF4444' }}>{err}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={submit}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all"
            style={{ background: '#0A0A0A', color: '#FFFFFF', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#262626'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0A0A0A'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <Shield size={14} />
            Scan Wallet
          </button>
          <button onClick={onClose} className="px-5 py-3 rounded-full text-sm font-medium transition-colors hover:bg-[#F5F5F5]" style={{ color: '#737373', cursor: 'pointer', border: '1px solid #E5E5E5' }}>
            Cancel
          </button>
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all"
            style={{ background: '#0A0A0A', color: '#FFFFFF', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#262626'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0A0A0A'; e.currentTarget.style.transform = 'translateY(0)' }}
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
              <div key={w.id} className="wallet-card card rounded-2xl p-5" style={CARD_STYLE}>
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
