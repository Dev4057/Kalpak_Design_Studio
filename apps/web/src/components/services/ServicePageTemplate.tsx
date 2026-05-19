import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProjectCard, { type ProjectRow } from '@/components/portfolio/ProjectCard'
import SectionLabel from '@/components/shared/SectionLabel'
import AnimatedHeading from '@/components/shared/AnimatedHeading'

export interface ServiceContent {
  title: string
  tagline: string
  heroImage: string
  description: string
  whatWeOffer: Array<{ title: string; description: string }>
  process: Array<{ num: string; title: string; desc: string }>
  projectType: string
}

export default async function ServicePageTemplate({
  content,
}: {
  content: ServiceContent
}) {
  let related: ProjectRow[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('projects')
      .select('id, name, city, project_type')
      .eq('project_type', content.projectType)
      .eq('is_published', true)
      .limit(3)
    related = (data ?? []) as ProjectRow[]
  } catch {
    related = []
  }

  return (
    <>
      {/* Hero */}
      <div className="relative flex items-end overflow-hidden" style={{ height: '50vh', minHeight: '300px' }}>
        <Image
          src={content.heroImage}
          alt={content.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container-wide pb-14">
          <Link href="/services" className="font-body text-xs tracking-widest uppercase text-stone-light/60 hover:text-stone-light transition-colors mb-4 inline-flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Services
          </Link>
          <span className="block font-body text-xs tracking-widest uppercase text-stone-light/60 mb-2">{content.tagline}</span>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-white tracking-wide">{content.title}</h1>
        </div>
      </div>

      {/* Description */}
      <section className="section-pad bg-cream">
        <div className="container-wide max-w-3xl">
          <p className="font-body text-base md:text-lg text-stone leading-relaxed">{content.description}</p>
        </div>
      </section>

      {/* What we offer */}
      <section className="section-pad bg-warm-white">
        <div className="container-wide">
          <div className="mb-12">
            <SectionLabel>Our Offering</SectionLabel>
            <AnimatedHeading className="text-3xl md:text-4xl font-light text-charcoal tracking-wide">
              What We Deliver
            </AnimatedHeading>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {content.whatWeOffer.map((item, i) => (
              <div key={i} className="flex gap-5">
                <div className="w-px bg-gold shrink-0 mt-1.5" style={{ height: '20px' }} aria-hidden="true" />
                <div>
                  <h3 className="font-heading text-xl font-light text-charcoal mb-2 tracking-wide">{item.title}</h3>
                  <p className="font-body text-sm text-stone leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service process */}
      <section className="section-pad bg-cream">
        <div className="container-wide">
          <div className="mb-12">
            <SectionLabel>How It Works</SectionLabel>
            <AnimatedHeading className="text-3xl md:text-4xl font-light text-charcoal tracking-wide">
              The Process
            </AnimatedHeading>
          </div>
          <div className="flex flex-col md:flex-row gap-0">
            {content.process.map((step, i) => (
              <div key={step.num} className="flex-1 relative pl-0 md:pl-4 pb-10 md:pb-0">
                {i < content.process.length - 1 && (
                  <>
                    <div className="hidden md:block absolute top-5 left-1/2 w-full h-px bg-stone-light/40" aria-hidden="true" />
                    <div className="md:hidden absolute left-5 top-10 bottom-0 w-px bg-stone-light/40" aria-hidden="true" />
                  </>
                )}
                <div className="flex md:flex-col gap-5 md:items-center md:text-center">
                  <div className="w-10 h-10 shrink-0 rounded-full border border-gold flex items-center justify-center bg-cream z-10">
                    <span className="font-body text-[10px] text-gold font-medium tracking-wider">{step.num}</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-light text-charcoal mb-1.5 tracking-wide">{step.title}</h3>
                    <p className="font-body text-sm text-stone leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related projects */}
      {related.length > 0 && (
        <section className="section-pad bg-warm-white">
          <div className="container-wide">
            <SectionLabel>Our Work</SectionLabel>
            <AnimatedHeading className="text-3xl md:text-4xl font-light text-charcoal tracking-wide mb-10">
              Related Projects
            </AnimatedHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-pad bg-charcoal">
        <div className="container-wide text-center">
          <SectionLabel light>Let&apos;s Work Together</SectionLabel>
          <AnimatedHeading className="text-3xl md:text-5xl font-light text-white tracking-wide mb-8">
            Ready to Begin Your Project?
          </AnimatedHeading>
          <Link href="/contact" className="btn-gold">Book a Consultation</Link>
        </div>
      </section>
    </>
  )
}
