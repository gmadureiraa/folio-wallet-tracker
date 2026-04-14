import { useState, useEffect } from 'react'
import { RefreshCw, Plus, Sparkles, ArrowUpRight, Download, Moon, Sun, Settings, Menu, LogOut, LogIn, User as UserIcon } from 'lucide-react'
import { fmtUSD, fmtPct } from '../lib/formatters'
import { useTheme } from '../../../lib/theme'
import { useAuth } from '../../../lib/auth-context'

interface HeaderProps {
  totalValue: number
  change24h: number
  change24hPct: number
  walletCount: number
  lastUpdated: Date | null
  onRefresh: () => void
  onAddWallet: () => void
  onExport?: () => void
}

function useElapsed(d: Date | null): string {
  const [, tick] = useState(0)
  useEffect(() => { const id = setInterval(() => tick(t => t + 1), 5000); return () => clearInterval(id) }, [])
  if (!d) return ''
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

const pill = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs'
const pillStyle = { background: '#FFFFFF', border: '1px solid #E5E5E5' }

export function Header({ totalValue, change24h, change24hPct, walletCount, lastUpdated, onRefresh, onAddWallet, onExport }: HeaderProps) {
  const [spinning, setSpinning] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const elapsed = useElapsed(lastUpdated)
  const { theme, toggle: toggleTheme } = useTheme()
  const { user, signOut } = useAuth()

  function handleRefresh() {
    if (spinning) return
    setSpinning(true)
    onRefresh()
    setTimeout(() => setSpinning(false), 1200)
  }

  const positive = change24hPct >= 0

  return (
    <header className="flex items-center gap-3 px-4 md:px-6 py-3 sticky top-0 z-10"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #F0F0F0' }}>

      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 rounded-full transition-colors flex-shrink-0"
        style={{ color: '#737373', cursor: 'pointer' }}
        onClick={() => {
          window.dispatchEvent(new CustomEvent('folio:toggle-sidebar'))
        }}
        title="Menu"
      >
        <Menu size={18} />
      </button>

      {/* Folio logo */}
      <a href="/" className="flex items-center gap-2 flex-shrink-0 mr-1 no-underline" title="Back to home">
        <img src="/folio-logo-icon.png" className="w-7 h-7" alt="Folio" />
        <span className="text-sm font-bold tracking-tight font-serif hidden md:inline" style={{ color: '#0A0A0A' }}>Folio</span>
      </a>

      <div className="w-px h-5 flex-shrink-0 hidden md:block" style={{ background: '#F0F0F0' }} />

      {/* Portfolio value */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {totalValue > 0 ? (
          <>
            <div>
              <p className="text-xl font-bold font-mono leading-none" style={{ color: '#0A0A0A' }}>{fmtUSD(totalValue)}</p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: positive ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)' }}>
              <ArrowUpRight size={10} style={{ color: positive ? '#22C55E' : '#EF4444', transform: positive ? 'none' : 'rotate(90deg)' }} />
              <span className="text-[11px] font-mono font-semibold" style={{ color: positive ? '#22C55E' : '#EF4444' }}>
                {positive ? '+' : ''}{fmtPct(change24hPct)}
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm font-medium" style={{ color: '#A3A3A3' }}>No wallets tracked yet</p>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {elapsed && (
          <span className="text-[10px] hidden md:block mr-1" style={{ color: '#A3A3A3' }}>{elapsed}</span>
        )}

        <a
          href="/app/plan"
          className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all no-underline"
          style={{ background: 'linear-gradient(135deg, rgba(98,126,234,0.08) 0%, rgba(153,69,255,0.08) 100%)', color: '#627EEA', border: '1px solid rgba(98,126,234,0.15)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(98,126,234,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(98,126,234,0.15)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <Sparkles size={10} />
          Upgrade
        </a>

        {onExport && (
          <button
            onClick={onExport}
            title="Export CSV"
            className="p-2 rounded-full transition-colors"
            style={{ color: '#A3A3A3', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#0A0A0A'; e.currentTarget.style.background = '#F5F5F5' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#A3A3A3'; e.currentTarget.style.background = 'transparent' }}>
            <Download size={14} />
          </button>
        )}

        <button
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          className="p-2 rounded-full transition-colors"
          style={{ color: '#A3A3A3', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#0A0A0A'; e.currentTarget.style.background = '#F5F5F5' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#A3A3A3'; e.currentTarget.style.background = 'transparent' }}>
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        <button
          onClick={handleRefresh}
          title="Refresh"
          className="p-2 rounded-full transition-colors"
          style={{ color: '#A3A3A3', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#0A0A0A'; e.currentTarget.style.background = '#F5F5F5' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#A3A3A3'; e.currentTarget.style.background = 'transparent' }}>
          <RefreshCw size={14} className={spinning ? 'spin' : ''} />
        </button>

        {/* Auth: user menu or sign-in link */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-colors"
              style={{ background: '#F5F5F5', color: '#737373', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#0A0A0A' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#737373' }}
              title={user.email ?? 'Account'}
            >
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="" className="w-5 h-5 rounded-full" />
              ) : (
                <UserIcon size={13} />
              )}
              <span className="hidden md:inline max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
            </button>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 z-30 w-52 rounded-2xl border bg-white shadow-xl" style={{ borderColor: '#F0F0F0' }}>
                  <div className="px-4 py-3 border-b text-xs text-gray-500 truncate" style={{ borderColor: '#F5F5F5' }}>
                    {user.email}
                  </div>
                  <a href="/app/settings" className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors no-underline">
                    <Settings size={12} />
                    Settings
                  </a>
                  <button
                    onClick={() => { setShowUserMenu(false); signOut(); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={12} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <a
            href="/app/login"
            className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors no-underline"
            style={{ color: '#737373', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#0A0A0A'; e.currentTarget.style.background = '#F5F5F5' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#A3A3A3'; e.currentTarget.style.background = 'transparent' }}
          >
            <LogIn size={11} />
            Sign in
          </a>
        )}

        <button
          onClick={onAddWallet}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all"
          style={{ background: '#0A0A0A', color: '#FFFFFF', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#262626'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#0A0A0A'; e.currentTarget.style.transform = 'translateY(0)' }}>
          <Plus size={12} />
          <span className="hidden md:inline">Add Wallet</span>
        </button>
      </div>
    </header>
  )
}
