import { useState, useMemo } from 'react'
import { ArrowUpRight, ArrowDownLeft, Check, Shield, ShoppingBag, Repeat2, ExternalLink } from 'lucide-react'
import { fmtUSD } from '../lib/formatters'
import { CHAINS, shortenAddress } from '../lib/chains'
import type { TrackedWallet, Transaction, TxType } from '../types'

interface Props {
  transactions: Transaction[]
  wallets: TrackedWallet[]
}

const TX_ICONS: Partial<Record<TxType, React.ComponentType<{ size?: number; className?: string }>>> = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  swap: Repeat2,
  approve: Check,
  nft_buy: ShoppingBag,
  contract: Shield,
}

const TX_COLORS: Partial<Record<TxType, string>> = {
  send: '#EF4444',
  receive: '#22C55E',
  swap: '#60A5FA',
  approve: '#F59E0B',
  nft_buy: '#EC4899',
  contract: '#4A4A52',
}

const TX_LABELS: Partial<Record<TxType, string>> = {
  send: 'Send',
  receive: 'Receive',
  swap: 'Swap',
  approve: 'Approve',
  nft_buy: 'NFT Buy',
  contract: 'Contract',
}

export function Transactions({ transactions, wallets }: Props) {
  const [filterType, setFilterType] = useState<string>('all')
  const [filterWallet, setFilterWallet] = useState<string>('all')

  const filtered = useMemo(() => {
    let list = [...transactions]
    if (filterType !== 'all') list = list.filter(t => t.type === filterType)
    if (filterWallet !== 'all') list = list.filter(t => t.walletId === filterWallet)
    return list.sort((a, b) => b.timestamp - a.timestamp)
  }, [transactions, filterType, filterWallet])

  const totalFees = filtered.reduce((s, t) => s + t.feeUsd, 0)

  function timeAgo(ts: number) {
    const d = (Date.now() - ts) / 1000
    if (d < 60) return `${Math.floor(d)}s ago`
    if (d < 3600) return `${Math.floor(d / 60)}m ago`
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-[#0A0A0A] font-serif">Transactions</h2>
          <p className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>
            {filtered.length} txs · {fmtUSD(totalFees)} in fees
          </p>
        </div>
      </div>

      {/* Mock data notice */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#F59E0B" strokeWidth="1.5"/><path d="M8 5v3.5M8 10.5v.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <span className="text-[11px] font-medium" style={{ color: '#92400E' }}>
          Real transaction history coming soon. Showing simulated data for preview.
        </span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
          style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#737373' }}>
          <option value="all">All Types</option>
          {(['send','receive','swap','approve','nft_buy','contract'] as TxType[]).map(t => (
            <option key={t} value={t}>{TX_LABELS[t as TxType]}</option>
          ))}
        </select>
        <select value={filterWallet} onChange={e => setFilterWallet(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
          style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#737373' }}>
          <option value="all">All Wallets</option>
          {wallets.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
        {/* Table header */}
        <div className="grid items-center px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider"
          style={{ color: '#A3A3A3', borderBottom: '1px solid #F0F0F0', gridTemplateColumns: '44px 1.5fr 0.8fr 0.8fr 0.8fr 1fr 24px' }}>
          <span />
          <span>Transaction</span>
          <span className="text-center">Token</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Value</span>
          <span className="text-right">Date</span>
          <span />
        </div>
        {filtered.length === 0 ? (
          <p className="text-xs text-center py-10" style={{ color: '#A3A3A3' }}>No transactions</p>
        ) : (
          <div className="divide-y" style={{ borderColor: '#F5F5F5' }}>
            {filtered.slice(0, 100).map(tx => {
              const IconComp = TX_ICONS[tx.type] ?? Shield
              const color = TX_COLORS[tx.type] ?? '#4A4A52'
              const wallet = wallets.find(w => w.id === tx.walletId)
              const chain = CHAINS[tx.chain]
              return (
                <div key={tx.hash} className="portfolio-row grid items-center px-4 py-3"
                  style={{ gridTemplateColumns: '44px 1.5fr 0.8fr 0.8fr 0.8fr 1fr 24px' }}>
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: color + '15', border: `1px solid ${color}30` }}>
                    <IconComp size={14} className="flex-shrink-0" style={{ color } as React.CSSProperties} />
                  </div>

                  {/* Type + hash */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#0A0A0A]">{TX_LABELS[tx.type]}</span>
                      <span className="text-[9px] px-1.5 rounded" style={{ background: chain.color + '22', color: chain.color }}>{chain.name}</span>
                      {wallet && (
                        <span className="text-[9px]" style={{ color: '#A3A3A3' }}>{wallet.label}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono" style={{ color: '#A3A3A3' }}>{shortenAddress(tx.hash, 10, 8)}</span>
                      <a href={`${chain.explorer}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                        <ExternalLink size={10} style={{ color: '#A3A3A3' }} />
                      </a>
                    </div>
                  </div>

                  {/* Token info */}
                  <div className="text-center">
                    {tx.type === 'swap' && tx.tokenSymbol && tx.toTokenSymbol ? (
                      <div className="text-xs" style={{ color: '#737373' }}>
                        <span style={{ color: '#EF4444' }}>{tx.tokenSymbol}</span>
                        <span style={{ color: '#A3A3A3' }}> &rarr; </span>
                        <span style={{ color: '#22C55E' }}>{tx.toTokenSymbol}</span>
                      </div>
                    ) : tx.tokenSymbol ? (
                      <p className="text-xs" style={{ color: '#737373' }}>{tx.tokenSymbol}</p>
                    ) : <span style={{ color: '#D4D4D4' }}>--</span>}
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    {tx.tokenAmount ? (
                      <p className="text-xs font-mono tabular-nums text-[#0A0A0A]">
                        {tx.tokenAmount < 0.001 ? tx.tokenAmount.toExponential(2) : tx.tokenAmount.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                      </p>
                    ) : <span className="text-xs" style={{ color: '#D4D4D4' }}>--</span>}
                  </div>

                  {/* Value */}
                  <div className="text-right">
                    <p className="text-xs font-mono tabular-nums text-[#0A0A0A]">{fmtUSD(tx.valueUsd)}</p>
                    <p className="text-[10px]" style={{ color: '#A3A3A3' }}>fee {fmtUSD(tx.feeUsd)}</p>
                  </div>

                  {/* Date */}
                  <div className="text-right">
                    <p className="text-[11px]" style={{ color: '#737373' }}>{timeAgo(tx.timestamp)}</p>
                  </div>

                  {/* Status */}
                  <div className="flex justify-center">
                    <div className="w-2 h-2 rounded-full" style={{ background: tx.status === 'confirmed' ? '#22C55E' : tx.status === 'pending' ? '#F59E0B' : '#EF4444' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Mobile card list */}
      <div className="md:hidden rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
        {filtered.length === 0 ? (
          <p className="text-xs text-center py-10" style={{ color: '#A3A3A3' }}>No transactions</p>
        ) : (
          <div className="divide-y" style={{ borderColor: '#F5F5F5' }}>
            {filtered.slice(0, 100).map(tx => {
              const IconComp = TX_ICONS[tx.type] ?? Shield
              const color = TX_COLORS[tx.type] ?? '#4A4A52'
              const wallet = wallets.find(w => w.id === tx.walletId)
              const chain = CHAINS[tx.chain]
              return (
                <div key={`m-${tx.hash}`} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: color + '15', border: `1px solid ${color}30` }}>
                    <IconComp size={14} className="flex-shrink-0" style={{ color } as React.CSSProperties} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#0A0A0A]">{TX_LABELS[tx.type]}</span>
                      <span className="text-[9px] px-1.5 rounded" style={{ background: chain.color + '22', color: chain.color }}>{chain.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {tx.type === 'swap' && tx.tokenSymbol && tx.toTokenSymbol ? (
                        <span className="text-[10px]" style={{ color: '#737373' }}>
                          <span style={{ color: '#EF4444' }}>{tx.tokenSymbol}</span> &rarr; <span style={{ color: '#22C55E' }}>{tx.toTokenSymbol}</span>
                        </span>
                      ) : tx.tokenSymbol ? (
                        <span className="text-[10px]" style={{ color: '#737373' }}>{tx.tokenSymbol}</span>
                      ) : null}
                      <span className="text-[10px]" style={{ color: '#A3A3A3' }}>&middot; {timeAgo(tx.timestamp)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-mono text-[#0A0A0A]">{fmtUSD(tx.valueUsd)}</p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: tx.status === 'confirmed' ? '#22C55E' : tx.status === 'pending' ? '#F59E0B' : '#EF4444' }} />
                      <a href={`${chain.explorer}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={10} style={{ color: '#A3A3A3' }} />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
