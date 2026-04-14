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

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className="rounded-2xl px-5 py-4 shadow-2xl min-w-[320px] max-w-[420px]"
        style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">{title}</span>
          <span className="text-xs font-mono tabular-nums text-white/40">
            {doneCount} of {steps.length}
          </span>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5 mb-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-1.5 flex-1">
              <div className="shrink-0">
                {step.status === 'done' ? (
                  <div className="w-7 h-7 rounded-full bg-[#3B82F6] flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                ) : step.status === 'active' ? (
                  <div className="w-7 h-7 rounded-full border-2 border-[#3B82F6] bg-[#3B82F6]/10 flex items-center justify-center">
                    <Loader2 size={12} className="text-[#3B82F6] animate-spin" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full border-2 border-white/15 flex items-center justify-center">
                    <Circle size={8} className="text-white/15" />
                  </div>
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className="h-0.5 flex-1 rounded-full transition-colors duration-500"
                  style={{ background: step.status === 'done' ? '#3B82F6' : 'rgba(255,255,255,0.08)' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Status text */}
        <p className="text-xs text-white/50">{statusText}</p>
      </div>
    </div>
  )
}
