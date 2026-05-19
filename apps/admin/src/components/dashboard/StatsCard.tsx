import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  subtitle?: string
  className?: string
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp, subtitle, className }: StatsCardProps) {
  return (
    <Card className={cn('border-border', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-medium text-text-primary mt-1.5">{value}</p>
            {subtitle && (
              <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className={cn('text-xs mt-1', trendUp ? 'text-success' : 'text-danger')}>
                {trendUp ? '↑' : '↓'} {trend}
              </p>
            )}
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
