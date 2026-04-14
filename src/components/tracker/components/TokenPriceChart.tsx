import { useState, useEffect } from 'react'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { smartFetch, CG_BASE } from '../lib/api'

interface Props {
  cgId: string
  days?: number
  height?: number
  color?: string
}

export function TokenPriceChart({ cgId, days = 7, height = 60 }: Props) {
  const [data, setData] = useState<{ date: string; price: number }[]>([])

  useEffect(() => {
    if (!cgId) return
    let cancelled = false

    // Check localStorage cache
    const cacheKey = `chart-${cgId}-${days}`
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const { data: d, ts } = JSON.parse(cached)
        if (Date.now() - ts < 30 * 60 * 1000) { // 30 min cache
          setData(d)
          return
        }
      }
    } catch { /* ignore */ }

    smartFetch<{ prices: [number, number][] }>(
      `${CG_BASE}/coins/${cgId}/market_chart?vs_currency=usd&days=${days}`
    ).then(result => {
      if (cancelled) return
      const points = (result.prices || []).map(([ts, price]) => ({
        date: new Date(ts).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        price,
      }))
      setData(points)
      try { localStorage.setItem(cacheKey, JSON.stringify({ data: points, ts: Date.now() })) } catch { /* ignore */ }
    }).catch(() => { /* silent */ })

    return () => { cancelled = true }
  }, [cgId, days])

  if (data.length < 2) return null

  const isPositive = data[data.length - 1].price >= data[0].price

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`grad-${cgId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? '#22C55E' : '#EF4444'} stopOpacity={0.15} />
            <stop offset="100%" stopColor={isPositive ? '#22C55E' : '#EF4444'} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="price"
          stroke={isPositive ? '#22C55E' : '#EF4444'}
          strokeWidth={1.5}
          fill={`url(#grad-${cgId})`}
        />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 11 }}
          formatter={(v: unknown) => [`$${Number(v).toLocaleString('en', { maximumFractionDigits: 2 })}`, 'Price']}
          labelFormatter={(l) => l}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
