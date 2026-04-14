import { useState, useEffect, useCallback } from 'react'
import { smartFetch, CG_BASE } from '../lib/api'

export interface PricePoint {
  timestamp: number
  price: number
  date: string
}

const CACHE_KEY = 'wallet-tracker-price-history'
const CACHE_TTL = 30 * 60 * 1000 // 30 min

function getCached(cgId: string, days: number): PricePoint[] | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}-${cgId}-${days}`)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch { return null }
}

function setCache(cgId: string, days: number, data: PricePoint[]) {
  try {
    localStorage.setItem(`${CACHE_KEY}-${cgId}-${days}`, JSON.stringify({ data, ts: Date.now() }))
  } catch { /* ignore */ }
}

export function usePriceHistory(cgId: string, days: number = 30) {
  const [data, setData] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!cgId) return

    // Check cache first
    const cached = getCached(cgId, days)
    if (cached) { setData(cached); return }

    setLoading(true)
    try {
      const result = await smartFetch<{ prices: [number, number][] }>(
        `${CG_BASE}/coins/${cgId}/market_chart?vs_currency=usd&days=${days}`
      )

      const points: PricePoint[] = (result.prices || []).map(([ts, price]) => ({
        timestamp: ts,
        price,
        date: new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      }))

      setData(points)
      setCache(cgId, days, points)
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [cgId, days])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, refetch: fetch }
}

// Fetch multiple token histories at once (for portfolio chart)
export function usePortfolioHistory(tokenIds: string[], days: number = 30) {
  const [data, setData] = useState<Record<string, PricePoint[]>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tokenIds.length === 0) return
    let cancelled = false

    async function fetchAll() {
      setLoading(true)
      const result: Record<string, PricePoint[]> = {}

      // Fetch in parallel, max 3 at a time
      const chunks: string[][] = []
      for (let i = 0; i < tokenIds.length; i += 3) {
        chunks.push(tokenIds.slice(i, i + 3))
      }

      for (const chunk of chunks) {
        const promises = chunk.map(async (id) => {
          const cached = getCached(id, days)
          if (cached) { result[id] = cached; return }

          try {
            const res = await smartFetch<{ prices: [number, number][] }>(
              `${CG_BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
            )
            const points: PricePoint[] = (res.prices || []).map(([ts, price]) => ({
              timestamp: ts,
              price,
              date: new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            }))
            result[id] = points
            setCache(id, days, points)
          } catch { /* skip */ }
        })
        await Promise.allSettled(promises)
      }

      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [tokenIds.join(','), days])

  return { data, loading }
}
