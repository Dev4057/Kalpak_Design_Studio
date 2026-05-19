import { Badge } from '@/components/ui/badge'
import type { WorkerTrade } from '@kalpak/shared'
import { cn } from '@/lib/utils'

const TRADE_CONFIG: Record<WorkerTrade, { label: string; className: string }> = {
  electrician: { label: 'Electrician', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  plumber: { label: 'Plumber', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  carpenter: { label: 'Carpenter', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  painter: { label: 'Painter', className: 'bg-green-50 text-green-700 border-green-200' },
  mason: { label: 'Mason', className: 'bg-stone-50 text-stone-700 border-stone-200' },
  tiler: { label: 'Tiler', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  fabricator: { label: 'Fabricator', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  false_ceiling: { label: 'False Ceiling', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  ac_hvac: { label: 'AC/HVAC', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  glass_works: { label: 'Glass Works', className: 'bg-teal-50 text-teal-700 border-teal-200' },
  polisher: { label: 'Polisher', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  general_labour: { label: 'General Labour', className: 'bg-gray-50 text-gray-700 border-gray-200' },
  supervisor: { label: 'Supervisor', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  other: { label: 'Other', className: 'bg-gray-50 text-gray-600 border-gray-200' },
}

interface WorkerTradeBadgeProps {
  trade: WorkerTrade
  className?: string
}

export function WorkerTradeBadge({ trade, className }: WorkerTradeBadgeProps) {
  const config = TRADE_CONFIG[trade] ?? TRADE_CONFIG.other
  return (
    <Badge variant="outline" className={cn('text-xs', config.className, className)}>
      {config.label}
    </Badge>
  )
}
