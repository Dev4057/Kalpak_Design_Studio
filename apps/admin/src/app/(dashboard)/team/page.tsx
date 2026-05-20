'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Plus, UserCheck, UserX, Briefcase } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTeamMembers, useInviteEmployee, useUpdateMemberStatus } from '@/hooks/useTeam'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { TeamMember } from '@kalpak/shared'

function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const invite = useInviteEmployee()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  function reset() {
    setFullName('')
    setEmail('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await invite.mutateAsync({ full_name: fullName, email })
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="invite-name">Full Name</Label>
            <Input
              id="invite-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Rahul Sharma"
              required
              minLength={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { onOpenChange(false); reset() }}>
              Cancel
            </Button>
            <Button type="submit" disabled={invite.isPending}>
              {invite.isPending ? 'Sending…' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ProjectCountCell({ member }: { member: TeamMember }) {
  if (member.active_project_count === 0) {
    return <span className="text-sm text-text-secondary">—</span>
  }
  return (
    <span
      className="flex items-center gap-1.5 text-sm font-medium text-primary"
      title={`${member.active_project_count} active project${member.active_project_count !== 1 ? 's' : ''}`}
    >
      <Briefcase className="w-3.5 h-3.5" />
      {member.active_project_count}
    </span>
  )
}

export default function TeamPage() {
  const { role, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { data, isLoading } = useTeamMembers()
  const updateStatus = useUpdateMemberStatus()

  const [inviteOpen, setInviteOpen] = useState(false)
  const [deactivateTarget, setDeactivateTarget] = useState<TeamMember | null>(null)

  useEffect(() => {
    if (!authLoading && role !== 'partner') router.replace('/projects')
  }, [role, authLoading, router])

  if (authLoading || role !== 'partner') return null

  const members = data?.data ?? []

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title="Team"
          description="Manage employee accounts and project access"
        />
        <Button onClick={() => setInviteOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Invite Employee
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <p className="text-sm text-text-secondary mb-3">No employees yet</p>
          <Button variant="outline" onClick={() => setInviteOpen(true)}>
            Invite your first employee
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Active Projects</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const initials = member.full_name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()

              return (
                <TableRow key={member.id} className={!member.is_active ? 'opacity-60' : undefined}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{member.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-text-secondary">{member.email}</TableCell>
                  <TableCell className="text-sm text-text-secondary">
                    {member.phone ?? '—'}
                  </TableCell>
                  <TableCell>
                    <ProjectCountCell member={member} />
                  </TableCell>
                  <TableCell>
                    {member.is_active ? (
                      <Badge className="bg-success/10 text-success border-0 gap-1">
                        <UserCheck className="w-3 h-3" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-danger border-danger/30 gap-1">
                        <UserX className="w-3 h-3" /> Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-text-secondary">
                    {format(new Date(member.created_at), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    {member.is_active ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:text-danger hover:bg-danger/5 text-xs"
                        onClick={() => setDeactivateTarget(member)}
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-success hover:text-success hover:bg-success/5 text-xs"
                        onClick={() => updateStatus.mutate({ userId: member.id, is_active: true })}
                        disabled={updateStatus.isPending}
                      >
                        Reactivate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      <ConfirmDialog
        open={!!deactivateTarget}
        onOpenChange={(v) => !v && setDeactivateTarget(null)}
        title={`Deactivate ${deactivateTarget?.full_name ?? ''}?`}
        description="They will immediately lose access to the admin console."
        confirmLabel="Deactivate"
        variant="danger"
        onConfirm={async () => {
          if (deactivateTarget) {
            await updateStatus.mutateAsync({ userId: deactivateTarget.id, is_active: false })
          }
          setDeactivateTarget(null)
        }}
      />
    </div>
  )
}
