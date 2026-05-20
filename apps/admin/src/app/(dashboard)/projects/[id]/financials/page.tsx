'use client'

import { useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { NumericFormat } from 'react-number-format'
import { Download, Plus, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import dynamic from 'next/dynamic'
import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'

import { CreateWorkerPaymentSchema, CreateVendorPaymentSchema, formatCurrency, formatDate } from '@kalpak/shared'
import type { CreateWorkerPaymentInput, CreateVendorPaymentInput, WorkerPayment, VendorPayment } from '@kalpak/shared'
import { useAuth } from '@/hooks/useAuth'
import { useWorkers } from '@/hooks/useWorkers'
import {
  useProjectFinancialSummary, useWorkerPayments, useVendorPayments,
  useAddWorkerPayment, useAddVendorPayment, useDeleteWorkerPayment, useDeleteVendorPayment,
} from '@/hooks/useFinancials'
import { useProject } from '@/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { createClient } from '@/lib/supabase/client'

const WorkerPaymentStatementPdf = dynamic(
  () => import('@/components/pdf/generators/workerPaymentStatement').then(m => m.WorkerPaymentStatementPdf),
  { ssr: false }
)
const ProjectExpenseReportPdf = dynamic(
  () => import('@/components/pdf/generators/projectExpenseReport').then(m => m.ProjectExpenseReportPdf),
  { ssr: false }
)

const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
]

const MODE_COLORS: Record<string, string> = {
  cash: 'bg-gray-100 text-gray-700',
  upi: 'bg-blue-100 text-blue-700',
  bank_transfer: 'bg-green-100 text-green-700',
  cheque: 'bg-amber-100 text-amber-700',
}

// ── BudgetOverviewCard ───────────────────────────────────────────────────────

function BudgetOverviewCard({ projectId }: { projectId: string }) {
  const { data, isLoading } = useProjectFinancialSummary(projectId)
  const summary = data?.data

  if (isLoading) return <Skeleton className="h-48 w-full rounded-lg mb-6" />
  if (!summary) return null

  const pct = summary.budget_utilization_percent ?? 0
  const barColor = pct >= 90 ? '#B91C1C' : pct >= 70 ? '#D97706' : '#2D7D4F'

  const modeData = Object.entries(summary.payment_by_mode).map(([name, value]) => ({
    name: name === 'bank_transfer' ? 'Bank' : name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <h3 className="text-sm font-medium text-text-secondary mb-4">Budget Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div>
          <p className="text-2xl font-semibold text-text-primary">{formatCurrency(summary.total_spent)}</p>
          <p className="text-xs text-text-secondary mt-1">Total Spent</p>
        </div>
        <div>
          <p className={`text-2xl font-semibold ${(summary.remaining_budget ?? 0) < 0 ? 'text-danger' : 'text-text-primary'}`}>
            {summary.remaining_budget !== null ? formatCurrency(summary.remaining_budget) : '—'}
          </p>
          <p className="text-xs text-text-secondary mt-1">Remaining</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-text-primary">{formatCurrency(summary.total_worker_payments)}</p>
          <p className="text-xs text-text-secondary mt-1">Worker Payments ({summary.worker_payment_count})</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-text-primary">{formatCurrency(summary.total_vendor_payments)}</p>
          <p className="text-xs text-text-secondary mt-1">Vendor Payments ({summary.vendor_payment_count})</p>
        </div>
      </div>

      {summary.total_budget !== null && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">Budget utilisation</span>
            <span className="text-xs font-medium" style={{ color: barColor }}>{pct}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
            />
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Budget: {formatCurrency(summary.total_budget)}
          </p>
        </div>
      )}

      {!summary.total_budget && (
        <p className="text-sm text-text-secondary mb-6">No budget set on this project.</p>
      )}

      <div>
        <p className="text-xs text-text-secondary mb-2">Payment Mode Breakdown</p>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modeData} layout="vertical" margin={{ left: 0, right: 0 }}>
              <XAxis type="number" hide />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="value" radius={2} label={{ position: 'right', fontSize: 10, formatter: (v: unknown) => formatCurrency(Number(v)) }}>
                {modeData.map((_, i) => (
                  <Cell key={i} fill="#B8955A" fillOpacity={0.7 + i * 0.075} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ── Add Worker Payment Dialog ────────────────────────────────────────────────

function AddWorkerPaymentDialog({
  open, onOpenChange, projectId, preselectedWorkerId,
}: { open: boolean; onOpenChange: (v: boolean) => void; projectId: string; preselectedWorkerId?: string }) {
  const { data: workersData } = useWorkers()
  const workers = workersData?.data ?? []
  const addPayment = useAddWorkerPayment(projectId)
  const [amount, setAmount] = useState<number | undefined>()

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CreateWorkerPaymentInput>({
    resolver: zodResolver(CreateWorkerPaymentSchema),
    defaultValues: {
      worker_id: preselectedWorkerId ?? '',
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      payment_mode: 'cash',
    },
  })

  const onSubmit = async (data: CreateWorkerPaymentInput) => {
    await addPayment.mutateAsync({ ...data, amount: amount ?? 0 })
    reset()
    setAmount(undefined)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Worker Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!preselectedWorkerId && (
            <div>
              <Label>Worker *</Label>
              <Select onValueChange={(v) => setValue('worker_id', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select worker" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.full_name} — {w.trade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.worker_id && <p className="text-xs text-danger mt-1">{errors.worker_id.message}</p>}
            </div>
          )}

          <div>
            <Label>Amount (₹) *</Label>
            <NumericFormat
              customInput={Input}
              thousandSeparator=","
              prefix="₹ "
              className="mt-1"
              placeholder="₹ 0"
              value={amount}
              onValueChange={({ floatValue }) => setAmount(floatValue)}
            />
            {errors.amount && <p className="text-xs text-danger mt-1">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Payment Date *</Label>
              <Input type="date" className="mt-1" {...register('payment_date')} />
            </div>
            <div>
              <Label>Payment Mode</Label>
              <Select defaultValue="cash" onValueChange={(v) => setValue('payment_mode', v as CreateWorkerPaymentInput['payment_mode'])}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description (optional)</Label>
            <Input className="mt-1" placeholder="e.g. Week 3 carpentry work" {...register('description')} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={addPayment.isPending || !amount}>
              {addPayment.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Worker Payments Section ──────────────────────────────────────────────────

function WorkerPaymentsSection({ projectId }: { projectId: string }) {
  const { isPartner } = useAuth()
  const { data, isLoading } = useWorkerPayments(projectId)
  const deletePayment = useDeleteWorkerPayment(projectId)
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const { data: projectData } = useProject(projectId)

  const payments = data?.data ?? []
  const workerSummaries = data?.worker_summaries ?? []

  async function downloadWorkerPdf() {
    setGeneratingPdf(true)
    try {
      const { WorkerPaymentStatementPdf: Comp } = await import('@/components/pdf/generators/workerPaymentStatement')
      const blob = await pdf(
        <Comp project={projectData?.data ?? null} workerSummaries={workerSummaries} payments={payments} />
      ).toBlob()
      saveAs(blob, `worker-payments-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
    } catch {
      // silent
    } finally {
      setGeneratingPdf(false)
    }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-text-primary">Worker Payments</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadWorkerPdf} disabled={generatingPdf}>
            {generatingPdf ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
            Export PDF
          </Button>
          <Button size="sm" onClick={() => { setSelectedWorkerId(undefined); setAddDialogOpen(true) }}>
            <Plus className="w-4 h-4 mr-1" /> Add Payment
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : workerSummaries.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-8">No worker payments recorded yet.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Trade</TableHead>
                <TableHead className="text-right">Total Paid</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {workerSummaries.map((ws) => {
                const expanded = expandedWorker === ws.worker_id
                const workerPayments = payments.filter((p) => p.worker_id === ws.worker_id)
                return (
                  <>
                    <TableRow key={ws.worker_id} className="cursor-pointer hover:bg-muted/30" onClick={() => setExpandedWorker(expanded ? null : ws.worker_id)}>
                      <TableCell className="font-medium">{ws.worker_name}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs capitalize">{ws.trade.replace('_', ' ')}</Badge></TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(ws.total_paid)}</TableCell>
                      <TableCell className="text-right">{ws.payment_count}</TableCell>
                      <TableCell className="text-sm text-text-secondary">{ws.last_payment_date ? formatDate(ws.last_payment_date) : '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); setSelectedWorkerId(ws.worker_id); setAddDialogOpen(true) }}>
                            Add Payment
                          </Button>
                          {expanded ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expanded && workerPayments.map((p) => (
                      <TableRow key={p.id} className="bg-muted/20">
                        <TableCell colSpan={2} className="pl-8 text-sm text-text-secondary">{p.description ?? '—'}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(p.amount)}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={`text-xs ${MODE_COLORS[p.payment_mode ?? 'cash']}`}>
                            {p.payment_mode ?? 'cash'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-text-secondary">{formatDate(p.payment_date)}</TableCell>
                        <TableCell>
                          {isPartner && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-danger hover:text-danger hover:bg-danger/5" onClick={() => setDeleteTarget(p.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )
              })}
            </TableBody>
          </Table>

          <div className="mt-3 flex justify-end">
            <p className="text-sm text-text-secondary">
              Total: <span className="font-medium text-text-primary">
                {formatCurrency(payments.reduce((s, p) => s + p.amount, 0))}
              </span> across {payments.length} payments
            </p>
          </div>
        </>
      )}

      <AddWorkerPaymentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        projectId={projectId}
        preselectedWorkerId={selectedWorkerId}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Payment"
        description="This will permanently delete this payment record."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (deleteTarget) await deletePayment.mutateAsync(deleteTarget)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}

// ── Add Vendor Payment Dialog ────────────────────────────────────────────────

function AddVendorPaymentDialog({ open, onOpenChange, projectId }: { open: boolean; onOpenChange: (v: boolean) => void; projectId: string }) {
  const addPayment = useAddVendorPayment(projectId)
  const [amount, setAmount] = useState<number | undefined>()
  const [billUrl, setBillUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CreateVendorPaymentInput>({
    resolver: zodResolver(CreateVendorPaymentSchema),
    defaultValues: {
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      payment_mode: 'cash',
    },
  })

  async function handleBillUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = createClient()
      const path = `bill-photos/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('bill-photos').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('bill-photos').getPublicUrl(path)
      setBillUrl(data.publicUrl)
      setValue('bill_photo_url', data.publicUrl)
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: CreateVendorPaymentInput) => {
    await addPayment.mutateAsync({ ...data, amount: amount ?? 0, bill_photo_url: billUrl ?? undefined })
    reset()
    setAmount(undefined)
    setBillUrl(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Vendor Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Vendor Name *</Label>
            <Input className="mt-1" placeholder="e.g. Raj Electricals" {...register('vendor_name')} />
            {errors.vendor_name && <p className="text-xs text-danger mt-1">{errors.vendor_name.message}</p>}
          </div>
          <div>
            <Label>Item Description *</Label>
            <Input className="mt-1" placeholder="e.g. Electrical wiring materials" {...register('item_description')} />
            {errors.item_description && <p className="text-xs text-danger mt-1">{errors.item_description.message}</p>}
          </div>
          <div>
            <Label>Amount (₹) *</Label>
            <NumericFormat
              customInput={Input}
              thousandSeparator=","
              prefix="₹ "
              className="mt-1"
              placeholder="₹ 0"
              value={amount}
              onValueChange={({ floatValue }) => setAmount(floatValue)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Payment Date</Label>
              <Input type="date" className="mt-1" {...register('payment_date')} />
            </div>
            <div>
              <Label>Payment Mode</Label>
              <Select defaultValue="cash" onValueChange={(v) => setValue('payment_mode', v as CreateVendorPaymentInput['payment_mode'])}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Bill Photo (optional)</Label>
            <div className="mt-1 flex items-center gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                Upload Bill
              </Button>
              {billUrl && <a href={billUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">View bill</a>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleBillUpload} className="hidden" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={addPayment.isPending || !amount}>
              {addPayment.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Vendor Payments Section ──────────────────────────────────────────────────

function VendorPaymentsSection({ projectId }: { projectId: string }) {
  const { isPartner } = useAuth()
  const { data, isLoading } = useVendorPayments(projectId)
  const deletePayment = useDeleteVendorPayment(projectId)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const payments = data?.data ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-text-primary">Vendor & Material Payments</h3>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Vendor Payment
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : payments.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-8">No vendor payments recorded yet.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Bill</TableHead>
                <TableHead>Recorded By</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm text-text-secondary">{formatDate(p.payment_date)}</TableCell>
                  <TableCell className="font-medium text-sm">{p.vendor_name}</TableCell>
                  <TableCell className="text-sm text-text-secondary max-w-[160px] truncate">{p.item_description}</TableCell>
                  <TableCell className="text-right font-medium text-sm">{formatCurrency(p.amount)}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${MODE_COLORS[p.payment_mode ?? 'cash']}`}>
                      {p.payment_mode ?? '—'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {p.bill_photo_url
                      ? <a href={p.bill_photo_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">View</a>
                      : <span className="text-text-secondary text-sm">—</span>}
                  </TableCell>
                  <TableCell className="text-sm text-text-secondary">{(p as VendorPayment & { paid_by_profile?: { full_name: string } }).paid_by_profile?.full_name ?? '—'}</TableCell>
                  <TableCell>
                    {isPartner && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-danger hover:text-danger hover:bg-danger/5" onClick={() => setDeleteTarget(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-3 flex justify-end">
            <p className="text-sm text-text-secondary">
              Total: <span className="font-medium text-text-primary">
                {formatCurrency(payments.reduce((s, p) => s + p.amount, 0))}
              </span> across {payments.length} payments
            </p>
          </div>
        </>
      )}

      <AddVendorPaymentDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} projectId={projectId} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Payment"
        description="This will permanently delete this vendor payment record."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (deleteTarget) await deletePayment.mutateAsync(deleteTarget)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectFinancialsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: projectData, isLoading: projectLoading } = useProject(id)
  const { data: workerPaymentsData } = useWorkerPayments(id)
  const { data: vendorPaymentsData } = useVendorPayments(id)
  const { data: summaryData } = useProjectFinancialSummary(id)
  const [generatingFullPdf, setGeneratingFullPdf] = useState(false)

  async function downloadFullReport() {
    setGeneratingFullPdf(true)
    try {
      const { ProjectExpenseReportPdf: Comp } = await import('@/components/pdf/generators/projectExpenseReport')
      const blob = await pdf(
        <Comp
          project={projectData?.data ?? null}
          summary={summaryData?.data ?? null}
          workerPayments={workerPaymentsData?.data ?? []}
          vendorPayments={vendorPaymentsData?.data ?? []}
          workerSummaries={workerPaymentsData?.worker_summaries ?? []}
        />
      ).toBlob()
      saveAs(blob, `project-expense-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
    } catch {
      // silent
    } finally {
      setGeneratingFullPdf(false)
    }
  }

  if (projectLoading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-medium text-text-primary">Financials</h2>
        <Button variant="outline" onClick={downloadFullReport} disabled={generatingFullPdf}>
          {generatingFullPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Export Full Report
        </Button>
      </div>

      <BudgetOverviewCard projectId={id} />
      <WorkerPaymentsSection projectId={id} />
      <VendorPaymentsSection projectId={id} />
    </div>
  )
}
