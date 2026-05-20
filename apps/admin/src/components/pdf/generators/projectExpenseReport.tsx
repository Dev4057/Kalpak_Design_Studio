import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { PdfHeader } from '../components/PdfHeader'
import { PdfFooter } from '../components/PdfFooter'
import { pdfStyles } from '../styles'
import { formatCurrency } from '@kalpak/shared'
import type { WorkerPayment, VendorPayment, ProjectFinancialSummary, WorkerPaymentSummary } from '@kalpak/shared'

interface Props {
  project: { name: string; city?: string | null; status?: string; clients?: { full_name: string } | null } | null
  summary: ProjectFinancialSummary | null
  workerPayments: WorkerPayment[]
  vendorPayments: VendorPayment[]
  workerSummaries: WorkerPaymentSummary[]
}

export function ProjectExpenseReportPdf({ project, summary, workerPayments, vendorPayments, workerSummaries }: Props) {
  const subtitle = project ? `${project.name}${project.clients ? ` | Client: ${project.clients.full_name}` : ''}${project.city ? ` | ${project.city}` : ''}` : ''
  const pct = summary?.budget_utilization_percent ?? 0

  return (
    <Document>
      {/* Page 1: Overview + Budget */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader reportTitle="Project Expense Report" reportSubtitle={subtitle} />

        <View style={pdfStyles.summaryBox}>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Total Budget</Text>
            <Text style={pdfStyles.summaryValue}>{summary?.total_budget ? formatCurrency(summary.total_budget) : 'Not set'}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Total Spent</Text>
            <Text style={[pdfStyles.summaryValue, pdfStyles.goldAccent]}>{formatCurrency(summary?.total_spent ?? 0)}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Remaining Budget</Text>
            <Text style={[pdfStyles.summaryValue, (summary?.remaining_budget ?? 0) < 0 ? pdfStyles.dangerText : {}]}>
              {summary?.remaining_budget !== null && summary?.remaining_budget !== undefined ? formatCurrency(summary.remaining_budget) : '—'}
            </Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Budget Utilisation</Text>
            <Text style={[pdfStyles.summaryValue, pct >= 90 ? pdfStyles.dangerText : pct >= 70 ? { color: '#D97706' } : pdfStyles.successText]}>
              {pct}%
            </Text>
          </View>
          <View style={[pdfStyles.divider, { marginVertical: 6 }]} />
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Worker Payments</Text>
            <Text style={pdfStyles.summaryValue}>{formatCurrency(summary?.total_worker_payments ?? 0)} ({summary?.worker_payment_count ?? 0} records)</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Vendor Payments</Text>
            <Text style={pdfStyles.summaryValue}>{formatCurrency(summary?.total_vendor_payments ?? 0)} ({summary?.vendor_payment_count ?? 0} records)</Text>
          </View>
        </View>

        <PdfFooter />
      </Page>

      {/* Page 2: Worker Payments */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader reportTitle="Worker Payments" reportSubtitle={subtitle} />

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Date</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 3 }]}>Worker</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Trade</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2, textAlign: 'right' }]}>Amount</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Mode</Text>
          </View>
          {workerPayments.map((p) => (
            <View key={p.id} style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableCell, { flex: 2 }]}>{p.payment_date}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 3 }]}>{p.worker?.full_name ?? '—'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 2, textTransform: 'capitalize' }]}>{(p.worker?.trade ?? 'other').replace('_', ' ')}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 2, textAlign: 'right' }]}>{formatCurrency(p.amount)}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 2, textTransform: 'capitalize' }]}>{p.payment_mode ?? '—'}</Text>
            </View>
          ))}
          <View style={pdfStyles.totalRow}>
            <Text style={[pdfStyles.totalCell, { flex: 2 }]} />
            <Text style={[pdfStyles.totalCell, { flex: 3 }]}>Total</Text>
            <Text style={[pdfStyles.totalCell, { flex: 2 }]} />
            <Text style={[pdfStyles.totalCell, { flex: 2, textAlign: 'right', color: '#B8955A' }]}>
              {formatCurrency(workerPayments.reduce((s, p) => s + p.amount, 0))}
            </Text>
            <Text style={[pdfStyles.totalCell, { flex: 2 }]} />
          </View>
        </View>

        <PdfFooter />
      </Page>

      {/* Page 3: Vendor Payments */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader reportTitle="Vendor &amp; Material Payments" reportSubtitle={subtitle} />

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Date</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 3 }]}>Vendor</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 3 }]}>Item</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2, textAlign: 'right' }]}>Amount</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Mode</Text>
          </View>
          {vendorPayments.map((p) => (
            <View key={p.id} style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableCell, { flex: 2 }]}>{p.payment_date}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 3 }]}>{p.vendor_name}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 3 }]}>{p.item_description}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 2, textAlign: 'right' }]}>{formatCurrency(p.amount)}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 2, textTransform: 'capitalize' }]}>{p.payment_mode ?? '—'}</Text>
            </View>
          ))}
          <View style={pdfStyles.totalRow}>
            <Text style={[pdfStyles.totalCell, { flex: 2 }]} />
            <Text style={[pdfStyles.totalCell, { flex: 3 }]}>Total</Text>
            <Text style={[pdfStyles.totalCell, { flex: 3 }]} />
            <Text style={[pdfStyles.totalCell, { flex: 2, textAlign: 'right', color: '#B8955A' }]}>
              {formatCurrency(vendorPayments.reduce((s, p) => s + p.amount, 0))}
            </Text>
            <Text style={[pdfStyles.totalCell, { flex: 2 }]} />
          </View>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  )
}
