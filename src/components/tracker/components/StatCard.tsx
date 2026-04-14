import { fmtPct } from '../lib/formatters'

interface StatCardProps {
  label: string
  value: string
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  loading?: boolean
}

const cardStyle = {
  background: '#FFFFFF',
  border: '1px solid #E5E5E5',
  borderRadius: '12px',
}

export function StatCard({ label, value, change, changeLabel, icon, loading = false }: StatCardProps) {
  if (loading) {
    return (
      <div className="p-4" style={cardStyle}>
        <div className="skeleton h-2.5 w-20 mb-3" />
        <div className="skeleton h-6 w-28 mb-2" />
        <div className="skeleton h-2.5 w-16" />
      </div>
    )
  }

  const isPos = (change ?? 0) >= 0

  return (
    <div className="p-4 transition-colors" style={cardStyle}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#A3A3A3' }}>{label}</p>
        {icon && <span style={{ color: '#A3A3A3' }}>{icon}</span>}
      </div>
      <p className="text-xl font-bold font-['JetBrains_Mono'] text-[#0A0A0A] mb-1">{value}</p>
      {change !== undefined && (
        <p className="text-xs font-medium flex items-center gap-1" style={{ color: isPos ? '#22C55E' : '#EF4444' }}>
          {isPos ? '↑' : '↓'} {fmtPct(Math.abs(change))}
          {changeLabel && <span className="ml-0.5" style={{ color: '#A3A3A3' }}>{changeLabel}</span>}
        </p>
      )}
    </div>
  )
}
