'use client'

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  const { scrollY } = useScroll()
  const shouldReduce = useReducedMotion()
  const yBg = useTransform(scrollY, [0, 800], [0, shouldReduce ? 0 : -200])

  return (
    <section className="relative h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Parallax background */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 scale-110">
        <Image
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80"
          alt="Luxury interior by Kalpak Design Studio"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.span
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="block font-body text-xs tracking-widest uppercase text-stone-light/80 mb-6"
        >
          Luxury Interior Design
        </motion.span>

        <motion.h1
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white leading-[1.1] tracking-wide mb-6 text-balance"
        >
          We Design Spaces<br className="hidden sm:block" /> That Tell Your Story
        </motion.h1>

        <motion.p
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="font-body text-lg text-stone-light/80 mb-10 max-w-xl mx-auto leading-relaxed"
        >
          Creating interiors that are beautiful, functional, and uniquely yours.
        </motion.p>

        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/portfolio" className="btn-gold">View Our Work</Link>
          <Link href="/contact" className="btn-outline-white">Get In Touch</Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={shouldReduce ? {} : { y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
        aria-hidden="true"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.div>

      {/* Sentinel for transparent navbar */}
      <div id="nav-sentinel" className="absolute bottom-0 left-0 w-full h-1 pointer-events-none" aria-hidden="true" />
    </section>
  )
}
