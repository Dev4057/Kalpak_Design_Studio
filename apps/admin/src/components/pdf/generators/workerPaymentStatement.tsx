import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { PdfHeader } from '../components/PdfHeader'
import { PdfFooter } from '../components/PdfFooter'
import { pdfStyles } from '../styles'
import { formatCurrency } from '@kalpak/shared'
import type { WorkerPayment, WorkerPaymentSummary } from '@kalpak/shared'

interface Props {
  project: { name: string; clients?: { full_name: string } | null } | null
  workerSummaries: WorkerPaymentSummary[]
  payments: WorkerPayment[]
}

export function WorkerPaymentStatementPdf({ project, workerSummaries, payments }: Props) {
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0)
  const subtitle = project ? `Project: ${project.name}${project.clients ? ` | Client: ${project.clients.full_name}` : ''}` : ''

  return (
    <Document>
      {/* Page 1: Summary */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader reportTitle="Worker Payment Statement" reportSubtitle={subtitle} />

        <View style={pdfStyles.summaryBox}>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Total Workers</Text>
            <Text style={pdfStyles.summaryValue}>{workerSummaries.length}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Total Payments</Text>
            <Text style={pdfStyles.summaryValue}>{payments.length}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Total Amount Paid</Text>
            <Text style={[pdfStyles.summaryValue, pdfStyles.goldAccent]}>{formatCurrency(totalPaid)}</Text>
          </View>
        </View>

        <Text style={pdfStyles.sectionTitle}>Per-Worker Summary</Text>
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 3 }]}>Worker Name</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Trade</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Payments</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2, textAlign: 'right' }]}>Total Paid</Text>
          </View>
          {workerSummaries.map((ws) => (
            <View key={ws.worker_id} style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableCell, { flex: 3 }]}>{ws.worker_name}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 2, textTransform: 'capitalize' }]}>{ws.trade.replace('_', ' ')}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1, textAlign: 'right' }]}>{ws.payment_count}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 2, textAlign: 'right' }]}>{formatCurrency(ws.total_paid)}</Text>
            </View>
          ))}
          <View style={pdfStyles.totalRow}>
            <Text style={[pdfStyles.totalCell, { flex: 3 }]}>Grand Total</Text>
            <Text style={[pdfStyles.totalCell, { flex: 2 }]} />
            <Text style={[pdfStyles.totalCell, { flex: 1, textAlign: 'right' }]}>{payments.length}</Text>
            <Text style={[pdfStyles.totalCell, { flex: 2, textAlign: 'right', color: '#B8955A' }]}>{formatCurrency(totalPaid)}</Text>
          </View>
        </View>

        <PdfFooter />
      </Page>

      {/* Page 2+: Detailed Log */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader reportTitle="Worker Payment Detail Log" reportSubtitle={subtitle} />

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Date</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 3 }]}>Worker</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Trade</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2, textAlign: 'right' }]}>Amount</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 2 }]}>Mode</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 3 }]}>Description</Text>
          </View>
          {payments.map((p) => (
            <View key={p.id} style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableCell, { flex: 2 }]}>{p.payment_date}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 3 }]}>{p.worker?.full_name ?? '—'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 2, textTransform: 'capitalize' }]}>{(p.worker?.trade ?? 'other').replace('_', ' ')}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 2, textAlign: 'right' }]}>{formatCurrency(p.amount)}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 2, textTransform: 'capitalize' }]}>{p.payment_mode ?? '—'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 3 }]}>{p.description ?? '—'}</Text>
            </View>
          ))}
          <View style={pdfStyles.totalRow}>
            <Text style={[pdfStyles.totalCell, { flex: 2 }]} />
            <Text style={[pdfStyles.totalCell, { flex: 3 }]}>Grand Total</Text>
            <Text style={[pdfStyles.totalCell, { flex: 2 }]} />
            <Text style={[pdfStyles.totalCell, { flex: 2, textAlign: 'right', color: '#B8955A' }]}>{formatCurrency(totalPaid)}</Text>
            <Text style={[pdfStyles.totalCell, { flex: 2 }]} />
            <Text style={[pdfStyles.totalCell, { flex: 3 }]} />
          </View>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  )
}
