import { useState, useMemo, useCallback, useEffect } from 'react'
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

interface AppProps {
  initialAddress?: string
}

function App({ initialAddress }: AppProps) {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard')
  const [addWalletOpen, setAddWalletOpen] = useState(false)
  const [initialAdded, setInitialAdded] = useState(false)

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
        return <ProFeatureGate feature="Whale Tracker"><WhaleTracker /></ProFeatureGate>
      case 'gas':
        return <GasTracker gasEstimates={gasEstimates} loading={gasLoading} />
      case 'dca':
        return <ProFeatureGate feature="DCA Planner"><DCA portfolios={portfolios} priceMap={priceMap} prices={prices} /></ProFeatureGate>
      case 'goals':
        return <ProFeatureGate feature="Goals"><Goals portfolios={portfolios} priceMap={priceMap} totalValue={totalValue} /></ProFeatureGate>
      case 'pools':
        return <Pools yields={yields} protocols={protocols} loading={marketLoading} priceMap={priceMap} />
      case 'smart-allocator':
        return <ProFeatureGate feature="Smart Allocator"><SmartAllocator portfolios={portfolios} priceMap={priceMap} /></ProFeatureGate>
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: '#A3A3A3' }}>Coming soon</p>
          </div>
        )
    }
  }

  return (
    <div className="tracker-app flex h-screen overflow-hidden" style={{ background: '#FAFAFA' }}>
      {/* Scan progress overlay */}
      <ScanProgress
        title="Folio"
        steps={scanSteps}
        statusText={scanStatus}
        visible={scanVisible}
      />

      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} walletCount={wallets.length} fundedChains={fundedChains} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          totalValue={totalValue}
          change24h={total24hChange}
          change24hPct={total24hPct}
          walletCount={wallets.length}
          lastUpdated={lastUpdated}
          onRefresh={() => { refetch(); fetchPortfolios() }}
          onAddWallet={handleOpenAddWallet}
          onExport={isPro && portfolios.length > 0 ? handleExport : undefined}
        />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default App
