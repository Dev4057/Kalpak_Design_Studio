import Link from 'next/link'
import SectionLabel from '@/components/shared/SectionLabel'
import AnimatedHeading from '@/components/shared/AnimatedHeading'

export default function EstimatorTeaser() {
  return (
    <section className="section-pad bg-warm-white">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionLabel>Free Tool</SectionLabel>
            <AnimatedHeading className="text-3xl md:text-4xl font-light text-charcoal tracking-wide mb-5">
              Get a Rough Estimate
            </AnimatedHeading>
            <p className="font-body text-sm text-stone leading-relaxed mb-8 max-w-md">
              Not sure how much your project might cost? Our free estimator gives you a ballpark figure in under 2 minutes — no sign-up required.
            </p>
            <Link href="/estimator" className="btn-gold inline-flex">
              Try the Estimator →
            </Link>
          </div>
          <div className="bg-cream border border-stone-light/30 p-8">
            <div className="space-y-4">
              {[
                { step: '01', label: 'Select your project type & location' },
                { step: '02', label: 'Describe the scope and quality level' },
                { step: '03', label: 'Get an instant rough estimate' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <span className="font-heading text-3xl font-light text-gold/40 leading-none w-10 shrink-0">
                    {item.step}
                  </span>
                  <p className="font-body text-sm text-stone leading-relaxed pt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}