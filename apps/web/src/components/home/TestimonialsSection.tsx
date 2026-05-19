import SectionLabel from '@/components/shared/SectionLabel'
import AnimatedHeading from '@/components/shared/AnimatedHeading'

const TESTIMONIALS = [
  {
    quote:
      'Kalpak Design Studio transformed our 3BHK apartment in Bandra into a space that truly reflects who we are. The attention to detail and quality of execution was exceptional — worth every rupee.',
    name: 'Priya & Rahul Sharma',
    project: 'Residential — Bandra, Mumbai',
    rating: 5,
  },
  {
    quote:
      'We hired them for our corporate office in Pune and the results were beyond expectations. Our team loves the new workspace. The design has genuinely improved how we collaborate every day.',
    name: 'Vikram Mehta',
    project: 'Office Interior — Kothrud, Pune',
    rating: 5,
  },
  {
    quote:
      "The team understood our restaurant's vision perfectly. The ambiance they created has become a talking point among our guests. We've seen a 30% uptick in walk-in reservations since the remodel.",
    name: 'Anita Joshi',
    project: 'Hospitality — Connaught Place, Delhi',
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <section className="section-pad bg-warm-white">
      <div className="container-wide">
        <div className="text-center mb-16">
          <SectionLabel>Client Stories</SectionLabel>
          <AnimatedHeading className="text-4xl md:text-5xl font-light text-charcoal tracking-wide">
            What Our Clients Say
          </AnimatedHeading>
        </div>

        {/* Desktop: 3 columns */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} />
          ))}
        </div>

        {/* Mobile: scroll-snap carousel */}
        <div
          className="md:hidden flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="snap-center shrink-0 w-[85vw]">
              <TestimonialCard testimonial={t} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof TESTIMONIALS)[0]
}) {
  return (
    <div className="bg-cream p-8 border border-stone-light/30 flex flex-col h-full">
      <div className="text-gold font-heading text-6xl font-light leading-none mb-4 select-none" aria-hidden="true">
        &ldquo;
      </div>
      <p className="font-body text-sm text-charcoal leading-relaxed flex-1 mb-6">{testimonial.quote}</p>
      <div className="flex items-center gap-1 mb-4" aria-label={`${testimonial.rating} out of 5 stars`}>
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <svg key={i} className="w-3.5 h-3.5 text-gold fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <div>
        <p className="font-body text-sm font-medium text-charcoal">{testimonial.name}</p>
        <p className="font-body text-xs text-stone tracking-wide mt-0.5">{testimonial.project}</p>
      </div>
    </div>
  )
}
