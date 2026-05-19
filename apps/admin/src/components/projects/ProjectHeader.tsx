'use client'

import { MapPin, ChevronDown } from 'lucide-react'
import { ProjectStatusBadge } from './ProjectStatusBadge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { useUpdateProject } from '@/hooks/useProjects'
import type { ProjectWithRelations } from '@/hooks/useProjects'
import type { ProjectStatus } from '@kalpak/shared'

const STATUSES: ProjectStatus[] = ['lead', 'confirmed', 'in_progress', 'snagging', 'completed', 'on_hold']

interface ProjectHeaderProps {
  project: ProjectWithRelations
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const updateProject = useUpdateProject(project.id)

  function handleStatusChange(status: ProjectStatus) {
    updateProject.mutate({ status })
  }

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-text-primary">{project.name}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {project.clients && (
              <span className="text-sm text-text-secondary">{project.clients.full_name}</span>
            )}
            {project.city && (
              <span className="flex items-center gap-1 text-sm text-text-secondary">
                <MapPin className="w-3.5 h-3.5" />
                {project.city}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <RoleGuard allowedRoles={['partner']}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ProjectStatusBadge status={project.status} className="border-0 p-0 bg-transparent font-normal" />
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {STATUSES.map((s) => (
                  <DropdownMenuItem key={s} onClick={() => handleStatusChange(s)}>
                    <ProjectStatusBadge status={s} className="border-0 bg-transparent" />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </RoleGuard>
        </div>
      </div>

      {/* Team avatars */}
      {project.project_assignments && project.project_assignments.length > 0 && (
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-text-secondary">Team:</span>
          <div className="flex -space-x-2">
            {project.project_assignments.slice(0, 5).map((a) => {
              const name = a.profiles?.full_name ?? 'Unknown'
              const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
              return (
                <Avatar key={a.id} className="h-7 w-7 border-2 border-white" title={name}>
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )
            })}
            {project.project_assignments.length > 5 && (
              <Avatar className="h-7 w-7 border-2 border-white">
                <AvatarFallback className="text-[10px] bg-muted text-text-secondary">
                  +{project.project_assignments.length - 5}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
