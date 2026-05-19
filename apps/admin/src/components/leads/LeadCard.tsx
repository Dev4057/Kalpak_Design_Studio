'use client'

import { formatDistanceToNow } from 'date-fns'
import { Phone, MapPin, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPhone } from '@kalpak/shared'
import type { Lead } from '@kalpak/shared'
import { cn } from '@/lib/utils'

interface LeadCardProps {
  lead: Lead
  onClick?: () => void
  isDragging?: boolean
  onDragStart?: (e: React.DragEvent) => void
}

export function LeadCard({ lead, onClick, isDragging, onDragStart }: LeadCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={cn(
        'bg-white border border-border rounded-lg p-3 cursor-pointer hover:shadow-sm transition-all select-none',
        isDragging && 'opacity-50 rotate-1 shadow-lg'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-sm text-text-primary leading-tight">{lead.full_name}</p>
        <Badge
          variant="outline"
          className={cn(
            'text-[10px] shrink-0',
            lead.status === 'new'
              ? 'bg-primary/10 text-primary border-primary/20'
              : lead.status === 'converted'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-muted text-text-secondary border-border'
          )}
        >
          {lead.status}
        </Badge>
      </div>

      <div className="space-y-1">
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary"
          >
            <Phone className="w-3 h-3" />
            {formatPhone(lead.phone)}
          </a>
        )}
        {lead.city && (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <MapPin className="w-3 h-3" />
            {lead.city}
            {lead.project_type && ` · ${lead.project_type}`}
          </div>
        )}
      </div>

      {lead.budget_range && (
        <Badge variant="secondary" className="text-[10px] mt-2">{lead.budget_range}</Badge>
      )}

      <div className="flex items-center gap-1 mt-2 text-[10px] text-text-secondary">
        <Clock className="w-3 h-3" />
        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
      </div>
    </div>
  )
}
