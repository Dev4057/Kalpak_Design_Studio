'use client'

import { useState, useEffect } from 'react'
import { useWorkers } from '@/hooks/useWorkers'
import { AddWorkerDialog } from '@/components/workers/AddWorkerDialog'
import { WorkerTradeBadge } from '@/components/workers/WorkerTradeBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { HardHat, Plus, Search } from 'lucide-react'
import { formatPhone } from '@kalpak/shared'
import type { WorkerTrade } from '@kalpak/shared'

const TRADES = [
  '', 'electrician', 'carpenter', 'painter', 'plumber', 'mason', 'tiler',
  'fabricator', 'false_ceiling', 'ac_hvac', 'glass_works', 'polisher',
  'general_labour', 'supervisor', 'other',
] as const

const TRADE_LABELS: Record<string, string> = {
  electrician: 'Electrician', carpenter: 'Carpenter', painter: 'Painter',
  plumber: 'Plumber', mason: 'Mason', tiler: 'Tiler', fabricator: 'Fabricator',
  false_ceiling: 'False Ceiling', ac_hvac: 'AC/HVAC', glass_works: 'Glass Works',
  polisher: 'Polisher', general_labour: 'General Labour', supervisor: 'Supervisor', other: 'Other',
}

export default function WorkersPage() {
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [trade, setTrade] = useState('all')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, refetch } = useWorkers({
    search: debouncedSearch || undefined,
    trade: trade === 'all' ? undefined : trade || undefined,
  })

  const workers = data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Workers"
        description="Master list of all workers"
        action={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Worker
          </Button>
        }
      />

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <Input
            placeholder="Search workers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        <Select value={trade} onValueChange={setTrade}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All trades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All trades</SelectItem>
            {TRADES.filter(Boolean).map((t) => (
              <SelectItem key={t} value={t}>{TRADE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="text-xs">
          {workers.length} workers
        </Badge>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded" />
          ))}
        </div>
      ) : workers.length === 0 ? (
        <EmptyState
          icon={HardHat}
          title="No workers found"
          description="Add your first worker to get started."
          action={{ label: 'Add Worker', onClick: () => setAddOpen(true) }}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Trade</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell className="font-medium">{worker.full_name}</TableCell>
                <TableCell>
                  <WorkerTradeBadge trade={worker.trade as WorkerTrade} />
                </TableCell>
                <TableCell className="text-text-secondary text-sm">
                  {formatPhone(worker.phone)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={worker.is_active
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-50 text-gray-500 border-gray-200'}
                  >
                    {worker.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-text-secondary text-sm">
                  {new Date(worker.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AddWorkerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onWorkerCreated={() => refetch()}
      />
    </div>
  )
}
