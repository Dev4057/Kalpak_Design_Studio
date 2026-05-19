'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ConvertLeadSchema, type ConvertLeadInput } from '@kalpak/shared'
import { useConvertLead } from '@/hooks/useLeads'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { Lead } from '@kalpak/shared'

interface ConvertLeadDialogProps {
  lead: Lead
  open: boolean
  onOpenChange: (open: boolean) => void
  onConverted?: (clientId: string) => void
}

export function ConvertLeadDialog({ lead, open, onOpenChange, onConverted }: ConvertLeadDialogProps) {
  const convertLead = useConvertLead()
  const [createProject, setCreateProject] = useState(false)
  const [projectName, setProjectName] = useState('')

  const { register, handleSubmit } = useForm<ConvertLeadInput>({
    resolver: zodResolver(ConvertLeadSchema),
    defaultValues: {
      full_name: lead.full_name,
      email: lead.email ?? undefined,
      phone: lead.phone,
      city: lead.city ?? undefined,
    },
  })

  async function onSubmit(data: ConvertLeadInput) {
    const result = await convertLead.mutateAsync({
      id: lead.id,
      data: {
        ...data,
        create_project: createProject,
        project_name: createProject ? projectName : undefined,
        project_type: lead.project_type ?? undefined,
      },
    })
    const client = (result as { data: { client: { id: string } } }).data.client
    onOpenChange(false)
    onConverted?.(client.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convert Lead to Client</DialogTitle>
          <DialogDescription>
            Confirm the client details below. This will create a client record.
          </DialogDescription>
        </DialogHeader>

        <form id="convert-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input {...register('full_name')} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input {...register('phone')} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input {...register('email')} type="email" />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input {...register('city')} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <Checkbox
              checked={createProject}
              onCheckedChange={(v) => setCreateProject(!!v)}
            />
            <span className="text-sm">Also create a project for this client</span>
          </label>

          {createProject && (
            <div className="space-y-1.5">
              <Label>Project Name</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Sharma Residence"
              />
            </div>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button form="convert-form" type="submit" disabled={convertLead.isPending}>
            {convertLead.isPending && <LoadingSpinner className="mr-2 h-4 w-4" />}
            Convert to Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
