import { CheckCircle2, Loader2, Circle } from 'lucide-react'

export interface ScanStep {
  label: string
  status: 'done' | 'active' | 'pending'
}

interface Props {
  title: string
  steps: ScanStep[]
  statusText: string
  visible: boolean
}

export function ScanProgress({ title, steps, statusText, visible }: Props) {
  if (!visible) return null

  const doneCount = steps.filter(s => s.status === 'done').length
  const allDone = doneCount === steps.length

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className="rounded-2xl px-6 py-5 shadow-2xl min-w-[340px] max-w-[440px]"
        style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <img src="/folio-logo-icon.png" className="w-5 h-5" alt="" />
            <span className="text-sm font-semibold text-white font-serif">{title}</span>
          </div>
          <span className="text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full" style={{ background: allDone ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)', color: allDone ? '#22C55E' : 'rgba(255,255,255,0.4)' }}>
            {doneCount}/{steps.length}
          </span>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-1.5 flex-1">
              <div className="shrink-0">
                {step.status === 'done' ? (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#22C55E' }}>
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                ) : step.status === 'active' ? (
                  <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#22C55E', background: 'rgba(34,197,94,0.1)' }}>
                    <Loader2 size={12} className="animate-spin" style={{ color: '#22C55E' }} />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full border-2 border-white/10 flex items-center justify-center">
                    <Circle size={8} className="text-white/10" />
                  </div>
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className="h-0.5 flex-1 rounded-full transition-colors duration-500"
                  style={{ background: step.status === 'done' ? '#22C55E' : 'rgba(255,255,255,0.06)' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Status text */}
        <p className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{statusText}</p>
      </div>
    </div>
  )
}
