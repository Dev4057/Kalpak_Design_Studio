'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@kalpak/shared'

// ── Types ────────────────────────────────────────────────────────────────────

type ProjectType = 'residential_apartment' | 'villa' | 'office' | 'restaurant' | 'retail'
type QualityLevel = 'essential' | 'premium' | 'luxury'
type CityTier = 'tier1' | 'tier2' | 'tier3'
type ScopeItem =
  | 'false_ceiling' | 'flooring' | 'modular_kitchen' | 'wardrobes'
  | 'bathroom' | 'electrical' | 'painting' | 'furniture' | 'curtains'

// ── Calculation constants ────────────────────────────────────────────────────

const BASE_RATES: Record<ProjectType, Record<QualityLevel, number>> = {
  residential_apartment: { essential: 800, premium: 1500, luxury: 2800 },
  villa: { essential: 1000, premium: 1800, luxury: 3500 },
  office: { essential: 1200, premium: 2000, luxury: 3800 },
  restaurant: { essential: 1500, premium: 2500, luxury: 4500 },
  retail: { essential: 1200, premium: 2200, luxury: 4000 },
}

const CITY_TIER_MULTIPLIER: Record<CityTier, number> = {
  tier1: 1.0, tier2: 0.85, tier3: 0.70,
}

const SCOPE_MULTIPLIERS: Record<ScopeItem, number> = {
  false_ceiling: 0.08, flooring: 0.10, modular_kitchen: 0.15,
  wardrobes: 0.12, bathroom: 0.10, electrical: 0.08,
  painting: 0.05, furniture: 0.12, curtains: 0.04,
}

const SCOPE_LABELS: Record<ScopeItem, string> = {
  false_ceiling: 'False Ceiling',
  flooring: 'Flooring',
  modular_kitchen: 'Modular Kitchen',
  wardrobes: 'Wardrobes / Storage',
  bathroom: 'Bathroom Renovation',
  electrical: 'Electrical + Lighting',
  painting: 'Painting',
  furniture: 'Furniture (loose)',
  curtains: 'Curtains / Furnishings',
}

function calculateEstimate(
  projectType: ProjectType,
  qualityLevel: QualityLevel,
  cityTier: CityTier,
  scope: ScopeItem[],
  areaSqFt: number
): { min: number; max: number } {
  const baseRate = BASE_RATES[projectType][qualityLevel]
  const scopeMultiplier = scope.reduce((acc, s) => acc + SCOPE_MULTIPLIERS[s], 1.0)
  const cityMultiplier = CITY_TIER_MULTIPLIER[cityTier]
  const base = areaSqFt * baseRate * cityMultiplier * scopeMultiplier
  return { min: Math.round(base * 0.85), max: Math.round(base * 1.15) }
}

// ── Step indicators ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-body text-xs font-medium transition-colors ${
              i < current
                ? 'bg-gold text-cream'
                : i === current
                  ? 'bg-charcoal text-cream'
                  : 'bg-stone-light/30 text-stone'
            }`}
          >
            {i < current ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 w-8 ${i < current ? 'bg-gold' : 'bg-stone-light/30'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export function CostEstimator() {
  const [step, setStep] = useState(0)
  const [projectType, setProjectType] = useState<ProjectType | null>(null)
  const [cityTier, setCityTier] = useState<CityTier>('tier1')
  const [areaSqFt, setAreaSqFt] = useState(500)
  const [scope, setScope] = useState<ScopeItem[]>([])
  const [qualityLevel, setQualityLevel] = useState<QualityLevel | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [estimate, setEstimate] = useState<{ min: number; max: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

  const PROJECT_TYPES: Array<{ value: ProjectType; label: string; icon: string }> = [
    { value: 'residential_apartment', label: 'Residential Apartment', icon: '🏠' },
    { value: 'villa', label: 'Villa / Bungalow', icon: '🏡' },
    { value: 'office', label: 'Office Space', icon: '🏢' },
    { value: 'restaurant', label: 'Restaurant / Café', icon: '🍽️' },
    { value: 'retail', label: 'Retail / Showroom', icon: '🏬' },
  ]

  const QUALITY_LEVELS: Array<{ value: QualityLevel; label: string; desc: string }> = [
    { value: 'essential', label: 'Essential', desc: 'Functional, value for money' },
    { value: 'premium', label: 'Premium', desc: 'Quality materials, curated design' },
    { value: 'luxury', label: 'Luxury', desc: 'Top-tier materials, bespoke elements' },
  ]

  const SCOPE_ITEMS = Object.entries(SCOPE_LABELS) as Array<[ScopeItem, string]>

  function toggleScope(item: ScopeItem) {
    setScope((prev) => prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item])
  }

  async function handleSubmitContact() {
    if (!projectType || !qualityLevel) return
    setSubmitting(true)
    const est = calculateEstimate(projectType, qualityLevel, cityTier, scope, areaSqFt)
    setEstimate(est)

    try {
      await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name,
          phone,
          email: email || undefined,
          message: message || `Cost estimator lead. Estimate: ${formatCurrency(est.min)} – ${formatCurrency(est.max)}`,
          budget_range: `${formatCurrency(est.min)} – ${formatCurrency(est.max)}`,
          project_type: projectType,
          source_page: 'cost_estimator',
        }),
      })
    } catch {
      // silent — still show results even if lead save fails
    }
    setSubmitting(false)
    setSubmitted(true)
  }

  // Step 0: Project Basics
  if (step === 0) {
    return (
      <div className="pt-32 pb-20 bg-warm-white min-h-screen">
        <div className="container-wide max-w-3xl">
          <StepIndicator current={0} total={3} />
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Step 1 of 3</p>
          <h1 className="font-heading text-4xl md:text-5xl font-light text-charcoal tracking-wide mb-2">
            Project Basics
          </h1>
          <p className="font-body text-sm text-stone mb-8">Tell us about your project type and location.</p>

          <div className="mb-8">
            <p className="font-body text-xs tracking-widest uppercase text-stone mb-4">Project Type</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PROJECT_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  onClick={() => setProjectType(pt.value)}
                  className={`p-5 text-left border transition-all ${
                    projectType === pt.value
                      ? 'border-gold bg-gold/5'
                      : 'border-stone-light/30 bg-cream hover:border-stone/50'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{pt.icon}</span>
                  <span className="font-body text-sm font-medium text-charcoal">{pt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="font-body text-xs tracking-widest uppercase text-stone mb-4">City Tier</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {([
                { value: 'tier1' as CityTier, label: 'Tier 1', desc: 'Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune' },
                { value: 'tier2' as CityTier, label: 'Tier 2', desc: 'Other major cities' },
                { value: 'tier3' as CityTier, label: 'Tier 3', desc: 'Smaller cities & towns' },
              ] as const).map((t) => (
                <button
                  key={t.value}
                  onClick={() => setCityTier(t.value)}
                  className={`p-4 text-left border transition-all ${
                    cityTier === t.value
                      ? 'border-gold bg-gold/5'
                      : 'border-stone-light/30 bg-cream hover:border-stone/50'
                  }`}
                >
                  <p className="font-body text-sm font-medium text-charcoal">{t.label}</p>
                  <p className="font-body text-xs text-stone mt-1">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            disabled={!projectType}
            className="btn-gold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next: Space Details →
          </button>
        </div>
      </div>
    )
  }

  // Step 1: Space Details
  if (step === 1) {
    return (
      <div className="pt-32 pb-20 bg-warm-white min-h-screen">
        <div className="container-wide max-w-3xl">
          <StepIndicator current={1} total={3} />
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Step 2 of 3</p>
          <h1 className="font-heading text-4xl md:text-5xl font-light text-charcoal tracking-wide mb-2">
            Space Details
          </h1>
          <p className="font-body text-sm text-stone mb-8">How large is the space and what work needs to be done?</p>

          <div className="mb-8">
            <p className="font-body text-xs tracking-widest uppercase text-stone mb-3">Area (sq ft)</p>
            <div className="flex items-center gap-6">
              <input
                type="range"
                min={100}
                max={10000}
                step={50}
                value={areaSqFt}
                onChange={(e) => setAreaSqFt(Number(e.target.value))}
                className="flex-1 accent-gold"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={areaSqFt}
                  min={100}
                  max={10000}
                  onChange={(e) => setAreaSqFt(Math.max(100, Math.min(10000, Number(e.target.value))))}
                  className="w-24 font-body text-sm text-charcoal bg-transparent border border-stone-light/60 px-3 py-2 focus:outline-none focus:border-gold"
                />
                <span className="font-body text-sm text-stone">sq ft</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <p className="font-body text-xs tracking-widest uppercase text-stone mb-4">Scope of Work (select all that apply)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SCOPE_ITEMS.map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer p-3 border border-stone-light/30 hover:border-stone/50 bg-cream transition-colors">
                  <input
                    type="checkbox"
                    checked={scope.includes(value)}
                    onChange={() => toggleScope(value)}
                    className="w-4 h-4 accent-gold"
                  />
                  <span className="font-body text-sm text-charcoal">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="font-body text-xs tracking-widest uppercase text-stone mb-4">Quality Level</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {QUALITY_LEVELS.map((q) => (
                <button
                  key={q.value}
                  onClick={() => setQualityLevel(q.value)}
                  className={`p-5 text-left border transition-all ${
                    qualityLevel === q.value
                      ? 'border-gold bg-gold/5'
                      : 'border-stone-light/30 bg-cream hover:border-stone/50'
                  }`}
                >
                  <p className="font-body text-sm font-medium text-charcoal">{q.label}</p>
                  <p className="font-body text-xs text-stone mt-1">{q.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(0)} className="btn-outline">← Back</button>
            <button
              onClick={() => setStep(2)}
              disabled={!qualityLevel}
              className="btn-gold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next: Your Details →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Contact Details
  if (step === 2 && !submitted) {
    return (
      <div className="pt-32 pb-20 bg-warm-white min-h-screen">
        <div className="container-wide max-w-2xl">
          <StepIndicator current={2} total={3} />
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Step 3 of 3</p>
          <h1 className="font-heading text-4xl md:text-5xl font-light text-charcoal tracking-wide mb-2">
            Your Details
          </h1>
          <p className="font-body text-sm text-stone mb-8">
            We&apos;ll send your estimate and our team will reach out if you want a detailed quote.
          </p>

          <div className="space-y-5">
            <div>
              <label className="font-body text-xs tracking-widest uppercase text-stone block mb-2">
                Full Name <span className="text-gold">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full font-body text-sm text-charcoal bg-transparent border border-stone-light/60 px-4 py-3 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="font-body text-xs tracking-widest uppercase text-stone block mb-2">
                Phone <span className="text-gold">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full font-body text-sm text-charcoal bg-transparent border border-stone-light/60 px-4 py-3 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="font-body text-xs tracking-widest uppercase text-stone block mb-2">
                Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full font-body text-sm text-charcoal bg-transparent border border-stone-light/60 px-4 py-3 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="font-body text-xs tracking-widest uppercase text-stone block mb-2">
                Anything specific? (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your project..."
                rows={3}
                className="w-full font-body text-sm text-charcoal bg-transparent border border-stone-light/60 px-4 py-3 focus:outline-none focus:border-gold transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button onClick={() => setStep(1)} className="btn-outline">← Back</button>
            <button
              onClick={handleSubmitContact}
              disabled={!name || !phone || submitting}
              className="btn-gold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Calculating…' : 'Get My Estimate →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Results
  if (submitted && estimate) {
    const pType = PROJECT_TYPES.find((p) => p.value === projectType)!
    const qLevel = QUALITY_LEVELS.find((q) => q.value === qualityLevel)!

    const breakdowns = [
      { label: 'Design + Planning', pct: 0.12 },
      { label: 'Civil + Flooring', pct: 0.20 },
      { label: 'Electrical + Lighting', pct: 0.15 },
      { label: 'Modular Work', pct: 0.25 },
      { label: 'Furnishing', pct: 0.18 },
      { label: 'Supervision + Misc', pct: 0.10 },
    ]

    return (
      <div className="pt-32 pb-20 bg-warm-white min-h-screen">
        <div className="container-wide max-w-2xl">
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-4">Your Estimate</p>
          <h1 className="font-heading text-4xl md:text-5xl font-light text-charcoal tracking-wide mb-2">
            Your Estimated Investment
          </h1>
          <p className="font-body text-sm text-stone mb-8">
            {pType.icon} {pType.label} · {areaSqFt.toLocaleString()} sq ft · {qLevel.label} quality
          </p>

          <div className="bg-cream border border-stone-light/30 p-8 mb-8">
            <p className="font-heading text-4xl md:text-5xl font-light text-charcoal tracking-wide text-center">
              {formatCurrency(estimate.min)} — {formatCurrency(estimate.max)}
            </p>
            <p className="font-body text-xs text-stone text-center mt-4 leading-relaxed max-w-md mx-auto">
              This is a rough indicative estimate. Actual cost depends on your specific requirements, material choices, and site conditions. Request a detailed quote for an accurate figure.
            </p>
          </div>

          <div className="mb-8">
            <p className="font-body text-xs tracking-widest uppercase text-stone mb-4">Approximate Breakdown</p>
            <div className="space-y-2">
              {breakdowns.map((b) => (
                <div key={b.label} className="flex items-center justify-between py-2 border-b border-stone-light/30">
                  <span className="font-body text-sm text-stone">{b.label}</span>
                  <span className="font-body text-sm text-charcoal font-medium">
                    {formatCurrency(Math.round(estimate.min * b.pct))} — {formatCurrency(Math.round(estimate.max * b.pct))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-charcoal p-8 text-center">
            <p className="font-heading text-2xl font-light text-cream tracking-wide mb-2">
              Like what you see?
            </p>
            <p className="font-body text-sm text-stone-light/70 mb-6">
              Get a detailed, accurate quote from our team.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="btn-gold">
                Book Free Consultation
              </Link>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919876543210'}?text=Hi, I got an estimate of ${formatCurrency(estimate.min)}-${formatCurrency(estimate.max)} from your website for my ${pType.label.toLowerCase()} project.`}
                target="_blank"
                rel="noreferrer"
                className="btn-outline-white"
              >
                WhatsApp Us
              </a>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setStep(0); setSubmitted(false); setEstimate(null); setProjectType(null); setQualityLevel(null); setScope([]); setAreaSqFt(500) }}
              className="font-body text-xs text-stone hover:text-charcoal transition-colors"
            >
              ← Start a new estimate
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
