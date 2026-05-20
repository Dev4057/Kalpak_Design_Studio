'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@kalpak/shared'

type TrendPoint = {
  month: string
  worker_payments: number
  vendor_payments: number
}

function formatLakh(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`
  return `₹${value}`
}

export function SpendTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={formatLakh} tick={{ fontSize: 11 }} width={56} />
        <Tooltip
          formatter={(value, name) => [
            formatCurrency(Number(value)),
            name === 'worker_payments' ? 'Worker Payments' : 'Vendor Payments',
          ]}
        />
        <Legend
          formatter={(value) => value === 'worker_payments' ? 'Worker Payments' : 'Vendor Payments'}
          iconType="square"
          wrapperStyle={{ fontSize: 11 }}
        />
        <Bar dataKey="worker_payments" fill="#B8955A" radius={[2, 2, 0, 0]} />
        <Bar dataKey="vendor_payments" fill="#8C8680" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
