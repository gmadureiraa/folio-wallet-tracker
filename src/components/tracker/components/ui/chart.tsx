import * as React from 'react'
import * as RechartsPrimitive from 'recharts'
import { cn } from '../../lib/utils'

export type ChartConfig = {
  [k: string]: { label?: React.ReactNode; color?: string }
}

type ChartContextProps = { config: ChartConfig }
const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const ctx = React.useContext(ChartContext)
  if (!ctx) throw new Error('useChart must be inside ChartContainer')
  return ctx
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { config: ChartConfig; children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'] }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn('flex aspect-video justify-center text-xs', className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = 'ChartContainer'

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const cssVars = Object.entries(config)
    .filter(([, cfg]) => cfg.color)
    .map(([k, cfg]) => `--color-${k}: ${cfg.color}`)
    .join(';')

  if (!cssVars) return null
  return <style>{`[data-chart="${id}"] { ${cssVars} }`}</style>
}

const ChartTooltip = RechartsPrimitive.Tooltip

interface ChartTooltipContentProps extends React.ComponentProps<'div'> {
  active?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[]
  hideLabel?: boolean
  labelKey?: string
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ active, payload, className, hideLabel = false, labelKey }, ref) => {
    if (!active || !payload?.length) return null

    return (
      <div
        ref={ref}
        className={cn('rounded-lg border px-3 py-2 shadow-sm text-xs', className)}
        style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', color: '#0A0A0A' }}
      >
        {!hideLabel && payload[0]?.payload && labelKey && (
          <p className='mb-1 font-medium' style={{ color: '#737373' }}>
            {payload[0].payload[labelKey]}
          </p>
        )}
        <div className='flex flex-col gap-1'>
          {payload.map((item: { color?: string; stroke?: string; name?: string; value?: number }, i: number) => (
            <div key={i} className='flex items-center justify-between gap-4'>
              <div className='flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full inline-block' style={{ background: item.color ?? item.stroke ?? '#fff' }} />
                <span style={{ color: '#737373' }}>{item.name}</span>
              </div>
              <span className='font-mono font-medium'>{item.value?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = 'ChartTooltipContent'

export { ChartContainer, ChartTooltip, ChartTooltipContent, useChart }
