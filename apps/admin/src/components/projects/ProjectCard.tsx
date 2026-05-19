'use client'

import Link from 'next/link'
import { formatDate, formatDistanceToNow } from 'date-fns'
import { MapPin, Users, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProjectStatusBadge } from './ProjectStatusBadge'
import type { ProjectWithRelations } from '@/hooks/useProjects'

interface ProjectCardProps {
  project: ProjectWithRelations
}

export function ProjectCard({ project }: ProjectCardProps) {
  const teamCount = project.project_assignments?.length ?? 0
  const client = project.clients

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="border-border hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <h3 className="font-medium text-text-primary truncate">{project.name}</h3>
              {client && (
                <p className="text-sm text-text-secondary truncate mt-0.5">{client.full_name}</p>
              )}
            </div>
            <ProjectStatusBadge status={project.status} />
          </div>

          {project.city && (
            <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-2">
              <MapPin className="w-3 h-3 shrink-0" />
              {project.city}
            </div>
          )}

          {project.project_type && (
            <Badge variant="secondary" className="text-xs mb-3">
              {project.project_type.replace('_', ' ')}
            </Badge>
          )}

          <div className="flex items-center gap-3 text-xs text-text-secondary pt-3 border-t border-border">
            {project.start_date && (
              <span>{formatDate(new Date(project.start_date), 'MMM yyyy')}</span>
            )}
            {project.start_date && project.expected_end_date && <span>→</span>}
            {project.expected_end_date && (
              <span>{formatDate(new Date(project.expected_end_date), 'MMM yyyy')}</span>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {teamCount} {teamCount === 1 ? 'member' : 'members'}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
