'use client'

import { motion, useReducedMotion } from 'framer-motion'
import SectionLabel from '@/components/shared/SectionLabel'
import AnimatedHeading from '@/components/shared/AnimatedHeading'

const STEPS = [
  {
    num: '01',
    title: 'Discovery & Brief',
    desc: 'Understanding your lifestyle, preferences, and vision through an in-depth consultation.',
  },
  {
    num: '02',
    title: 'Concept Design',
    desc: 'Mood boards, spatial concepts, and design directions presented for your feedback and approval.',
  },
  {
    num: '03',
    title: 'Design Development',
    desc: 'Detailed drawings, material selections, furniture specifications, and 3D visualizations.',
  },
  {
    num: '04',
    title: 'Execution',
    desc: 'Project management, vendor coordination, and dedicated on-site supervision throughout.',
  },
  {
    num: '05',
    title: 'Handover',
    desc: 'Final styling, snag rectification, and a complete walkthrough of your transformed space.',
  },
]

export default function ProcessSection() {
  const shouldReduce = useReducedMotion()

  return (
    <section className="section-pad bg-cream">
      <div className="container-wide">
        <div className="text-center mb-16">
          <SectionLabel>How We Work</SectionLabel>
          <AnimatedHeading className="text-4xl md:text-5xl font-light text-charcoal tracking-wide">
            Our Design Process
          </AnimatedHeading>
        </div>

        {/* Desktop: horizontal timeline */}
        <div className="hidden md:grid md:grid-cols-5 gap-0">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
              whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true, margin: '-50px' }}
              className="relative flex flex-col items-center text-center px-4"
            >
              {i < STEPS.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-px bg-stone-light/50" aria-hidden="true" />
              )}
              <div className="relative w-10 h-10 rounded-full border border-gold flex items-center justify-center mb-5 bg-cream z-10">
                <span className="font-body text-[10px] text-gold font-medium tracking-wider">{step.num}</span>
              </div>
              <h3 className="font-heading text-lg font-light text-charcoal mb-2 tracking-wide">{step.title}</h3>
              <p className="font-body text-xs text-stone leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden flex flex-col">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={shouldReduce ? {} : { opacity: 0, x: -24 }}
              whileInView={shouldReduce ? {} : { opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              viewport={{ once: true }}
              className="flex gap-6 pb-10 relative"
            >
              {i < STEPS.length - 1 && (
                <div className="absolute left-5 top-10 bottom-0 w-px bg-stone-light/50" aria-hidden="true" />
              )}
              <div className="w-10 h-10 shrink-0 rounded-full border border-gold flex items-center justify-center bg-cream z-10">
                <span className="font-body text-[10px] text-gold font-medium tracking-wider">{step.num}</span>
              </div>
              <div className="pt-2">
                <h3 className="font-heading text-xl font-light text-charcoal mb-2 tracking-wide">{step.title}</h3>
                <p className="font-body text-sm text-stone leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
