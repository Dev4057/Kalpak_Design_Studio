import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SectionLabel from '@/components/shared/SectionLabel'
import AnimatedHeading from '@/components/shared/AnimatedHeading'

type ProjectRow = {
  id: string
  name: string
  city: string | null
  project_type: string
}

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
  'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
]

export default async function FeaturedProjects() {
  let projects: ProjectRow[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('projects')
      .select('id, name, city, project_type')
      .eq('is_published', true)
      .order('actual_end_date', { ascending: false })
      .limit(6)
    projects = (data ?? []) as ProjectRow[]
  } catch {
    projects = []
  }

  return (
    <section className="section-pad bg-warm-white">
      <div className="container-wide">
        <div className="text-center mb-16">
          <SectionLabel>Our Work</SectionLabel>
          <AnimatedHeading className="text-4xl md:text-5xl font-light text-charcoal tracking-wide">
            Selected Projects
          </AnimatedHeading>
        </div>

        {projects.length === 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {PLACEHOLDER_IMAGES.map((_, i) => (
              <div
                key={i}
                className={`break-inside-avoid animate-pulse bg-stone-light/30 rounded ${i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]'}`}
              />
            ))}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {projects.map((project, i) => (
              <Link
                key={project.id}
                href={`/portfolio/${project.id}`}
                className="group break-inside-avoid block relative overflow-hidden"
              >
                <div className={`relative ${i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]'}`}>
                  <Image
                    src={PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length]}
                    alt={project.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col justify-end p-6">
                    <h3 className="font-heading text-xl font-light text-white">{project.name}</h3>
                    <p className="font-body text-xs tracking-widest uppercase text-stone-light/80 mt-1">
                      {project.project_type} · {project.city}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/portfolio"
            className="font-body text-xs tracking-widest uppercase text-gold hover:text-gold-light transition-colors inline-flex items-center gap-2"
          >
            View All Projects
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
