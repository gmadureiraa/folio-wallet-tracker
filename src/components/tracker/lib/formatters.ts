export function fmtUSD(n: number, compact = false): string {
  if (isNaN(n) || n === null || n === undefined) return '$0.00'

  if (compact) {
    if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
    if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(2)}K`
    return `$${n.toFixed(2)}`
  }

  if (n >= 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n)
  }

  // Small prices (crypto)
  if (n >= 0.01) return `$${n.toFixed(4)}`
  if (n >= 0.0001) return `$${n.toFixed(6)}`
  return `$${n.toExponential(4)}`
}

export function fmtPct(n: number): string {
  if (isNaN(n) || n === null || n === undefined) return '0.00%'
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

export function pctClass(n: number): string {
  if (n > 0) return 'text-[#22C55E]'
  if (n < 0) return 'text-[#EF4444]'
  return 'text-[#737373]'
}

export function fmtNumber(n: number, compact = true): string {
  if (isNaN(n) || n === null || n === undefined) return '0'
  if (compact) {
    if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(2)}T`
    if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`
    if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`
    if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  }
  return n.toLocaleString('en-US')
}
