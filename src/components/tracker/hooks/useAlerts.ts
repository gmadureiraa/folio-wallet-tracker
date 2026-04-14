import { useState, useCallback, useEffect } from 'react'
import type { AlertRule, AlertType, Coin, GasNow, MempoolStats, FearGreed } from '../types'

const STORAGE_KEY = 'defi-radar-alerts'
const DEBOUNCE_MS = 60_000 // min 1min between same alert firing

function loadRules(): AlertRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveRules(rules: AlertRule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function useAlerts() {
  const [rules, setRules] = useState<AlertRule[]>(loadRules)
  const [triggered, setTriggered] = useState<AlertRule[]>([])

  // Persist on change
  useEffect(() => { saveRules(rules) }, [rules])

  const addRule = useCallback((type: AlertType, label: string, threshold: number, extra?: Pick<AlertRule, 'assetId' | 'assetSymbol'>) => {
    setRules(prev => [...prev, {
      id: uid(), type, label, threshold,
      assetId: extra?.assetId,
      assetSymbol: extra?.assetSymbol,
      enabled: true,
    }])
  }, [])

  const removeRule = useCallback((id: string) => {
    setRules(prev => prev.filter(r => r.id !== id))
  }, [])

  const toggleRule = useCallback((id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }, [])

  // Check alerts against current data
  const checkAlerts = useCallback((
    coins: Coin[],
    gasNow: GasNow | null,
    mempoolStats: MempoolStats | null,
    fearGreed: FearGreed | null,
  ) => {
    const now = Date.now()
    const fired: AlertRule[] = []

    setRules(prev => prev.map(rule => {
      if (!rule.enabled) return rule
      if (rule.lastTriggered && now - rule.lastTriggered < DEBOUNCE_MS) return rule

      let shouldFire = false

      if (rule.type === 'price_above' || rule.type === 'price_below') {
        const coin = coins.find(c => c.id === rule.assetId)
        if (coin) {
          if (rule.type === 'price_above') shouldFire = coin.current_price >= rule.threshold
          else                             shouldFire = coin.current_price <= rule.threshold
        }
      } else if (rule.type === 'gas_above' && gasNow) {
        shouldFire = gasNow.fast >= rule.threshold
      } else if (rule.type === 'mempool_above' && mempoolStats) {
        shouldFire = mempoolStats.count >= rule.threshold
      } else if (rule.type === 'fng_above' && fearGreed) {
        shouldFire = parseInt(fearGreed.value) >= rule.threshold
      } else if (rule.type === 'fng_below' && fearGreed) {
        shouldFire = parseInt(fearGreed.value) <= rule.threshold
      }

      if (shouldFire) {
        fired.push(rule)
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`⚡ DeFi Radar Alert`, {
            body: rule.label,
            icon: '/favicon.ico',
          })
        }
        return { ...rule, lastTriggered: now }
      }
      return rule
    }))

    if (fired.length > 0) setTriggered(fired)
  }, [])

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])

  const clearTriggered = useCallback(() => setTriggered([]), [])

  return { rules, addRule, removeRule, toggleRule, checkAlerts, triggered, clearTriggered, requestPermission }
}
