import { useState, useEffect, useCallback } from 'react'
import { smartFetch, YIELDS_BASE, LLAMA_BASE } from '../lib/api'
import type { YieldPool, Protocol } from '../types'

export function useDefiData() {
  const [yields, setYields] = useState<YieldPool[]>([])
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [yieldRes, protocolRes] = await Promise.allSettled([
        smartFetch<{ data: YieldPool[] }>(`${YIELDS_BASE}/pools`),
        smartFetch<Protocol[]>(`${LLAMA_BASE}/protocols`),
      ])
      if (yieldRes.status === 'fulfilled') setYields(yieldRes.value.data.slice(0, 500))
      if (protocolRes.status === 'fulfilled') setProtocols(protocolRes.value.slice(0, 200))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { yields, protocols, loading }
}
