import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'defi-radar-watchlist'

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist))
    } catch {}
  }, [watchlist])

  const toggle = useCallback((coinId: string) => {
    setWatchlist(prev =>
      prev.includes(coinId) ? prev.filter(id => id !== coinId) : [...prev, coinId]
    )
  }, [])

  const isWatched = useCallback((coinId: string) => watchlist.includes(coinId), [watchlist])

  return { watchlist, toggle, isWatched }
}
