import { useState, useEffect, useCallback, useRef } from 'react'
import { smartFetch, CG_BASE } from '../lib/api'

const ALL_IDS = [
  'ethereum', 'solana', 'bitcoin',
  'usd-coin', 'tether',
  'wrapped-bitcoin', 'uniswap', 'chainlink', 'aave', 'lido-dao',
  'raydium', 'jupiter-exchange-solana', 'bonk',
  'arbitrum', 'gmx', 'aerodrome-finance',
  'matic-network', 'binancecoin', 'pancakeswap-token',
  'avalanche-2', 'joe', 'optimism',
].join(',')

export interface PriceData {
  id: string
  price: number
  change24h: number
  change7d: number
  marketCap: number
  volume24h: number
  image: string
  symbol: string
  name: string
  sparkline: number[]
}

const REFRESH_MS = 90_000

export function usePrices() {
  const [prices, setPrices] = useState<Record<string, PriceData>>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const timerRef = useRef<number | null>(null)

  const fetch_ = useCallback(async () => {
    try {
      const url = `${CG_BASE}/coins/markets?vs_currency=usd&ids=${ALL_IDS}&sparkline=true&price_change_percentage=24h,7d&order=market_cap_desc&per_page=50`
      const data = await smartFetch<Array<{
        id: string; current_price: number; price_change_percentage_24h: number;
        price_change_percentage_7d_in_currency: number; market_cap: number;
        total_volume: number; image: string; symbol: string; name: string;
        sparkline_in_7d: { price: number[] }
      }>>(url)

      const map: Record<string, PriceData> = {}
      for (const c of data) {
        map[c.id] = {
          id: c.id,
          price: c.current_price,
          change24h: c.price_change_percentage_24h ?? 0,
          change7d: c.price_change_percentage_7d_in_currency ?? 0,
          marketCap: c.market_cap,
          volume24h: c.total_volume,
          image: c.image,
          symbol: c.symbol.toUpperCase(),
          name: c.name,
          sparkline: c.sparkline_in_7d?.price ?? [],
        }
      }
      setPrices(map)
      setLastUpdated(new Date())
    } catch {
      // keep previous prices
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch_()
    timerRef.current = window.setInterval(fetch_, REFRESH_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [fetch_])

  // Build a simple id→price map
  const priceMap = Object.fromEntries(Object.entries(prices).map(([id, d]) => [id, d.price]))

  return { prices, priceMap, loading, lastUpdated, refetch: fetch_ }
}
