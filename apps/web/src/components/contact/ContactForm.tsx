'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreateLeadSchema } from '@kalpak/shared'
import { cn } from '@/lib/utils'

type FormValues = z.input<typeof CreateLeadSchema>

const PROJECT_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office', label: 'Office' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'other', label: 'Other' },
]

const BUDGET_RANGES = [
  { value: 'Under ₹10L', label: 'Under ₹10 Lakh' },
  { value: '₹10L–₹25L', label: '₹10 – ₹25 Lakh' },
  { value: '₹25L–₹50L', label: '₹25 – ₹50 Lakh' },
  { value: '₹50L–₹1Cr', label: '₹50 Lakh – ₹1 Crore' },
  { value: 'Above ₹1Cr', label: 'Above ₹1 Crore' },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

const fieldClass = cn(
  'w-full font-body text-sm text-charcoal bg-transparent border border-stone-light/60 px-4 py-3',
  'placeholder-stone/50 focus:outline-none focus:border-gold transition-colors duration-200',
)

const labelClass = 'block font-body text-xs tracking-widest uppercase text-stone mb-2'
const errorClass = 'font-body text-xs text-red-500 mt-1'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(CreateLeadSchema),
    defaultValues: { source_page: 'contact_form' },
  })

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.status === 429) {
        setServerError('Too many requests. Please try again later.')
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setServerError(body.error ?? 'Something went wrong. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setServerError('Unable to reach the server. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-8 border border-gold/30 bg-warm-white">
        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-heading text-2xl font-light text-charcoal tracking-wide mb-3">
          Thank You!
        </h3>
        <p className="font-body text-sm text-stone leading-relaxed">
          We&apos;ve received your enquiry and will reach out within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className={labelClass}>
          Full Name <span className="text-gold">*</span>
        </label>
        <input
          id="full_name"
          type="text"
          placeholder="Your full name"
          {...register('full_name')}
          className={cn(fieldClass, errors.full_name && 'border-red-400')}
        />
        {errors.full_name && <p className={errorClass}>{errors.full_name.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone Number <span className="text-gold">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="10-digit mobile number"
          {...register('phone')}
          className={cn(fieldClass, errors.phone && 'border-red-400')}
        />
        {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>Email Address</label>
        <input
          id="email"
          type="email"
          placeholder="your@email.com"
          {...register('email')}
          className={cn(fieldClass, errors.email && 'border-red-400')}
        />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      {/* City */}
      <div>
        <label htmlFor="city" className={labelClass}>
          City <span className="text-gold">*</span>
        </label>
        <input
          id="city"
          type="text"
          placeholder="Mumbai, Pune, Bangalore…"
          {...register('city')}
          className={cn(fieldClass, errors.city && 'border-red-400')}
        />
        {errors.city && <p className={errorClass}>{errors.city.message}</p>}
      </div>

      {/* Project Type + Budget — 2 columns on md */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="project_type" className={labelClass}>Project Type</label>
          <select
            id="project_type"
            {...register('project_type')}
            className={cn(fieldClass, 'appearance-none cursor-pointer')}
          >
            <option value="">Select type</option>
            {PROJECT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="budget_range" className={labelClass}>Budget Range</label>
          <select
            id="budget_range"
            {...register('budget_range')}
            className={cn(fieldClass, 'appearance-none cursor-pointer')}
          >
            <option value="">Select budget</option>
            {BUDGET_RANGES.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className={labelClass}>Message</label>
        <textarea
          id="message"
          rows={4}
          placeholder="Tell us about your project, timeline, or any specific requirements…"
          {...register('message')}
          className={cn(fieldClass, 'resize-none', errors.message && 'border-red-400')}
        />
        {errors.message && <p className={errorClass}>{errors.message.message}</p>}
      </div>

      {/* Server error */}
      {serverError && (
        <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-3 border border-red-200">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-gold w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Sending…' : 'Send Enquiry'}
      </button>
    </form>
  )
}
