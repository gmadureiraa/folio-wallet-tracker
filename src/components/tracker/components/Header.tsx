import { useState, useEffect } from 'react'
import { RefreshCw, Plus, Wallet, Sparkles, ArrowUpRight, Download, Moon, Sun, Settings, Menu, LogOut, LogIn, User as UserIcon } from 'lucide-react'
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
    <header className="flex items-center gap-3 px-4 md:px-6 py-2.5 sticky top-0 z-10"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E5E5' }}>

      {/* Mobile menu button — visible only on small screens */}
      <button
        className="md:hidden p-2 rounded-lg transition-colors flex-shrink-0"
        style={{ color: '#737373', cursor: 'pointer' }}
        onClick={() => {
          // Toggle sidebar visibility via custom event
          window.dispatchEvent(new CustomEvent('folio:toggle-sidebar'))
        }}
        title="Menu"
      >
        <Menu size={18} />
      </button>

      {/* Folio logo */}
      <a href="/" className="flex items-center gap-2 flex-shrink-0 mr-2 no-underline" title="Back to home">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(98,126,234,0.2) 0%, rgba(153,69,255,0.2) 100%)',
            border: '1px solid rgba(98,126,234,0.3)',
          }}
        >
          <Wallet size={13} style={{ color: '#627EEA' }} />
        </div>
        <span className="text-sm font-bold tracking-tight font-serif" style={{ color: '#0A0A0A' }}>Folio</span>
      </a>

      <div className="w-px h-5 flex-shrink-0" style={{ background: '#E5E5E5' }} />

      {/* Portfolio value */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {totalValue > 0 ? (
          <>
            <div>
              <p className="text-[10px]" style={{ color: '#A3A3A3' }}>Total Portfolio</p>
              <p className="text-lg font-bold font-mono leading-none" style={{ color: '#0A0A0A' }}>{fmtUSD(totalValue)}</p>
            </div>
            <div className={`${pill}`} style={pillStyle}>
              <span className="text-[10px] font-mono font-semibold" style={{ color: positive ? '#22C55E' : '#EF4444' }}>
                {positive ? '+' : ''}{fmtUSD(change24h)} ({fmtPct(change24hPct)})
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm font-medium" style={{ color: '#A3A3A3' }}>No wallets tracked yet</p>
        )}
      </div>

      {/* Stats pills */}
      <div className="flex items-center gap-1.5 flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className={`${pill} hidden md:flex`} style={pillStyle}>
          <span style={{ color: '#A3A3A3', fontSize: 10 }}>Wallets</span>
          <span className="font-mono font-medium text-xs" style={{ color: '#0A0A0A' }}>{walletCount}</span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <a
          href="/app/plan"
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors no-underline"
          style={{ background: 'linear-gradient(135deg, rgba(98,126,234,0.08) 0%, rgba(153,69,255,0.08) 100%)', color: '#627EEA', border: '1px solid rgba(98,126,234,0.15)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(98,126,234,0.35)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(98,126,234,0.15)' }}
        >
          <Sparkles size={11} />
          Upgrade
        </a>

        <a
          href="/"
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors no-underline"
          style={{ color: '#A3A3A3' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#0A0A0A' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#A3A3A3' }}
        >
          Home
          <ArrowUpRight size={10} />
        </a>

        {elapsed && (
          <span className="text-[10px] hidden md:block" style={{ color: '#A3A3A3' }}>{elapsed}</span>
        )}

        {onExport && (
          <button
            onClick={onExport}
            title="Export CSV"
            className="p-2 rounded-lg transition-colors"
            style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', color: '#737373', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4D4D4'; e.currentTarget.style.color = '#0A0A0A' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.color = '#737373' }}>
            <Download size={13} />
          </button>
        )}

        <a
          href="/app/settings"
          title="Settings"
          className="p-2 rounded-lg transition-colors no-underline hidden md:flex"
          style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', color: '#737373', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4D4D4'; e.currentTarget.style.color = '#0A0A0A' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.color = '#737373' }}>
          <Settings size={13} />
        </a>

        <button
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          className="p-2 rounded-lg transition-colors"
          style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', color: '#737373', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4D4D4'; e.currentTarget.style.color = '#0A0A0A' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.color = '#737373' }}>
          {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
        </button>

        <button
          onClick={handleRefresh}
          title="Refresh"
          className="p-2 rounded-lg transition-colors"
          style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', color: '#737373', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4D4D4'; e.currentTarget.style.color = '#0A0A0A' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.color = '#737373' }}>
          <RefreshCw size={13} className={spinning ? 'spin' : ''} />
        </button>

        {/* Auth: user menu or sign-in link */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
              style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', color: '#737373', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4D4D4'; e.currentTarget.style.color = '#0A0A0A' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.color = '#737373' }}
              title={user.email ?? 'Account'}
            >
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="" className="w-4 h-4 rounded-full" />
              ) : (
                <UserIcon size={12} />
              )}
              <span className="hidden md:inline max-w-[120px] truncate">{user.email}</span>
            </button>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-30 w-48 rounded-lg border bg-white shadow-lg" style={{ borderColor: '#E5E5E5' }}>
                  <div className="px-3 py-2 border-b text-xs text-gray-500 truncate" style={{ borderColor: '#F5F5F5' }}>
                    {user.email}
                  </div>
                  <button
                    onClick={() => { setShowUserMenu(false); signOut(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
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
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors no-underline"
            style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', color: '#737373', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4D4D4'; e.currentTarget.style.color = '#0A0A0A' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.color = '#737373' }}
          >
            <LogIn size={11} />
            Sign in
          </a>
        )}

        <button
          onClick={onAddWallet}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: '#0A0A0A', border: '1px solid #0A0A0A', color: '#FFFFFF', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#262626' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#0A0A0A' }}>
          <Plus size={12} />
          Add Wallet
        </button>
      </div>
    </header>
  )
}
