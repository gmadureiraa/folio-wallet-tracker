import { useEffect } from 'react'
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  RefreshCcw,
  Target,
  Waves,
  Bell,
  Zap,
  Image,
  PieChart,
  Layers,
  Sparkles,
  Settings,
} from 'lucide-react'
import { CHAINS } from '../lib/chains'
import type { PageId, ChainId } from '../types'

interface NavItem {
  id: PageId
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: string
  shortcut: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const SHORTCUT_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Overview',    icon: LayoutDashboard, shortcut: '1' },
  { id: 'wallets',      label: 'Wallets',     icon: Wallet,          shortcut: '2' },
  { id: 'portfolio',    label: 'Portfolio',   icon: PieChart,        shortcut: '3' },
  { id: 'transactions', label: 'Txns',        icon: ArrowLeftRight,  shortcut: '4' },
  { id: 'pnl',          label: 'PnL',         icon: TrendingUp,      shortcut: '5' },
  { id: 'dca',          label: 'DCA',         icon: RefreshCcw,      shortcut: '6' },
  { id: 'goals',        label: 'Goals',       icon: Target,          shortcut: '7' },
  { id: 'pools',        label: 'Pools',       icon: Waves,           shortcut: '8' },
  { id: 'alerts',       label: 'Alerts',      icon: Bell,            shortcut: '9' },
]

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Portfolio',
    items: [
      { id: 'dashboard',    label: 'Overview',     icon: LayoutDashboard, shortcut: '1' },
      { id: 'wallets',      label: 'Wallets',      icon: Wallet,          shortcut: '2' },
      { id: 'portfolio',    label: 'Holdings',     icon: PieChart,        shortcut: '3' },
      { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight,  shortcut: '4' },
      { id: 'pnl',          label: 'PnL',          icon: TrendingUp,      shortcut: '5' },
      { id: 'nfts',         label: 'NFTs',         icon: Image,           shortcut: '' },
      { id: 'defi',         label: 'Positions',    icon: Layers,          shortcut: '' },
    ],
  },
  {
    label: 'Strategy',
    items: [
      { id: 'dca',    label: 'DCA Planner', icon: RefreshCcw, shortcut: '6', badge: 'new' },
      { id: 'goals',  label: 'Goals',       icon: Target,     shortcut: '7', badge: 'new' },
      { id: 'pools',  label: 'Pools/Yield', icon: Waves,      shortcut: '8' },
      { id: 'smart-allocator', label: 'Smart Allocator', icon: Sparkles, shortcut: '', badge: 'ai' },
      { id: 'alerts', label: 'Alerts',      icon: Bell,       shortcut: '9' },
    ],
  },
]

interface SidebarProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
  walletCount?: number
  fundedChains?: ChainId[]
}

export function Sidebar({ currentPage, onNavigate, walletCount = 0, fundedChains = [] }: SidebarProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const keyMap: Record<string, number> = { '0': 9 }
      const idx = keyMap[e.key] ?? (parseInt(e.key) - 1)
      if (idx >= 0 && idx < SHORTCUT_ITEMS.length) {
        onNavigate(SHORTCUT_ITEMS[idx].id)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onNavigate])

  return (
    <aside
      className="w-52 flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-hidden"
      style={{ background: '#FFFFFF', borderRight: '1px solid #E5E5E5' }}
    >
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #F0F0F0' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(98,126,234,0.25) 0%, rgba(153,69,255,0.25) 100%)',
              border: '1px solid rgba(98,126,234,0.35)',
            }}
          >
            <Zap size={14} style={{ color: '#627EEA' }} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none tracking-tight font-serif" style={{ color: '#0A0A0A' }}>Folio</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#A3A3A3' }}>
              {walletCount > 0 ? `${walletCount} wallet${walletCount !== 1 ? 's' : ''}` : 'Multi-chain'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto pb-4 space-y-4 pt-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1 text-[9px] font-bold uppercase tracking-widest" style={{ color: '#A3A3A3' }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-100 text-left relative group"
                    style={{
                      background: isActive ? 'rgba(34,197,94,0.08)' : 'transparent',
                      color: isActive ? '#0A0A0A' : '#737373',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F5F5F5' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full" style={{ background: '#22C55E' }} />
                    )}
                    <Icon
                      size={15}
                      className={`flex-shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-75'}`}
                    />
                    <span className="flex-1 text-xs">{item.label}</span>
                    {item.badge && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                        style={
                          item.badge === 'ai'
                            ? { background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }
                            : item.badge === 'btc'
                            ? { background: 'rgba(247,147,26,0.15)', color: '#F7931A', border: '1px solid rgba(247,147,26,0.2)' }
                            : { background: 'rgba(98,126,234,0.15)', color: '#627EEA', border: '1px solid rgba(98,126,234,0.2)' }
                        }
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.shortcut && (
                      <span className="text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#A3A3A3' }}>
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Chain status section */}
        {fundedChains.length > 0 && (
          <div>
            <p className="px-3 pb-1.5 text-[9px] font-bold uppercase tracking-widest" style={{ color: '#A3A3A3' }}>
              Active Chains ({fundedChains.length})
            </p>
            <div className="px-3 flex flex-wrap gap-1">
              {fundedChains.map(chainId => {
                const chain = CHAINS[chainId]
                if (!chain) return null
                return (
                  <span
                    key={chainId}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium"
                    style={{ background: chain.color + '12', color: chain.color, border: `1px solid ${chain.color}22` }}
                    title={chain.name}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: chain.color }} />
                    {chain.name}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      <div className="px-3 py-3 space-y-2" style={{ borderTop: '1px solid #F0F0F0' }}>
        <a
          href="/app/settings"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-100 text-left no-underline group"
          style={{ color: '#737373' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F5' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <Settings size={15} className="flex-shrink-0 opacity-50 group-hover:opacity-75" />
          <span className="text-xs">Settings</span>
        </a>
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="pulse-dot absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: '#22C55E' }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#22C55E' }} />
            </span>
            <span className="text-[11px]" style={{ color: '#A3A3A3' }}>Live</span>
          </div>
          <span className="text-[10px]" style={{ color: '#A3A3A3' }}>1-9 to nav</span>
        </div>
      </div>
    </aside>
  )
}
