import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { exportPortfolioCSV } from '../../lib/export'
import { ProFeatureGate, usePlan } from '../../lib/plan-guard'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { Dashboard } from './pages/Dashboard'
import { Wallets } from './pages/Wallets'
import { Portfolio } from './pages/Portfolio'
import { Transactions } from './pages/Transactions'
import { NFTs } from './pages/NFTs'
import { DeFiPositions } from './pages/DeFiPositions'
import { PnL } from './pages/PnL'
import { Alerts } from './pages/Alerts'
import { WhaleTracker } from './pages/WhaleTracker'
import { GasTracker } from './pages/GasTracker'
import { DCA } from './pages/DCA'
import { Goals } from './pages/Goals'
import { Pools } from './pages/Pools'
import { SmartAllocator } from './pages/SmartAllocator'
import { useWallets } from './hooks/useWallets'
import { usePrices } from './hooks/usePrices'
import { useGasData } from './hooks/useGasData'
import { useDefiData } from './hooks/useDefiData'
import {
  generateTransactions,
} from './lib/mockPortfolio'
import { fetchRealPortfolio } from './lib/realPortfolio'
import { fetchRealNFTs } from './lib/realNFTs'
import { fetchRealDefiPositions } from './lib/realDefi'
import { ScanProgress, type ScanStep } from './components/ScanProgress'
import { getCachedPortfolio, isPortfolioCacheStale, setCachedPortfolio } from './lib/cache'
import type { PageId, WalletPortfolio, Transaction, NFTItem, DeFiPosition, TokenPosition, ChainId } from './types'

/* ═══════════════════════════════════════
   Coming Soon — replaces half-baked features
   moved to the roadmap
   ═══════════════════════════════════════ */

function ComingSoon({ feature, quarter }: { feature: string; quarter: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
      <img src="/folio-empty-state.png" alt="" className="w-32 h-auto opacity-60" />
      <h2 className="text-xl font-bold font-serif">{feature}</h2>
      <p className="text-gray-500 max-w-sm">This feature is coming in {quarter}. We&apos;re building it right now.</p>
      <a href="/roadmap" className="text-sm text-gray-900 underline hover:no-underline">View roadmap &rarr;</a>
    </div>
  );
}

interface AppProps {
  initialAddress?: string
}

function App({ initialAddress }: AppProps) {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard')
  const [addWalletOpen, setAddWalletOpen] = useState(false)
  const [initialAdded, setInitialAdded] = useState(false)

  // Welcome toast state
  const [welcomeToast, setWelcomeToast] = useState<string | null>(null)
  const prevWalletCount = useRef(0)

  const { wallets, addWallet, removeWallet, updateWallet } = useWallets()
  const { prices, priceMap, lastUpdated, refetch } = usePrices()
  const ethPrice = priceMap['ethereum'] ?? 3200
  const { gasEstimates, loading: gasLoading } = useGasData(ethPrice)
  const { yields, protocols, loading: marketLoading } = useDefiData()

  // Real portfolio data fetched from blockchain (multi-chain scan)
  // Hydrate from cache for instant display
  const cachedPortfolios = useMemo(() => getCachedPortfolio<WalletPortfolio[]>(), [])
  const [portfolios, setPortfolios] = useState<WalletPortfolio[]>(cachedPortfolios ?? [])
  const [portfolioLoading, setPortfolioLoading] = useState(false)

  // Scan progress tracker
  const [scanSteps, setScanSteps] = useState<ScanStep[]>([])
  const [scanVisible, setScanVisible] = useState(false)
  const [scanStatus, setScanStatus] = useState('')

  // Auto-add initial address from guest flow (once)
  useEffect(() => {
    if (initialAddress && !initialAdded && wallets.length === 0) {
      const chain: ChainId = initialAddress.toLowerCase().endsWith('.sol') || (!initialAddress.startsWith('0x') && initialAddress.length < 44 && !initialAddress.includes('.'))
        ? 'solana'
        : 'ethereum'
      addWallet(initialAddress, 'My Wallet', chain)
      setInitialAdded(true)
    }
  }, [initialAddress, initialAdded, wallets.length, addWallet])

  // All EVM chains to auto-scan for each wallet
  const EVM_CHAINS: ChainId[] = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism', 'base', 'linea', 'scroll', 'zksync', 'avalanche', 'fantom', 'gnosis', 'mantle', 'cronos', 'celo']

  // Fetch real portfolio across ALL chains for each wallet
  const fetchPortfolios = useCallback(async () => {
    if (wallets.length === 0) { setPortfolios([]); return }
    setPortfolioLoading(true)

    // Show scan progress
    const steps: ScanStep[] = [
      { label: 'Connecting', status: 'done' },
      { label: 'Scanning chains', status: 'active' },
      { label: 'Fetching prices', status: 'pending' },
      { label: 'Loading DeFi', status: 'pending' },
      { label: 'Complete', status: 'pending' },
    ]
    setScanSteps([...steps])
    setScanStatus('Scanning 16 blockchains...')
    setScanVisible(true)

    try {
      const results: WalletPortfolio[] = []

      for (const w of wallets) {
        // For EVM wallets, scan all EVM chains in parallel
        const chainsToScan: ChainId[] = w.chain === 'solana' ? ['solana'] : EVM_CHAINS

        const chainResults = await Promise.allSettled(
          chainsToScan.map(chain => fetchRealPortfolio(w.id, w.address, chain, priceMap))
        )

        // Update progress
        steps[1].status = 'done'
        steps[2].status = 'active'
        setScanSteps([...steps])
        setScanStatus('Fetching real-time prices...')

        // Merge all tokens from all chains
        const allTokens: TokenPosition[] = []
        for (let i = 0; i < chainResults.length; i++) {
          const res = chainResults[i]
          if (res.status === 'fulfilled' && res.value.length > 0) {
            // Tag tokens with their actual chain
            for (const token of res.value) {
              token.chain = chainsToScan[i]
              token.id = `${w.id}-${chainsToScan[i]}-${token.symbol}`
            }
            allTokens.push(...res.value)
          }
        }

        // Aggregate by symbol (combine same token across chains for display)
        const totalValueUsd = allTokens.reduce((s, t) => s + t.valueUsd, 0)
        const change24hUsd = allTokens.reduce((s, t) => s + t.valueUsd * (t.priceChange24h / 100), 0)
        const change24hPct = totalValueUsd > 0 ? (change24hUsd / totalValueUsd) * 100 : 0

        // Recalculate allocations
        for (const t of allTokens) {
          t.allocation = totalValueUsd > 0 ? (t.valueUsd / totalValueUsd) * 100 : 0
        }

        // Sort by value
        allTokens.sort((a, b) => b.valueUsd - a.valueUsd)

        results.push({
          walletId: w.id,
          chain: w.chain,
          totalValueUsd,
          change24hUsd,
          change24hPct,
          tokens: allTokens,
          lastFetched: Date.now(),
        })
      }

      // Update progress
      steps[2].status = 'done'
      steps[3].status = 'done'
      steps[4].status = 'done'
      setScanSteps([...steps])
      setScanStatus('Portfolio ready!')

      setPortfolios(results)
      setCachedPortfolio(results)

      // Hide after 1.5s
      setTimeout(() => setScanVisible(false), 1500)
    } catch {
      setScanVisible(false)
    } finally {
      setPortfolioLoading(false)
    }
  }, [wallets, priceMap])

  // Auto-fetch on mount and when wallets change
  // If we have fresh cache, skip the scan; if stale, refresh in background
  useEffect(() => {
    if (Object.keys(priceMap).length > 0 || wallets.length > 0) {
      if (cachedPortfolios && cachedPortfolios.length > 0 && !isPortfolioCacheStale()) {
        // Cache is fresh — no need to re-scan
        return
      }
      fetchPortfolios()
    }
  }, [wallets.length, Object.keys(priceMap).length])

  const transactions = useMemo<Transaction[]>(() =>
    wallets.flatMap(w => generateTransactions(w.id, w.address, w.chain, ethPrice)),
    [wallets, ethPrice]
  )

  const [nfts, setNfts] = useState<NFTItem[]>([])

  // Fetch real NFTs from Reservoir API
  useEffect(() => {
    if (wallets.length === 0) { setNfts([]); return }
    let cancelled = false
    ;(async () => {
      const results: NFTItem[] = []
      for (const w of wallets) {
        const items = await fetchRealNFTs(w.id, w.address, w.chain)
        results.push(...items)
      }
      if (!cancelled) setNfts(results)
    })()
    return () => { cancelled = true }
  }, [wallets])

  // Real DeFi positions from on-chain data
  const [defiPositions, setDefiPositions] = useState<DeFiPosition[]>([])

  useEffect(() => {
    if (wallets.length === 0) { setDefiPositions([]); return }
    let cancelled = false
    ;(async () => {
      const results: DeFiPosition[] = []
      for (const w of wallets) {
        const positions = await fetchRealDefiPositions(w.id, w.address, priceMap)
        results.push(...positions)
      }
      if (!cancelled) setDefiPositions(results)
    })()
    return () => { cancelled = true }
  }, [wallets, Object.keys(priceMap).length])

  // Welcome toast: show when user goes from 0 wallets to having portfolios
  useEffect(() => {
    if (prevWalletCount.current === 0 && wallets.length > 0 && portfolios.length > 0 && !portfolioLoading) {
      const totalTokens = portfolios.reduce((s, p) => s + p.tokens.length, 0)
      const chains = new Set(portfolios.flatMap(p => p.tokens.map(t => t.chain)))
      if (totalTokens > 0) {
        setWelcomeToast(`Portfolio loaded! Tracking ${totalTokens} token${totalTokens !== 1 ? 's' : ''} across ${chains.size} chain${chains.size !== 1 ? 's' : ''}.`)
        setTimeout(() => setWelcomeToast(null), 5000)
      }
    }
    prevWalletCount.current = wallets.length
  }, [wallets.length, portfolios, portfolioLoading])

  // "What's New" banner
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try { return localStorage.getItem('folio:banner-dismissed-v1') === '1' } catch { return false }
  })
  const dismissBanner = useCallback(() => {
    setBannerDismissed(true)
    try { localStorage.setItem('folio:banner-dismissed-v1', '1') } catch { /* ignore */ }
  }, [])

  const totalValue = portfolios.reduce((s, p) => s + p.totalValueUsd, 0)
  const total24hChange = portfolios.reduce((s, p) => s + p.change24hUsd, 0)
  const total24hPct = totalValue > 0 ? (total24hChange / totalValue) * 100 : 0

  // Compute funded chains from portfolio tokens
  const fundedChains = useMemo(() => {
    const chains = new Set<ChainId>()
    for (const p of portfolios) {
      for (const t of p.tokens) {
        chains.add(t.chain)
      }
    }
    return [...chains]
  }, [portfolios])

  const handleAddWallet = useCallback((address: string, label: string, chain: any) => {
    addWallet(address, label, chain)
    setAddWalletOpen(false)
  }, [addWallet])

  const handleOpenAddWallet = useCallback(() => {
    setCurrentPage('wallets')
    setAddWalletOpen(true)
  }, [])

  const handleExport = useCallback(() => {
    const allTokens = portfolios.flatMap(p =>
      p.tokens.map(t => ({
        name: t.name,
        symbol: t.symbol,
        balance: t.balance,
        usdValue: t.valueUsd,
        chain: t.chain,
      }))
    )
    if (allTokens.length > 0) exportPortfolioCSV(allTokens)
  }, [portfolios])

  const { isPro } = usePlan()

  function renderPage() {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard wallets={wallets} portfolios={portfolios} totalValue={totalValue} change24h={total24hChange} change24hPct={total24hPct} onNavigate={setCurrentPage} onAddWallet={handleOpenAddWallet} loading={portfolioLoading} />
      case 'wallets':
        return <Wallets wallets={wallets} portfolios={portfolios} onAdd={handleAddWallet} onRemove={removeWallet} onUpdate={updateWallet} addOpen={addWalletOpen} onAddOpenChange={setAddWalletOpen} />
      case 'portfolio':
        return <Portfolio wallets={wallets} portfolios={portfolios} />
      case 'transactions':
        return <Transactions transactions={transactions} wallets={wallets} />
      case 'nfts':
        return <NFTs nfts={nfts} wallets={wallets} />
      case 'defi':
        return <ProFeatureGate feature="DeFi Positions"><DeFiPositions positions={defiPositions} wallets={wallets} /></ProFeatureGate>
      case 'pnl':
        return <ProFeatureGate feature="PnL Analytics"><PnL portfolios={portfolios} wallets={wallets} /></ProFeatureGate>
      case 'alerts':
        return <Alerts prices={prices} />
      case 'whales':
        return <ComingSoon feature="Whale Tracker" quarter="Q3 2026" />
      case 'gas':
        return <GasTracker gasEstimates={gasEstimates} loading={gasLoading} />
      case 'dca':
        return <ComingSoon feature="DCA Planner" quarter="Q4 2026" />
      case 'goals':
        return <ComingSoon feature="Goals" quarter="Q3 2026" />
      case 'pools':
        return <Pools yields={yields} protocols={protocols} loading={marketLoading} priceMap={priceMap} />
      case 'smart-allocator':
        return <ComingSoon feature="Smart Allocator" quarter="Q4 2026" />
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: '#A3A3A3' }}>Coming soon</p>
          </div>
        )
    }
  }

  return (
    <div className="tracker-app flex h-screen overflow-hidden" style={{ background: '#F5F5F5' }}>
      {/* Scan progress overlay */}
      <ScanProgress
        title="Folio"
        steps={scanSteps}
        statusText={scanStatus}
        visible={scanVisible}
      />

      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} walletCount={wallets.length} fundedChains={fundedChains} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* What's New banner */}
        {!bannerDismissed && (
          <div className="flex items-center justify-between px-4 md:px-6 py-2" style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.06), rgba(98,126,234,0.06))', borderBottom: '1px solid rgba(139,92,246,0.12)' }}>
            <p className="text-[11px]" style={{ color: '#737373' }}>
              <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold mr-2" style={{ background: '#8B5CF6', color: '#fff' }}>NEW</span>
              Track DeFi positions across 14 protocols.
              <a href="/app/plan" className="ml-1 font-semibold no-underline" style={{ color: '#627EEA' }}>Upgrade to Pro &rarr;</a>
            </p>
            <button
              onClick={dismissBanner}
              className="text-[11px] px-2 py-0.5 rounded transition-colors flex-shrink-0"
              style={{ color: '#A3A3A3', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#0A0A0A' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#A3A3A3' }}
            >
              Dismiss
            </button>
          </div>
        )}
        <Header
          totalValue={totalValue}
          change24h={total24hChange}
          change24hPct={total24hPct}
          walletCount={wallets.length}
          lastUpdated={lastUpdated}
          onRefresh={() => { refetch(); fetchPortfolios() }}
          onAddWallet={handleOpenAddWallet}
          onExport={isPro && portfolios.length > 0 ? handleExport : undefined}
          showPulse={wallets.length === 0}
        />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      {/* Welcome toast */}
      {welcomeToast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 notification-enter"
          style={{ maxWidth: 420 }}
        >
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
            style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
          >
            <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <p className="text-xs font-medium" style={{ color: '#0A0A0A' }}>{welcomeToast}</p>
            <button
              onClick={() => setWelcomeToast(null)}
              className="text-[10px] ml-2 flex-shrink-0"
              style={{ color: '#A3A3A3', cursor: 'pointer' }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
