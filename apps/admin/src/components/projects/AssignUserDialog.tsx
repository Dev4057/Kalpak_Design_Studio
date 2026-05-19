'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useAssignUser } from '@/hooks/useProjects'
import { api } from '@/lib/api-client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { Profile, ProjectRoleInProject } from '@kalpak/shared'
import { Search } from 'lucide-react'

interface AssignUserDialogProps {
  projectId: string
  alreadyAssigned: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignUserDialog({ projectId, alreadyAssigned, open, onOpenChange }: AssignUserDialogProps) {
  const { accessToken } = useAuth()
  const assignUser = useAssignUser(projectId)
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [role, setRole] = useState<ProjectRoleInProject>('supporting_employee')

  const { data } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => api.get<{ data: Profile[] }>('/api/auth/profiles', accessToken),
    enabled: !!accessToken && open,
  })

  const profiles = (data?.data ?? []).filter(
    (p) => !alreadyAssigned.includes(p.id) &&
      p.full_name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAssign() {
    if (!selectedUserId) return
    await assignUser.mutateAsync({ user_id: selectedUserId, role_in_project: role })
    onOpenChange(false)
    setSelectedUserId('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Team Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 border rounded-md p-1">
            {profiles.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-4">No users found</p>
            ) : (
              profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setSelectedUserId(profile.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedUserId === profile.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  <p className="font-medium">{profile.full_name}</p>
                  <p className="text-xs text-text-secondary">{profile.email} · {profile.role}</p>
                </button>
              ))
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Role in Project</label>
            <Select value={role} onValueChange={(v) => setRole(v as ProjectRoleInProject)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead_partner">Lead Partner</SelectItem>
                <SelectItem value="supporting_partner">Supporting Partner</SelectItem>
                <SelectItem value="lead_employee">Lead Employee</SelectItem>
                <SelectItem value="supporting_employee">Supporting Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedUserId || assignUser.isPending}>
            {assignUser.isPending && <LoadingSpinner className="mr-2 h-4 w-4" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
