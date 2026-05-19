import type { Metadata } from 'next'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Kalpak Design Studio to discuss your interior design project. Book a consultation today.',
}

export default function ContactPage() {
  return (
    <>
      {/* Page header */}
      <div className="pt-32 pb-16 md:pt-40 md:pb-20 bg-warm-white border-b border-stone-light/30">
        <div className="container-wide">
          <span className="block font-body text-xs tracking-widest uppercase text-stone mb-4">
            Get In Touch
          </span>
          <h1 className="font-heading text-5xl md:text-6xl font-light text-charcoal tracking-wide">
            Contact Us
          </h1>
        </div>
      </div>

      <section className="section-pad">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left: Contact info */}
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-light text-charcoal tracking-wide mb-6">
                Let&apos;s Create Something Beautiful
              </h2>
              <p className="font-body text-sm text-stone leading-relaxed mb-12 max-w-sm">
                Whether you have a clear vision or are just starting to explore ideas, we&apos;d love to
                hear from you. Our team will reach out within 24 hours.
              </p>

              <div className="space-y-8">
                {/* Phone */}
                <div>
                  <p className="font-body text-xs tracking-widest uppercase text-stone mb-2">Phone</p>
                  <a
                    href="tel:+919876543210"
                    className="font-body text-base text-charcoal hover:text-gold transition-colors"
                  >
                    +91 98765 43210
                  </a>
                </div>

                {/* Email */}
                <div>
                  <p className="font-body text-xs tracking-widest uppercase text-stone mb-2">Email</p>
                  <a
                    href="mailto:hello@kalpakdesign.in"
                    className="font-body text-base text-charcoal hover:text-gold transition-colors"
                  >
                    hello@kalpakdesign.in
                  </a>
                </div>

                {/* Address */}
                <div>
                  <p className="font-body text-xs tracking-widest uppercase text-stone mb-2">Studio</p>
                  <address className="font-body text-base text-charcoal not-italic leading-relaxed">
                    201 Design Arcade<br />
                    Bandra West<br />
                    Mumbai – 400 050
                  </address>
                </div>

                {/* Hours */}
                <div>
                  <p className="font-body text-xs tracking-widest uppercase text-stone mb-2">Working Hours</p>
                  <p className="font-body text-sm text-charcoal">Mon – Sat, 10 AM – 7 PM</p>
                </div>

                {/* Socials */}
                <div>
                  <p className="font-body text-xs tracking-widest uppercase text-stone mb-3">Follow Us</p>
                  <div className="flex gap-5">
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="font-body text-xs tracking-widest uppercase text-charcoal hover:text-gold transition-colors">Instagram</a>
                    <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="font-body text-xs tracking-widest uppercase text-charcoal hover:text-gold transition-colors">Pinterest</a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="font-body text-xs tracking-widest uppercase text-charcoal hover:text-gold transition-colors">LinkedIn</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
