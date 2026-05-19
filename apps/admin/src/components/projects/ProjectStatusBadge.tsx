import { Badge } from '@/components/ui/badge'
import type { ProjectStatus } from '@kalpak/shared'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  lead: { label: 'Lead', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_progress: { label: 'In Progress', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  snagging: { label: 'Snagging', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  completed: { label: 'Completed', className: 'bg-green-50 text-green-700 border-green-200' },
  on_hold: { label: 'On Hold', className: 'bg-red-50 text-red-700 border-red-200' },
}

interface ProjectStatusBadgeProps {
  status: ProjectStatus
  className?: string
}

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.lead
  return (
    <Badge
      variant="outline"
      className={cn('capitalize text-xs font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
