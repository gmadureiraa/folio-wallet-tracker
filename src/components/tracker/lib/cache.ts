// Portfolio data cache — show instant results on load, refresh in background
const PORTFOLIO_CACHE_KEY = "folio-portfolio-cache"
const PORTFOLIO_TTL = 5 * 60 * 1000 // 5 minutes

// Prices cache — avoid CoinGecko rate limits
const PRICES_CACHE_KEY = "folio-prices-cache"
const PRICES_TTL = 2 * 60 * 1000 // 2 minutes

interface CachedData<T> {
  data: T
  timestamp: number
}

// ── Generic helpers ──

function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const cached: CachedData<T> = JSON.parse(raw)
    return cached.data
  } catch {
    return null
  }
}

function isCacheStale(key: string, ttl: number): boolean {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return true
    const cached: CachedData<unknown> = JSON.parse(raw)
    return Date.now() - cached.timestamp > ttl
  } catch {
    return true
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const cached: CachedData<T> = { data, timestamp: Date.now() }
    localStorage.setItem(key, JSON.stringify(cached))
  } catch {
    // localStorage might be full, ignore
  }
}

// ── Portfolio cache ──

export function getCachedPortfolio<T>(): T | null {
  return getCache<T>(PORTFOLIO_CACHE_KEY)
}

export function isPortfolioCacheStale(): boolean {
  return isCacheStale(PORTFOLIO_CACHE_KEY, PORTFOLIO_TTL)
}

export function setCachedPortfolio<T>(data: T): void {
  setCache(PORTFOLIO_CACHE_KEY, data)
}

// ── Prices cache ──

export function getCachedPrices<T>(): T | null {
  return getCache<T>(PRICES_CACHE_KEY)
}

export function isPricesCacheStale(): boolean {
  return isCacheStale(PRICES_CACHE_KEY, PRICES_TTL)
}

export function setCachedPrices<T>(data: T): void {
  setCache(PRICES_CACHE_KEY, data)
}
