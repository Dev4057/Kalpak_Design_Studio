'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateWorkerSchema, type CreateWorkerInput, type WorkerTrade } from '@kalpak/shared'
import { useWorkers, useCreateWorker, useAddWorkerToProject } from '@/hooks/useWorkers'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const TRADES: WorkerTrade[] = [
  'electrician', 'carpenter', 'painter', 'plumber', 'mason', 'tiler',
  'fabricator', 'false_ceiling', 'ac_hvac', 'glass_works', 'polisher',
  'general_labour', 'supervisor', 'other',
]

const TRADE_LABELS: Record<WorkerTrade, string> = {
  electrician: 'Electrician', carpenter: 'Carpenter', painter: 'Painter',
  plumber: 'Plumber', mason: 'Mason', tiler: 'Tiler', fabricator: 'Fabricator',
  false_ceiling: 'False Ceiling', ac_hvac: 'AC/HVAC', glass_works: 'Glass Works',
  polisher: 'Polisher', general_labour: 'General Labour', supervisor: 'Supervisor', other: 'Other',
}

interface AddWorkerDialogProps {
  projectId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onWorkerCreated?: () => void
}

export function AddWorkerDialog({ projectId, open, onOpenChange, onWorkerCreated }: AddWorkerDialogProps) {
  const [tab, setTab] = useState<'existing' | 'new'>('existing')
  const [search, setSearch] = useState('')
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const [workersNeeded, setWorkersNeeded] = useState(1)

  const { data: workersData } = useWorkers({ search: search || undefined })
  const createWorker = useCreateWorker()
  const addToProject = useAddWorkerToProject(projectId ?? '')

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateWorkerInput>({
    resolver: zodResolver(CreateWorkerSchema),
    defaultValues: { is_active: true },
  })

  const workers = workersData?.data ?? []

  async function handleAddExisting() {
    if (!selectedWorkerId) return
    if (projectId) {
      await addToProject.mutateAsync({ worker_id: selectedWorkerId, workers_needed: workersNeeded })
    }
    onOpenChange(false)
    setSelectedWorkerId('')
  }

  async function handleCreateNew(data: CreateWorkerInput) {
    const result = await createWorker.mutateAsync(data)
    const worker = (result as { data: { id: string } }).data
    if (projectId) {
      await addToProject.mutateAsync({ worker_id: worker.id, workers_needed: workersNeeded })
    }
    onWorkerCreated?.()
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Worker</DialogTitle>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex border rounded-md overflow-hidden">
          {(['existing', 'new'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-1.5 text-sm font-medium transition-colors',
                tab === t ? 'bg-primary text-white' : 'bg-muted text-text-secondary hover:text-text-primary'
              )}
            >
              {t === 'existing' ? 'Existing Worker' : 'New Worker'}
            </button>
          ))}
        </div>

        {tab === 'existing' ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input
                placeholder="Search workers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-48 overflow-y-auto border rounded-md p-1 space-y-0.5">
              {workers.length === 0 ? (
                <p className="text-sm text-center text-text-secondary py-4">No workers found</p>
              ) : (
                workers.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWorkerId(w.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded text-sm',
                      selectedWorkerId === w.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    )}
                  >
                    <span className="font-medium">{w.full_name}</span>
                    <span className="text-xs text-text-secondary ml-2">{w.trade.replace('_', ' ')}</span>
                  </button>
                ))
              )}
            </div>
            {projectId && (
              <div className="space-y-1.5">
                <Label htmlFor="workers-needed">Workers Needed</Label>
                <Input
                  id="workers-needed"
                  type="number"
                  min={1}
                  value={workersNeeded}
                  onChange={(e) => setWorkersNeeded(parseInt(e.target.value, 10) || 1)}
                  className="w-24"
                />
              </div>
            )}
          </div>
        ) : (
          <form id="new-worker-form" onSubmit={handleSubmit(handleCreateNew)} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" {...register('full_name')} placeholder="Rajesh Kumar" />
              {errors.full_name && <p className="text-xs text-danger">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" {...register('phone')} placeholder="9876543210" />
              {errors.phone && <p className="text-xs text-danger">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Trade *</Label>
              <Select onValueChange={(v) => setValue('trade', v as WorkerTrade)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trade" />
                </SelectTrigger>
                <SelectContent>
                  {TRADES.map((t) => (
                    <SelectItem key={t} value={t}>{TRADE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.trade && <p className="text-xs text-danger">{errors.trade.message}</p>}
            </div>
            {projectId && (
              <div className="space-y-1.5">
                <Label htmlFor="new-workers-needed">Workers Needed</Label>
                <Input
                  id="new-workers-needed"
                  type="number"
                  min={1}
                  value={workersNeeded}
                  onChange={(e) => setWorkersNeeded(parseInt(e.target.value, 10) || 1)}
                  className="w-24"
                />
              </div>
            )}
          </form>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {tab === 'existing' ? (
            <Button
              onClick={handleAddExisting}
              disabled={!selectedWorkerId || addToProject.isPending}
            >
              {addToProject.isPending && <LoadingSpinner className="mr-2 h-4 w-4" />}
              Add Worker
            </Button>
          ) : (
            <Button
              type="submit"
              form="new-worker-form"
              disabled={createWorker.isPending || addToProject.isPending}
            >
              {(createWorker.isPending || addToProject.isPending) && <LoadingSpinner className="mr-2 h-4 w-4" />}
              Create &amp; Add
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
