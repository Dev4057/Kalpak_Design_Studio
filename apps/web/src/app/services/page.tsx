import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Interior design, architecture, turnkey projects, and space planning — comprehensive design services across India.',
}

const SERVICES = [
  {
    href: '/services/interior-design',
    title: 'Interior Design',
    description:
      'We create interiors that are the perfect expression of your personality and aspirations. From concept to styling — every detail considered, every space transformed.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
  },
  {
    href: '/services/architecture',
    title: 'Architecture',
    description:
      'Buildings that respond to context, serve their occupants, and stand the test of time. Thoughtful architecture from concept through to construction.',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
  },
  {
    href: '/services/turnkey',
    title: 'Turnkey Projects',
    description:
      'Complete project ownership from design to handover. One team, fixed price, zero surprises. We take the stress so you can focus on moving in.',
    image: 'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=1200&q=80',
  },
  {
    href: '/services/space-planning',
    title: 'Space Planning',
    description:
      'The invisible backbone of great interiors. We optimise your floor plan for flow, light, and function — before a single piece of furniture moves.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
  },
]

export default function ServicesPage() {
  return (
    <>
      {/* Header */}
      <div className="pt-32 pb-16 md:pt-40 md:pb-20 bg-warm-white border-b border-stone-light/30">
        <div className="container-wide">
          <span className="block font-body text-xs tracking-widest uppercase text-stone mb-4">What We Do</span>
          <h1 className="font-heading text-5xl md:text-6xl font-light text-charcoal tracking-wide">Services</h1>
        </div>
      </div>

      {/* Service cards */}
      <div>
        {SERVICES.map((service, i) => (
          <div
            key={service.href}
            className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} min-h-[480px]`}
          >
            {/* Image */}
            <div className="relative w-full md:w-1/2 aspect-video md:aspect-auto min-h-64">
              <Image
                src={service.image}
                alt={service.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className={`w-full md:w-1/2 flex items-center bg-cream ${i % 2 === 0 ? '' : ''}`}>
              <div className="p-10 md:p-16 max-w-lg">
                <span className="block font-body text-xs tracking-widest uppercase text-gold mb-4">
                  0{i + 1}
                </span>
                <h2 className="font-heading text-4xl md:text-5xl font-light text-charcoal tracking-wide mb-6">
                  {service.title}
                </h2>
                <p className="font-body text-sm text-stone leading-relaxed mb-8">
                  {service.description}
                </p>
                <Link
                  href={service.href}
                  className="font-body text-xs tracking-widest uppercase text-gold hover:text-gold-light transition-colors inline-flex items-center gap-2"
                >
                  Explore {service.title}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
