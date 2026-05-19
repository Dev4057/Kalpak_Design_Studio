import Link from 'next/link'
import SectionLabel from '@/components/shared/SectionLabel'
import AnimatedHeading from '@/components/shared/AnimatedHeading'

const SERVICES = [
  {
    href: '/services/interior-design',
    title: 'Interior Design',
    description:
      'Transforming spaces with curated aesthetics, material palettes, and functional layouts tailored to your lifestyle.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/services/architecture',
    title: 'Architecture',
    description:
      'Thoughtful architectural design that balances form, function, and the surrounding environment.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: '/services/turnkey',
    title: 'Turnkey Projects',
    description:
      'End-to-end project delivery — from design concept to final handover — with complete accountability.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    href: '/services/space-planning',
    title: 'Space Planning',
    description:
      'Optimising floor plans for flow, functionality, and spatial harmony — making every square foot count.',
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
]

export default function ServicesPreview() {
  return (
    <section className="section-pad bg-cream">
      <div className="container-wide">
        <div className="text-center mb-16">
          <SectionLabel>What We Do</SectionLabel>
          <AnimatedHeading className="text-4xl md:text-5xl font-light text-charcoal tracking-wide">
            Crafting Exceptional Interiors
          </AnimatedHeading>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-stone-light/20">
          {SERVICES.map((service) => (
            <div
              key={service.href}
              className="group relative bg-cream p-8 md:p-10 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gold scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
              <div className="mb-6">{service.icon}</div>
              <h3 className="font-heading text-2xl font-light text-charcoal mb-3 tracking-wide">
                {service.title}
              </h3>
              <p className="font-body text-sm text-stone leading-relaxed mb-6">
                {service.description}
              </p>
              <Link
                href={service.href}
                className="font-body text-xs tracking-widest uppercase text-gold hover:text-gold-light transition-colors inline-flex items-center gap-2"
              >
                Learn More
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
