import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import SectionLabel from '@/components/shared/SectionLabel'
import AnimatedHeading from '@/components/shared/AnimatedHeading'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Kalpak Design Studio — a Mumbai-based interior design firm crafting exceptional spaces across India since 2012.',
}

const PARTNERS = [
  {
    image: '/sachin_prabhune.png',
    name: 'Sachin Prabhune',
    title: 'Director',
    bio: 'A seasoned design and project management professional with 20 years of experience in building design, architecture, and interior project execution. Skilled in handling residential and commercial developments, client relations, financial planning, site management, and end-to-end project delivery. Has delivered 50+ residential and 30+ commercial projects with a strong focus on design excellence, functionality, and seamless execution.',
  },
  {
    image: '/tanaya_gandhi.png',
    name: 'Tanaya Gandhi',
    title: 'Senior Project Head | Interior Designer',
    bio: 'A dedicated and detail-oriented Interior Designer with 7 years of professional experience. Expert in end-to-end project workflows — design coordination, space planning, material selection, site supervision, and execution management. Passionate about creating thoughtfully designed environments that balance creativity, practicality, and attention to detail while ensuring every project reflects professionalism, innovation, and seamless execution.',
  },
]

const TEAM = [
  { image: '/pranali_%20bahirat.png', name: 'Pranali Bahirat', role: 'Interior Designer' },
]

const VALUES = [
  {
    title: 'Quality',
    description:
      'We never compromise on the calibre of materials, craftsmanship, or design. Every detail is considered, every finish is deliberate.',
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: 'Transparency',
    description:
      'Honest conversations about timelines, budgets, and possibilities. No surprises — only clear communication from brief to handover.',
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: 'Timelines',
    description:
      'We understand that your home or office is your life. We plan meticulously and execute decisively so your project is delivered when promised.',
    icon: (
      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const AWARDS = [
  'iNSPIRE Design Awards 2023',
  'Architecture & Interior Design Forum 2022',
  'Elle Décor 2023 Shortlist',
  'Design Innovation Award 2021',
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div className="pt-32 pb-16 md:pt-40 md:pb-20 bg-warm-white border-b border-stone-light/30">
        <div className="container-wide">
          <SectionLabel>Who We Are</SectionLabel>
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-light text-charcoal tracking-wide max-w-2xl">
            Design Is How We See the World
          </h1>
        </div>
      </div>

      {/* Studio Story */}
      <section className="section-pad bg-cream">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80"
                alt="Kalpak Design Studio project"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <SectionLabel>Our Story</SectionLabel>
              <AnimatedHeading className="text-3xl md:text-4xl font-light text-charcoal tracking-wide mb-8">
                Founded on a Love for Beautiful Spaces
              </AnimatedHeading>
              <div className="space-y-5 font-body text-sm text-stone leading-relaxed">
                <p>
                  Kalpak Design Studio was founded in 2012 in Mumbai with a simple but ambitious mission: to bring world-class design to Indian homes and businesses. What began as a two-person studio has grown into a 14-person team delivering projects across Mumbai, Pune, Bengaluru, and Delhi.
                </p>
                <p>
                  We believe that great design is never about following trends — it's about understanding people. We ask deep questions, listen carefully, and translate what we hear into spaces that feel entirely natural to the people who inhabit them.
                </p>
                <p>
                  Our work spans 3BHK apartments in Bandra to sprawling villas in Lonavala, corporate offices in Whitefield to restaurants in Khan Market. What unites every project is our commitment to quality, our respect for the client's vision, and our belief that the details are everything.
                </p>
              </div>
              <Link href="/contact" className="btn-outline mt-10 inline-flex">
                Start a Conversation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="section-pad bg-warm-white">
        <div className="container-wide">
          <SectionLabel>The Founders</SectionLabel>
          <AnimatedHeading className="text-3xl md:text-4xl font-light text-charcoal tracking-wide mb-12">
            Led by Design
          </AnimatedHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PARTNERS.map((partner) => (
              <div key={partner.name} className="flex gap-6 p-8 bg-cream border border-stone-light/30">
                <div className="relative w-24 h-24 shrink-0 rounded-full overflow-hidden">
                  <Image
                    src={partner.image}
                    alt={partner.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-light text-charcoal tracking-wide mb-1">{partner.name}</h3>
                  <p className="font-body text-xs tracking-widest uppercase text-gold mb-4">{partner.title}</p>
                  <p className="font-body text-sm text-stone leading-relaxed">{partner.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-pad bg-cream">
        <div className="container-wide">
          <SectionLabel>Our Team</SectionLabel>
          <AnimatedHeading className="text-3xl md:text-4xl font-light text-charcoal tracking-wide mb-12">
            The People Behind Every Project
          </AnimatedHeading>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="text-center">
                <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <h4 className="font-heading text-lg font-light text-charcoal tracking-wide">{member.name}</h4>
                <p className="font-body text-xs text-stone mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-pad bg-warm-white">
        <div className="container-wide">
          <SectionLabel>What We Believe</SectionLabel>
          <AnimatedHeading className="text-3xl md:text-4xl font-light text-charcoal tracking-wide mb-12">
            Our Values
          </AnimatedHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUES.map((value) => (
              <div key={value.title} className="p-8 bg-cream border border-stone-light/30">
                <div className="mb-5">{value.icon}</div>
                <h3 className="font-heading text-2xl font-light text-charcoal tracking-wide mb-3">{value.title}</h3>
                <p className="font-body text-sm text-stone leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-12 bg-charcoal">
        <div className="container-wide">
          <p className="font-body text-xs tracking-widest uppercase text-stone text-center mb-8">
            Recognition
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {AWARDS.map((award) => (
              <span key={award} className="font-heading text-lg font-light text-stone-light/60 tracking-wide">
                {award}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
