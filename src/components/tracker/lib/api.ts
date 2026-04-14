export const CG_KEY = 'CG-iuodFFDsn7UWXuwggZjPpGbp'
export const CG_BASE = 'https://api.coingecko.com/api/v3'
export const LLAMA_BASE = 'https://api.llama.fi'
export const YIELDS_BASE = 'https://yields.llama.fi'
export const FNG_URL = 'https://api.alternative.me/fng/?limit=30'
export const POLYMARKET_URL =
  'https://gamma-api.polymarket.com/markets?closed=false&limit=20'

// New data sources
export const MEMPOOL_BASE = 'https://mempool.space/api'
export const BEACON_BASE = 'https://beaconcha.in/api/v1'
export const BLOCKNATIVE_GAS_URL = 'https://api.blocknative.com/gasprices/blockprices'
export const LLAMA_DEX_URL = 'https://api.llama.fi/overview/dexs?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true'
export const LLAMA_FEES_URL = 'https://api.llama.fi/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true'
export const LLAMA_BRIDGES_URL = 'https://bridges.llama.fi/bridges'
export const LLAMA_RAISES_URL = 'https://api.llama.fi/raises'
export const LLAMA_STABLES_URL = 'https://stablecoins.llama.fi/stablecoins?includePrices=true'

const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://proxy.cors.sh/${url}`,
]

export async function smartFetch<T>(url: string): Promise<T> {
  // Try direct first
  try {
    const res = await fetch(url, {
      headers: url.includes('coingecko')
        ? { 'x-cg-demo-api-key': CG_KEY }
        : {},
      signal: AbortSignal.timeout(10000),
    })
    if (res.ok) {
      const data = await res.json()
      return data as T
    }
  } catch {
    // Fall through to proxies
  }

  // Try CORS proxies
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = proxy(url)
      const res = await fetch(proxyUrl, {
        signal: AbortSignal.timeout(12000),
      })
      if (res.ok) {
        const data = await res.json()
        return data as T
      }
    } catch {
      // Try next proxy
    }
  }

  throw new Error(`Failed to fetch: ${url}`)
}
