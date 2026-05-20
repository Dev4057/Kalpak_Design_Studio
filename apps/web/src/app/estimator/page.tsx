import type { Metadata } from 'next'
import { CostEstimator } from './CostEstimator'

export const metadata: Metadata = {
  title: 'Cost Estimator',
  description:
    'Get a rough estimate for your interior design or renovation project. Free, instant, no sign-up required.',
}

export default function EstimatorPage() {
  return <CostEstimator />
}
