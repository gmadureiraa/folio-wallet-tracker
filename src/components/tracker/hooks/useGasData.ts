import { useState, useEffect, useCallback, useRef } from 'react'
import { smartFetch, MEMPOOL_BASE } from '../lib/api'
import type { GasEstimate, ChainId } from '../types'

const GAS_LIMIT_ETH = 21000
const GWEI_TO_ETH = 1e-9

function buildEstimate(slow: number, std: number, fast: number, instant: number, baseFee: number | undefined, ethPrice: number, unit: 'gwei' | 'microlamport'): GasEstimate {
  function cost(gwei: number) {
    if (unit === 'microlamport') return gwei * 0.000001 * 0.000000001 * 100_000_000_000  // approx
    return gwei * GAS_LIMIT_ETH * GWEI_TO_ETH * ethPrice
  }
  return {
    slow, standard: std, fast, instant,
    baseFeeGwei: baseFee,
    unit,
    usdPerTx: { slow: cost(slow), standard: cost(std), fast: cost(fast), instant: cost(instant) },
    updatedAt: Date.now(),
  }
}

function buildSolana(): GasEstimate {
  return {
    slow: 1000, standard: 5000, fast: 50000, instant: 200000,
    unit: 'microlamport',
    usdPerTx: { slow: 0.00002, standard: 0.0001, fast: 0.001, instant: 0.005 },
    updatedAt: Date.now(),
  }
}

export function useGasData(ethPrice = 3200) {
  const [gasEstimates, setGasEstimates] = useState<Partial<Record<ChainId, GasEstimate>>>({})
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<number | null>(null)

  const fetchGas = useCallback(async () => {
    let slow = 8, std = 12, fast = 20, instant = 35, base = 10

    try {
      const data = await smartFetch<{ slow: number; standard?: number; fast: number; rapid?: number }>(
        `${MEMPOOL_BASE}/v1/fees/recommended`
      )
      slow = data.slow ?? 8
      std = data.standard ?? data.fast ?? 12
      fast = data.fast ?? 20
      instant = data.rapid ?? 35
    } catch { /* use defaults */ }

    const estimates: Partial<Record<ChainId, GasEstimate>> = {
      ethereum: buildEstimate(slow, std, fast, instant, base, ethPrice, 'gwei'),
      solana: buildSolana(),
      base: buildEstimate(0.001, 0.002, 0.005, 0.01, undefined, ethPrice, 'gwei'),
      arbitrum: buildEstimate(0.01, 0.02, 0.05, 0.1, undefined, ethPrice, 'gwei'),
      polygon: buildEstimate(30, 50, 80, 120, undefined, ethPrice, 'gwei'),
      bsc: buildEstimate(1, 3, 5, 8, undefined, ethPrice, 'gwei'),
      avalanche: buildEstimate(25, 35, 50, 75, undefined, ethPrice, 'gwei'),
      optimism: buildEstimate(0.001, 0.002, 0.005, 0.01, undefined, ethPrice, 'gwei'),
    }

    setGasEstimates(estimates)
    setLoading(false)
  }, [ethPrice])

  useEffect(() => {
    fetchGas()
    timerRef.current = window.setInterval(fetchGas, 30_000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [fetchGas])

  return { gasEstimates, loading, refetch: fetchGas }
}
