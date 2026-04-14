import { useState, useCallback, useMemo } from 'react'
import type { TrackedWallet, ChainId } from '../types'

const STORAGE_KEY = 'wallet-tracker-wallets'

const WALLET_COLORS = [
  '#627EEA', '#9945FF', '#0052FF', '#12AAFF',
  '#8247E5', '#F3BA2F', '#E84142', '#FF0420',
  '#22C55E', '#F59E0B', '#EC4899', '#14B8A6',
]

function loadWallets(): TrackedWallet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as TrackedWallet[]
  } catch { /* ignore */ }
  return []
}

function saveWallets(wallets: TrackedWallet[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets)) } catch { /* ignore */ }
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function useWallets() {
  const [wallets, setWallets] = useState<TrackedWallet[]>(loadWallets)

  const addWallet = useCallback((address: string, label: string, chain: ChainId) => {
    setWallets(prev => {
      const color = WALLET_COLORS[prev.length % WALLET_COLORS.length]
      const wallet: TrackedWallet = {
        id: generateId(),
        address: address.trim(),
        label: label.trim() || `Wallet ${prev.length + 1}`,
        chain,
        addedAt: Date.now(),
        color,
      }
      const next = [...prev, wallet]
      saveWallets(next)
      return next
    })
  }, [])

  const removeWallet = useCallback((id: string) => {
    setWallets(prev => {
      const next = prev.filter(w => w.id !== id)
      saveWallets(next)
      return next
    })
  }, [])

  const updateWallet = useCallback((id: string, updates: Partial<Pick<TrackedWallet, 'label' | 'chain'>>) => {
    setWallets(prev => {
      const next = prev.map(w => w.id === id ? { ...w, ...updates } : w)
      saveWallets(next)
      return next
    })
  }, [])

  const totalWallets = wallets.length

  // chain breakdown
  const chainBreakdown = useMemo(() => {
    const map: Partial<Record<ChainId, number>> = {}
    for (const w of wallets) {
      map[w.chain] = (map[w.chain] ?? 0) + 1
    }
    return map
  }, [wallets])

  return { wallets, addWallet, removeWallet, updateWallet, totalWallets, chainBreakdown }
}
