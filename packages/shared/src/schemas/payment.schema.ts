import { z } from 'zod'

const PaymentModeEnum = z.enum(['cash', 'upi', 'bank_transfer', 'cheque'])

export const CreateWorkerPaymentSchema = z.object({
  worker_id: z.string().uuid('Invalid worker ID'),
  amount: z.number().positive('Amount must be positive'),
  payment_date: z.string().date(),
  payment_mode: PaymentModeEnum.nullable().optional(),
  description: z.string().max(500).nullable().optional(),
})

export const CreateVendorPaymentSchema = z.object({
  vendor_name: z.string().min(1, 'Vendor name is required').max(200),
  item_description: z.string().min(1, 'Item description is required').max(500),
  amount: z.number().positive('Amount must be positive'),
  payment_date: z.string().date(),
  payment_mode: PaymentModeEnum.nullable().optional(),
  bill_photo_url: z.string().url().nullable().optional(),
})

export type CreateWorkerPaymentInput = z.infer<typeof CreateWorkerPaymentSchema>
export type CreateVendorPaymentInput = z.infer<typeof CreateVendorPaymentSchema>
