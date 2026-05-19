import type { Metadata } from 'next'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import ProjectFilter from '@/components/portfolio/ProjectFilter'
import type { ProjectRow } from '@/components/portfolio/ProjectCard'

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Browse our portfolio of exceptional interior design projects — residential, commercial, office, and hospitality spaces across India.',
}

export default async function PortfolioPage() {
  let projects: ProjectRow[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('projects')
      .select('id, name, city, project_type')
      .eq('is_published', true)
      .order('actual_end_date', { ascending: false })
    projects = (data ?? []) as ProjectRow[]
  } catch {
    projects = []
  }

  return (
    <>
      {/* Hero header */}
      <div className="relative flex items-end overflow-hidden" style={{ height: '40vh', minHeight: '240px' }}>
        <Image
          src="https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 container-wide pb-12">
          <span className="block font-body text-xs tracking-widest uppercase text-stone-light/60 mb-3">
            Our Work
          </span>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-white tracking-wide">
            Portfolio
          </h1>
        </div>
      </div>

      {/* Content */}
      <section className="section-pad">
        <div className="container-wide">
          <ProjectFilter projects={projects} />
        </div>
      </section>
    </>
  )
}
