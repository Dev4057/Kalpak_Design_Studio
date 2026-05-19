import Image from 'next/image'
import Link from 'next/link'

export default function CtaSection() {
  return (
    <section className="relative py-32 md:py-40 overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1920&q=80"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 text-center px-4">
        <span className="block font-body text-xs tracking-widest uppercase text-stone-light/60 mb-5">
          Begin Your Journey
        </span>
        <h2 className="font-heading text-4xl md:text-6xl font-light text-white tracking-wide mb-5 text-balance max-w-2xl mx-auto">
          Ready to Transform Your Space?
        </h2>
        <p className="font-body text-stone-light/80 text-lg mb-10 max-w-lg mx-auto">
          Let&apos;s start a conversation about your vision.
        </p>
        <Link href="/contact" className="btn-gold">
          Start Your Project
        </Link>
      </div>
    </section>
  )
}
