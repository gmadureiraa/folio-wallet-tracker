import { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronUp, Layers, Grid3X3, List } from 'lucide-react'
import { fmtUSD, pctClass } from '../lib/formatters'
import { CHAINS } from '../lib/chains'
import { TokenPriceChart } from '../components/TokenPriceChart'
import type { TrackedWallet, WalletPortfolio, TokenPosition, ChainId } from '../types'

// CoinGecko ID mapping
const SYMBOL_TO_CG: Record<string, string> = {
  ETH: 'ethereum', WETH: 'ethereum', BTC: 'bitcoin', WBTC: 'wrapped-bitcoin',
  SOL: 'solana', BNB: 'binancecoin', AVAX: 'avalanche-2', POL: 'matic-network',
  MATIC: 'matic-network', OP: 'optimism', ARB: 'arbitrum', LINK: 'chainlink',
  UNI: 'uniswap', AAVE: 'aave', MNT: 'mantle', FTM: 'fantom', CRO: 'crypto-com-chain',
  CELO: 'celo', USDC: 'usd-coin', USDT: 'tether', DAI: 'dai',
  GMX: 'gmx', PENDLE: 'pendle', PEPE: 'pepe', LDO: 'lido-dao',
  stETH: 'staked-ether', wstETH: 'wrapped-steth', cbETH: 'coinbase-wrapped-staked-eth',
  rETH: 'rocket-pool-eth', RAY: 'raydium', JUP: 'jupiter-exchange-solana',
  BONK: 'bonk', CAKE: 'pancakeswap-token', JOE: 'joe', AERO: 'aerodrome-finance',
}

function getCgId(t: { id?: string; symbol: string }): string {
  return SYMBOL_TO_CG[t.symbol] || t.id || t.symbol.toLowerCase()
}

// Chain icon emoji fallback (small colored dot with chain initial)
function ChainBadge({ chain }: { chain: ChainId }) {
  const c = CHAINS[chain]
  if (!c) return null
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[7px] font-bold flex-shrink-0"
      style={{ background: c.color + '22', color: c.color, border: `1px solid ${c.color}33` }}
      title={c.name}
    >
      {c.name.slice(0, 1)}
    </span>
  )
}

interface Props {
  wallets: TrackedWallet[]
  portfolios: WalletPortfolio[]
}

type SortKey = 'value' | 'change24h' | 'balance' | 'pnl' | 'price'
type ViewMode = 'flat' | 'grouped'

export function Portfolio({ wallets, portfolios }: Props) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('value')
  const [sortAsc, setSortAsc] = useState(false)
  const [filterChain, setFilterChain] = useState<string>('all')
  const [filterWallet, setFilterWallet] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('flat')

  const allTokens = useMemo<(TokenPosition & { walletLabel: string; walletColor: string })[]>(() =>
    portfolios.flatMap(p => {
      const w = wallets.find(x => x.id === p.walletId)
      return p.tokens.map(t => ({ ...t, walletLabel: w?.label ?? 'Unknown', walletColor: w?.color ?? '#555' }))
    }),
    [portfolios, wallets]
  )

  const filtered = useMemo(() => {
    let list = allTokens
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(t => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q))
    }
    if (filterChain !== 'all') list = list.filter(t => t.chain === filterChain)
    if (filterWallet !== 'all') list = list.filter(t => t.walletId === filterWallet)

    return [...list].sort((a, b) => {
      let diff = 0
      if (sortKey === 'value') diff = b.valueUsd - a.valueUsd
      else if (sortKey === 'change24h') diff = b.priceChange24h - a.priceChange24h
      else if (sortKey === 'balance') diff = b.balance - a.balance
      else if (sortKey === 'pnl') diff = b.pnlUsd - a.pnlUsd
      else if (sortKey === 'price') diff = b.priceUsd - a.priceUsd
      return sortAsc ? -diff : diff
    })
  }, [allTokens, search, sortKey, sortAsc, filterChain, filterWallet])

  const totalValue = filtered.reduce((s, t) => s + t.valueUsd, 0)
  const totalPnl = filtered.reduce((s, t) => s + t.pnlUsd, 0)
  const totalCostBasis = filtered.reduce((s, t) => s + t.costBasis, 0)

  // Chain distribution for the bar
  const chainBreakdown = useMemo(() => {
    const map = new Map<ChainId, number>()
    for (const t of filtered) {
      map.set(t.chain, (map.get(t.chain) ?? 0) + t.valueUsd)
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([chain, value]) => ({ chain, value, pct: totalValue > 0 ? (value / totalValue) * 100 : 0 }))
  }, [filtered, totalValue])

  // Grouped by chain
  const groupedByChain = useMemo(() => {
    if (viewMode !== 'grouped') return null
    const map = new Map<ChainId, typeof filtered>()
    for (const t of filtered) {
      if (!map.has(t.chain)) map.set(t.chain, [])
      map.get(t.chain)!.push(t)
    }
    return [...map.entries()].sort((a, b) => {
      const aVal = a[1].reduce((s, t) => s + t.valueUsd, 0)
      const bVal = b[1].reduce((s, t) => s + t.valueUsd, 0)
      return bVal - aVal
    })
  }, [filtered, viewMode])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(v => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronDown size={11} style={{ color: '#A3A3A3' }} />
    return sortAsc ? <ChevronUp size={11} style={{ color: '#0A0A0A' }} /> : <ChevronDown size={11} style={{ color: '#0A0A0A' }} />
  }

  const uniqueChains = [...new Set(allTokens.map(t => t.chain))]

  // Mobile card layout for a single token
  function renderTokenCard(t: (typeof filtered)[0], i: number) {
    const chainColor = CHAINS[t.chain]?.color ?? '#555'
    return (
      <div key={`card-${t.id}-${t.walletId}-${i}`} className="portfolio-row p-4 md:hidden" style={{ borderBottom: '1px solid #F5F5F5' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-shrink-0">
            {t.logo ? (
              <img src={t.logo} alt={t.symbol} className="w-9 h-9 rounded-full"
                onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${t.symbol}&size=36&background=F0F0F0&color=737373&bold=true&font-size=0.4` }} />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: '#F0F0F0', color: '#737373' }}>{t.symbol.slice(0, 2)}</div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold border-2 border-white"
              style={{ background: chainColor, color: '#fff' }} title={CHAINS[t.chain]?.name}>
              {CHAINS[t.chain]?.name?.slice(0, 1)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-[#0A0A0A]">{t.symbol}</span>
              <span className="text-[10px]" style={{ color: '#A3A3A3' }}>{t.name}</span>
            </div>
            <p className="text-xs font-mono tabular-nums text-[#0A0A0A]">{fmtUSD(t.priceUsd)}
              <span className={`ml-1.5 text-[10px] ${pctClass(t.priceChange24h)}`}>
                {t.priceChange24h >= 0 ? '+' : ''}{t.priceChange24h.toFixed(2)}%
              </span>
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-mono tabular-nums font-semibold text-[#0A0A0A]">{fmtUSD(t.valueUsd)}</p>
            <p className="text-[10px] font-mono tabular-nums" style={{ color: '#A3A3A3' }}>
              {t.balance < 0.001 ? t.balance.toExponential(2) : t.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })} {t.symbol}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#F0F0F0' }}>
              <div className="h-full rounded-full bar-animate" style={{ width: `${Math.min(t.allocation, 100)}%`, background: CHAINS[t.chain]?.color ?? '#737373' }} />
            </div>
            <span className="text-[10px] font-mono tabular-nums" style={{ color: '#737373' }}>{t.allocation.toFixed(1)}%</span>
          </div>
          <p className={`text-[10px] font-mono tabular-nums font-semibold ${pctClass(t.pnlUsd)}`}>
            PnL {t.pnlUsd >= 0 ? '+' : ''}{fmtUSD(t.pnlUsd)}
          </p>
        </div>
      </div>
    )
  }

  function renderTokenRow(t: (typeof filtered)[0], i: number) {
    const chainColor = CHAINS[t.chain]?.color ?? '#555'
    return (
      <div
        key={`${t.id}-${t.walletId}-${i}`}
        className="portfolio-row hidden md:grid items-center px-4 py-3"
        style={{ gridTemplateColumns: '2.5fr 1fr 1fr 80px 0.8fr 1fr 0.8fr' }}
      >
        {/* Token: logo + name + symbol + chain badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {t.logo ? (
              <img src={t.logo} alt={t.symbol} className="w-8 h-8 rounded-full"
                onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${t.symbol}&size=32&background=F0F0F0&color=737373&bold=true&font-size=0.4` }} />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: '#F0F0F0', color: '#737373' }}>{t.symbol.slice(0, 2)}</div>
            )}
            {/* Chain badge overlay */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold border-2 border-white"
              style={{ background: chainColor, color: '#fff' }}
              title={CHAINS[t.chain]?.name}
            >
              {CHAINS[t.chain]?.name?.slice(0, 1)}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold text-[#0A0A0A] truncate">{t.symbol}</span>
              {wallets.length > 1 && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: t.walletColor }} />
                </span>
              )}
            </div>
            <p className="text-[10px] truncate" style={{ color: '#A3A3A3' }}>{t.name}</p>
          </div>
        </div>

        {/* Price */}
        <div className="text-right">
          <p className="text-xs font-mono tabular-nums text-[#0A0A0A]">{fmtUSD(t.priceUsd)}</p>
          <p className={`text-[10px] font-mono tabular-nums ${pctClass(t.priceChange24h)}`}>
            {t.priceChange24h >= 0 ? '+' : ''}{t.priceChange24h.toFixed(2)}%
          </p>
        </div>

        {/* Balance */}
        <div className="text-right">
          <p className="text-xs font-mono tabular-nums text-[#0A0A0A]">
            {t.balance < 0.001 ? t.balance.toExponential(2) : t.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })}
          </p>
          <p className="text-[10px] font-mono tabular-nums" style={{ color: '#A3A3A3' }}>{t.symbol}</p>
        </div>

        {/* 7d Sparkline */}
        <div className="flex justify-center">
          <div className="w-[72px]">
            <TokenPriceChart cgId={getCgId(t)} days={7} height={32} />
          </div>
        </div>

        {/* Value */}
        <p className="text-xs font-mono tabular-nums font-semibold text-[#0A0A0A] text-right">{fmtUSD(t.valueUsd)}</p>

        {/* PnL */}
        <div className="text-right">
          <p className={`text-xs font-mono tabular-nums font-semibold ${pctClass(t.pnlUsd)}`}>
            {t.pnlUsd >= 0 ? '+' : ''}{fmtUSD(t.pnlUsd)}
          </p>
          <p className={`text-[10px] font-mono tabular-nums ${pctClass(t.pnlPct)}`}>
            {t.pnlPct >= 0 ? '+' : ''}{t.pnlPct.toFixed(1)}%
          </p>
        </div>

        {/* Allocation bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#F0F0F0' }}>
            <div
              className="h-full rounded-full bar-animate"
              style={{ width: `${Math.min(t.allocation, 100)}%`, background: CHAINS[t.chain]?.color ?? '#737373' }}
            />
          </div>
          <span className="text-[10px] font-mono tabular-nums w-10 text-right" style={{ color: '#737373' }}>
            {t.allocation.toFixed(1)}%
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[#0A0A0A] font-serif">Token Holdings</h2>
          <p className="text-xs mt-0.5" style={{ color: '#A3A3A3' }}>
            {filtered.length} tokens across {uniqueChains.length} chains
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Summary stats */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px]" style={{ color: '#A3A3A3' }}>Total Value</p>
              <p className="text-sm font-bold font-mono tabular-nums text-[#0A0A0A]">{fmtUSD(totalValue)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px]" style={{ color: '#A3A3A3' }}>Total PnL</p>
              <p className={`text-sm font-bold font-mono tabular-nums ${pctClass(totalPnl)}`}>
                {totalPnl >= 0 ? '+' : ''}{fmtUSD(totalPnl)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px]" style={{ color: '#A3A3A3' }}>Cost Basis</p>
              <p className="text-sm font-mono tabular-nums" style={{ color: '#737373' }}>{fmtUSD(totalCostBasis)}</p>
            </div>
          </div>
          {/* View toggle */}
          <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
            <button
              onClick={() => setViewMode('flat')}
              className="p-1.5 transition-colors"
              style={{ background: viewMode === 'flat' ? '#F0F0F0' : '#FFFFFF', color: viewMode === 'flat' ? '#0A0A0A' : '#A3A3A3' }}
              title="Flat view"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              className="p-1.5 transition-colors"
              style={{ background: viewMode === 'grouped' ? '#F0F0F0' : '#FFFFFF', color: viewMode === 'grouped' ? '#0A0A0A' : '#A3A3A3' }}
              title="Group by chain"
            >
              <Grid3X3 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Chain distribution bar (like DeBank) */}
      {chainBreakdown.length > 0 && (
        <div className="mb-4 card rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #F0F0F0' }}>
          <div className="flex items-center gap-1.5 h-2.5 rounded-full overflow-hidden mb-2" style={{ background: '#F0F0F0' }}>
            {chainBreakdown.map(({ chain, pct }) => (
              <div
                key={chain}
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.max(pct, 0.5)}%`, background: CHAINS[chain]?.color ?? '#737373', minWidth: 3 }}
                title={`${CHAINS[chain]?.name}: ${pct.toFixed(1)}%`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {chainBreakdown.map(({ chain, value, pct }) => (
              <button
                key={chain}
                onClick={() => setFilterChain(filterChain === chain ? 'all' : chain)}
                className="flex items-center gap-1.5 text-[10px] transition-opacity cursor-pointer"
                style={{ opacity: filterChain === 'all' || filterChain === chain ? 1 : 0.4 }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: CHAINS[chain]?.color ?? '#737373' }} />
                <span style={{ color: '#737373' }}>{CHAINS[chain]?.name}</span>
                <span className="font-mono tabular-nums font-medium" style={{ color: '#0A0A0A' }}>{fmtUSD(value, true)}</span>
                <span className="font-mono tabular-nums" style={{ color: '#A3A3A3' }}>{pct.toFixed(1)}%</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A3A3A3' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tokens..."
            className="pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#0A0A0A', width: 200 }}
          />
        </div>
        <select
          value={filterChain}
          onChange={e => setFilterChain(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
          style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#737373' }}
        >
          <option value="all">All Chains ({uniqueChains.length})</option>
          {uniqueChains.map(c => (
            <option key={c} value={c}>{CHAINS[c]?.name ?? c}</option>
          ))}
        </select>
        {wallets.length > 1 && (
          <select
            value={filterWallet}
            onChange={e => setFilterWallet(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
            style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#737373' }}
          >
            <option value="all">All Wallets</option>
            {wallets.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
          </select>
        )}
        {filterChain !== 'all' && (
          <button
            onClick={() => setFilterChain('all')}
            className="px-2 py-1 rounded text-[10px] font-medium"
            style={{ background: '#EF444418', color: '#EF4444', cursor: 'pointer' }}
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #F0F0F0' }}>
        {/* Header row (desktop only) */}
        <div
          className="hidden md:grid items-center px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider"
          style={{ color: '#A3A3A3', borderBottom: '1px solid #F0F0F0', gridTemplateColumns: '2.5fr 1fr 1fr 80px 0.8fr 1fr 0.8fr' }}
        >
          <span>Token</span>
          <button className="flex items-center gap-1 justify-end hover:text-[#0A0A0A] transition-colors" onClick={() => toggleSort('price')}>
            Price <SortIcon k="price" />
          </button>
          <button className="flex items-center gap-1 justify-end hover:text-[#0A0A0A] transition-colors" onClick={() => toggleSort('balance')}>
            Balance <SortIcon k="balance" />
          </button>
          <span className="text-center">7d</span>
          <button className="flex items-center gap-1 justify-end hover:text-[#0A0A0A] transition-colors" onClick={() => toggleSort('value')}>
            Value <SortIcon k="value" />
          </button>
          <button className="flex items-center gap-1 justify-end hover:text-[#0A0A0A] transition-colors" onClick={() => toggleSort('pnl')}>
            PnL <SortIcon k="pnl" />
          </button>
          <span className="text-right">Alloc.</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ background: '#F0F0F0', border: '1px solid #E5E5E5' }}>
              <Layers size={20} style={{ color: '#A3A3A3' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: '#737373' }}>No tokens found</p>
            <p className="text-xs mt-1" style={{ color: '#A3A3A3' }}>
              {wallets.length === 0 ? 'Add a wallet to see your holdings' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : viewMode === 'grouped' && groupedByChain ? (
          // Grouped by chain view
          <div>
            {groupedByChain.map(([chain, tokens]) => {
              const chainValue = tokens.reduce((s, t) => s + t.valueUsd, 0)
              return (
                <div key={chain}>
                  {/* Chain group header */}
                  <div className="px-4 py-2 flex items-center gap-2" style={{ background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
                    <ChainBadge chain={chain} />
                    <span className="text-xs font-semibold text-[#0A0A0A]">{CHAINS[chain]?.name}</span>
                    <span className="text-[10px] font-mono tabular-nums" style={{ color: '#737373' }}>
                      {tokens.length} token{tokens.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-[10px] font-mono tabular-nums ml-auto font-semibold" style={{ color: '#0A0A0A' }}>
                      {fmtUSD(chainValue)}
                    </span>
                  </div>
                  <div className="divide-y" style={{ borderColor: '#F5F5F5' }}>
                    {tokens.map((t, i) => (
                      <div key={`grp-wrapper-${t.id}-${t.walletId}-${i}`}>
                        {renderTokenCard(t, i)}
                        {renderTokenRow(t, i)}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // Flat view
          <div className="divide-y" style={{ borderColor: '#F5F5F5' }}>
            {filtered.map((t, i) => (
              <div key={`wrapper-${t.id}-${t.walletId}-${i}`}>
                {renderTokenCard(t, i)}
                {renderTokenRow(t, i)}
              </div>
            ))}
          </div>
        )}

        {/* Total row — desktop */}
        {filtered.length > 0 && (
          <div
            className="total-row hidden md:grid items-center px-4 py-3 font-semibold"
            style={{ borderTop: '1px solid #E5E5E5', gridTemplateColumns: '2.5fr 1fr 1fr 80px 0.8fr 1fr 0.8fr' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0A0A0A]">Total ({filtered.length} tokens)</span>
            </div>
            <span />
            <span />
            <span />
            <p className="text-xs font-mono tabular-nums font-bold text-[#0A0A0A] text-right">{fmtUSD(totalValue)}</p>
            <p className={`text-xs font-mono tabular-nums font-bold text-right ${pctClass(totalPnl)}`}>
              {totalPnl >= 0 ? '+' : ''}{fmtUSD(totalPnl)}
            </p>
            <p className="text-[10px] font-mono tabular-nums text-right" style={{ color: '#737373' }}>100%</p>
          </div>
        )}
        {/* Total row — mobile */}
        {filtered.length > 0 && (
          <div className="total-row md:hidden flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid #E5E5E5' }}>
            <span className="text-xs font-bold text-[#0A0A0A]">Total ({filtered.length} tokens)</span>
            <div className="text-right">
              <p className="text-sm font-mono tabular-nums font-bold text-[#0A0A0A]">{fmtUSD(totalValue)}</p>
              <p className={`text-[10px] font-mono tabular-nums font-semibold ${pctClass(totalPnl)}`}>
                PnL {totalPnl >= 0 ? '+' : ''}{fmtUSD(totalPnl)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
