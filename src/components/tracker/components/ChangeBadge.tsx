import { fmtPct } from '../lib/formatters'

interface ChangeBadgeProps {
  value: number
  size?: 'sm' | 'md'
}

export function ChangeBadge({ value, size = 'sm' }: ChangeBadgeProps) {
  const isPos = value > 0
  const isNeu = value === 0
  const color  = isNeu ? '#8C8C96' : isPos ? '#22C55E' : '#EF4444'
  const bg     = isNeu ? '#F5F5F5' : isPos ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'
  const px     = size === 'md' ? 'px-2.5 py-1' : 'px-2 py-0.5'

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${px} rounded text-xs font-medium font-['JetBrains_Mono']`}
      style={{ background: bg, color }}
    >
      {isPos ? '↑' : isNeu ? '' : '↓'} {fmtPct(Math.abs(value))}
    </span>
  )
}
