'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useProject, useUpdateProject } from '@/hooks/useProjects'
import { useAuth } from '@/hooks/useAuth'
import { AssignUserDialog } from '@/components/projects/AssignUserDialog'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { UserPlus, Phone, Mail, MapPin, Calendar, Pencil } from 'lucide-react'
import { formatDate, formatCurrency, formatPhone } from '@kalpak/shared'
import type { ProjectRoleInProject } from '@kalpak/shared'

const ROLE_LABELS: Record<ProjectRoleInProject, string> = {
  lead_partner: 'Lead Partner',
  supporting_partner: 'Supporting Partner',
  lead_employee: 'Lead Employee',
  supporting_employee: 'Supporting Employee',
}

const MILESTONES = [
  'Brief & Requirements',
  'Concept Design',
  'Design Development',
  'Execution',
  'Handover',
]

export default function ProjectOverviewPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useProject(id)
  const { isPartner } = useAuth()
  const [assignOpen, setAssignOpen] = useState(false)
  const [milestones, setMilestones] = useState<boolean[]>(Array(MILESTONES.length).fill(false))
  const updateProject = useUpdateProject(id)

  const project = data?.data
  const client = project?.clients
  const assignments = project?.project_assignments ?? []

  if (isLoading || !project) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="lg:col-span-2 space-y-4">
        {/* Project details card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Project Details
              <RoleGuard allowedRoles={['partner']}>
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
              </RoleGuard>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {project.project_type && (
                <div>
                  <p className="text-xs text-text-secondary">Type</p>
                  <p className="capitalize mt-0.5">{project.project_type.replace('_', ' ')}</p>
                </div>
              )}
              {project.city && (
                <div>
                  <p className="text-xs text-text-secondary">City</p>
                  <p className="mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-text-secondary" />
                    {project.city}
                  </p>
                </div>
              )}
              {project.total_budget && (
                <div>
                  <p className="text-xs text-text-secondary">Budget</p>
                  <p className="mt-0.5">{formatCurrency(project.total_budget)}</p>
                </div>
              )}
              {project.start_date && (
                <div>
                  <p className="text-xs text-text-secondary">Start Date</p>
                  <p className="mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                    {formatDate(project.start_date)}
                  </p>
                </div>
              )}
              {project.expected_end_date && (
                <div>
                  <p className="text-xs text-text-secondary">Expected End</p>
                  <p className="mt-0.5">{formatDate(project.expected_end_date)}</p>
                </div>
              )}
            </div>
            {project.address && (
              <div>
                <p className="text-xs text-text-secondary">Address</p>
                <p className="text-sm mt-0.5">{project.address}</p>
              </div>
            )}
            {project.description && (
              <div>
                <p className="text-xs text-text-secondary">Description</p>
                <p className="text-sm mt-0.5 text-text-secondary">{project.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Project Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {MILESTONES.map((milestone, i) => (
                <label
                  key={milestone}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                    isPartner ? 'hover:bg-muted/50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={milestones[i]}
                    disabled={!isPartner}
                    onChange={(e) => {
                      const next = [...milestones]
                      next[i] = e.target.checked
                      setMilestones(next)
                    }}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className={`text-sm ${milestones[i] ? 'line-through text-text-secondary' : ''}`}>
                    {milestone}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Team */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Team Members
              <RoleGuard allowedRoles={['partner']}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setAssignOpen(true)}
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add
                </Button>
              </RoleGuard>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-3">No team members assigned</p>
            ) : (
              <div className="space-y-2">
                {assignments.map((a) => {
                  const name = a.profiles?.full_name ?? 'Unknown'
                  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                  return (
                    <div key={a.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{name}</p>
                        {a.role_in_project && (
                          <p className="text-xs text-text-secondary">
                            {ROLE_LABELS[a.role_in_project as ProjectRoleInProject] ?? a.role_in_project}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client info */}
        {client && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium text-sm">{client.full_name}</p>
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {formatPhone(client.phone)}
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Publish to website */}
        <RoleGuard allowedRoles={['partner']}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Public Website</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  checked={project.is_published}
                  onChange={async (e) => {
                    await updateProject.mutateAsync({ is_published: e.target.checked })
                  }}
                />
                <div>
                  <p className="text-sm font-medium">
                    {project.is_published ? 'Published on website' : 'Not published'}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {project.is_published
                      ? 'Visible on /portfolio'
                      : 'Toggle to show on public portfolio'}
                  </p>
                </div>
              </label>
            </CardContent>
          </Card>
        </RoleGuard>
      </div>

      <AssignUserDialog
        projectId={id}
        alreadyAssigned={assignments.map((a) => a.user_id)}
        open={assignOpen}
        onOpenChange={setAssignOpen}
      />
    </div>
  )
}
