import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { PdfHeader } from '../components/PdfHeader'
import { PdfFooter } from '../components/PdfFooter'
import { pdfStyles } from '../styles'
import { formatCurrency } from '@kalpak/shared'
import type { ReportsOverview } from '@/hooks/useReports'
import { format } from 'date-fns'

interface Props {
  overview: ReportsOverview
}

export function FirmOverviewReportPdf({ overview }: Props) {
  const monthLabel = format(new Date(), 'MMMM yyyy')

  return (
    <Document>
      {/* Page 1: This Month at a Glance */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader reportTitle="Financial Overview" reportSubtitle={`Month: ${monthLabel}`} />

        <Text style={pdfStyles.sectionTitle}>This Month</Text>
        <View style={pdfStyles.summaryBox}>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Total Spent</Text>
            <Text style={[pdfStyles.summaryValue, pdfStyles.goldAccent]}>{formatCurrency(overview.this_month.total_spent)}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Worker Payments</Text>
            <Text style={pdfStyles.summaryValue}>{formatCurrency(overview.this_month.total_worker_payments)}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Vendor Payments</Text>
            <Text style={pdfStyles.summaryValue}>{formatCurrency(overview.this_month.total_vendor_payments)}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>New Leads</Text>
            <Text style={pdfStyles.summaryValue}>{overview.this_month.new_leads}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Projects Completed</Text>
            <Text style={pdfStyles.summaryValue}>{overview.this_month.projects_completed}</Text>
          </View>
        </View>

        <Text style={pdfStyles.sectionTitle}>Last Month Comparison</Text>
        <View style={pdfStyles.summaryBox}>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Total Spent</Text>
            <Text style={pdfStyles.summaryValue}>{formatCurrency(overview.last_month.total_spent)}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Worker Payments</Text>
            <Text style={pdfStyles.summaryValue}>{formatCurrency(overview.last_month.total_worker_payments)}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>New Leads</Text>
            <Text style={pdfStyles.summaryValue}>{overview.last_month.new_leads}</Text>
          </View>
        </View>

        <PdfFooter />
      </Page>

      {/* Page 2: Project Budget Health */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader reportTitle="Project Budget Health" reportSubtitle="Active projects sorted by utilisation" />

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 4 }]}>Project</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Client</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2, textAlign: 'right' }]}>Budget</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2, textAlign: 'right' }]}>Spent</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>%</Text>
          </View>
          {overview.by_project
            .sort((a, b) => (b.budget_utilization_percent ?? 0) - (a.budget_utilization_percent ?? 0))
            .map((proj) => {
              const pct = proj.budget_utilization_percent ?? 0
              return (
                <View key={proj.project_id} style={pdfStyles.tableRow}>
                  <Text style={[pdfStyles.tableCell, { flex: 4 }]}>{proj.project_name}</Text>
                  <Text style={[pdfStyles.tableCell, { flex: 2 }]}>{proj.client_name}</Text>
                  <Text style={[pdfStyles.tableCell, { flex: 2, textAlign: 'right' }]}>{proj.total_budget ? formatCurrency(proj.total_budget) : '—'}</Text>
                  <Text style={[pdfStyles.tableCell, { flex: 2, textAlign: 'right' }]}>{formatCurrency(proj.total_spent)}</Text>
                  <Text style={[pdfStyles.tableCell, { flex: 1, textAlign: 'right', color: pct >= 90 ? '#B91C1C' : pct >= 70 ? '#D97706' : '#2D7D4F' }]}>
                    {pct}%
                  </Text>
                </View>
              )
            })}
        </View>

        <PdfFooter />
      </Page>

      {/* Page 3: Top Workers */}
      {overview.top_workers_by_payment.length > 0 && (
        <Page size="A4" style={pdfStyles.page}>
          <PdfHeader reportTitle="Top Workers This Month" reportSubtitle={`Month: ${monthLabel}`} />

          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableHeaderCell, { flex: 1 }]}>Rank</Text>
              <Text style={[pdfStyles.tableHeaderCell, { flex: 4 }]}>Worker</Text>
              <Text style={[pdfStyles.tableHeaderCell, { flex: 3 }]}>Trade</Text>
              <Text style={[pdfStyles.tableHeaderCell, { flex: 2, textAlign: 'right' }]}>Total Paid</Text>
            </View>
            {overview.top_workers_by_payment.map((w, i) => (
              <View key={w.worker_id} style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCell, { flex: 1 }]}>{i + 1}</Text>
                <Text style={[pdfStyles.tableCell, { flex: 4 }]}>{w.worker_name}</Text>
                <Text style={[pdfStyles.tableCell, { flex: 3, textTransform: 'capitalize' }]}>{w.trade.replace('_', ' ')}</Text>
                <Text style={[pdfStyles.tableCell, { flex: 2, textAlign: 'right', color: '#B8955A' }]}>{formatCurrency(w.total_paid)}</Text>
              </View>
            ))}
          </View>

          <PdfFooter />
        </Page>
      )}

      {/* Page 4: Monthly Trend Table */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader reportTitle="6-Month Spend Trend" />

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 3 }]}>Month</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 3, textAlign: 'right' }]}>Worker Payments</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 3, textAlign: 'right' }]}>Vendor Payments</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 3, textAlign: 'right' }]}>Total</Text>
          </View>
          {overview.monthly_spend_trend.map((m) => (
            <View key={m.month} style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableCell, { flex: 3 }]}>{m.month}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 3, textAlign: 'right' }]}>{formatCurrency(m.worker_payments)}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 3, textAlign: 'right' }]}>{formatCurrency(m.vendor_payments)}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 3, textAlign: 'right' }]}>{formatCurrency(m.worker_payments + m.vendor_payments)}</Text>
            </View>
          ))}
        </View>

        <PdfFooter />
      </Page>
    </Document>
  )
}
