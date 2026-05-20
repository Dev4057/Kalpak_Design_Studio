'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { format } from 'date-fns'
import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { TrendingUp, TrendingDown, Download, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useReportsOverview } from '@/hooks/useReports'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@kalpak/shared'

const SpendTrendChart = dynamic(
  () => import('@/components/reports/SpendTrendChart').then((m) => m.SpendTrendChart),
  { ssr: false, loading: () => <Skeleton className="h-60 w-full" /> }
)

function pctChange(current: number, previous: number): number {
  if (!previous) return 0
  return Math.round(((current - previous) / previous) * 100)
}

function MetricCompare({ label, current, previous }: { label: string; current: number; previous: number; isCurrency?: boolean }) {
  const pct = pctChange(current, previous)
  const isUp = pct >= 0
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p className="text-xl font-semibold text-text-primary">{formatCurrency(current)}</p>
      <div className={`flex items-center gap-1 mt-1 text-xs ${isUp ? 'text-success' : 'text-danger'}`}>
        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{Math.abs(pct)}% vs last month</span>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const { role, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { data, isLoading } = useReportsOverview()
  const [generatingPdf, setGeneratingPdf] = useState(false)

  useEffect(() => {
    if (!authLoading && role !== 'partner') router.replace('/projects')
  }, [role, authLoading, router])

  if (authLoading || role !== 'partner') return null

  const overview = data?.data

  async function downloadOverviewPdf() {
    if (!overview) return
    setGeneratingPdf(true)
    try {
      const { FirmOverviewReportPdf } = await import('@/components/pdf/generators/firmOverviewReport')
      const blob = await pdf(<FirmOverviewReportPdf overview={overview} />).toBlob()
      saveAs(blob, `firm-overview-${format(new Date(), 'yyyy-MM')}.pdf`)
    } catch {
      // silent
    } finally {
      setGeneratingPdf(false)
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title="Financial Reports"
          description="Firm-wide financial summary and project budget health"
        />
        <Button variant="outline" onClick={downloadOverviewPdf} disabled={generatingPdf || !overview}>
          {generatingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Export Full Report
        </Button>
      </div>

      {/* Month comparison */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCompare label="Total Spent" current={overview.this_month.total_spent} previous={overview.last_month.total_spent} />
          <MetricCompare label="Worker Payments" current={overview.this_month.total_worker_payments} previous={overview.last_month.total_worker_payments} />
          <MetricCompare label="Vendor Payments" current={overview.this_month.total_vendor_payments} previous={overview.last_month.total_vendor_payments} />
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-text-secondary mb-1">New Leads</p>
            <p className="text-xl font-semibold text-text-primary">{overview.this_month.new_leads}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs ${overview.this_month.new_leads >= overview.last_month.new_leads ? 'text-success' : 'text-danger'}`}>
              {overview.this_month.new_leads >= overview.last_month.new_leads ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(pctChange(overview.this_month.new_leads, overview.last_month.new_leads))}% vs last month</span>
            </div>
          </div>
        </div>
      )}

      {/* Spend Trend Chart */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Monthly Spend Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-60 w-full" /> : overview && (
            <SpendTrendChart data={overview.monthly_spend_trend} />
          )}
        </CardContent>
      </Card>

      {/* Budget Health Table */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Budget Health — Active Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : !overview || overview.by_project.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-6">No active projects</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Utilisation</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.by_project
                  .sort((a, b) => (b.budget_utilization_percent ?? 0) - (a.budget_utilization_percent ?? 0))
                  .map((proj) => {
                    const pct = proj.budget_utilization_percent ?? 0
                    const barColor = pct >= 90 ? '#B91C1C' : pct >= 70 ? '#D97706' : '#2D7D4F'
                    const remaining = proj.total_budget ? proj.total_budget - proj.total_spent : null
                    return (
                      <TableRow key={proj.project_id} className="cursor-pointer hover:bg-muted/30">
                        <TableCell>
                          <Link href={`/projects/${proj.project_id}/financials`} className="font-medium text-sm hover:text-primary">
                            {proj.project_name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-text-secondary">{proj.client_name}</TableCell>
                        <TableCell className="text-right text-sm">{proj.total_budget ? formatCurrency(proj.total_budget) : '—'}</TableCell>
                        <TableCell className="text-right text-sm font-medium">{formatCurrency(proj.total_spent)}</TableCell>
                        <TableCell className={`text-right text-sm ${(remaining ?? 0) < 0 ? 'text-danger font-medium' : ''}`}>
                          {remaining !== null ? formatCurrency(remaining) : '—'}
                        </TableCell>
                        <TableCell className="min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} />
                            </div>
                            <span className="text-xs font-medium" style={{ color: barColor }}>{pct}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">{proj.status.replace('_', ' ')}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Top Workers */}
      {overview && overview.top_workers_by_payment.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Workers This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overview.top_workers_by_payment.map((w, i) => (
                <div key={w.worker_id} className="flex items-center gap-4">
                  <span className="text-lg font-bold text-text-secondary w-6 text-center">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{w.worker_name}</p>
                    <Badge variant="outline" className="text-xs capitalize mt-0.5">{w.trade.replace('_', ' ')}</Badge>
                  </div>
                  <span className="text-sm font-semibold text-primary">{formatCurrency(w.total_paid)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
