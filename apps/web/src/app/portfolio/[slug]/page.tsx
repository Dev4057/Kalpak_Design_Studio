import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProjectCard, { type ProjectRow } from '@/components/portfolio/ProjectCard'
import SectionLabel from '@/components/shared/SectionLabel'

const BeforeAfterSlider = dynamic(
  () => import('@/components/portfolio/BeforeAfterSlider'),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video bg-stone-light/30 animate-pulse rounded" />
    ),
  },
)

type ProjectDetail = {
  id: string
  name: string
  city: string | null
  project_type: string
  status: string
  description: string | null
  actual_end_date: string | null
  address: string | null
  total_budget: number | null
}

type SiteUpdateRow = {
  id: string
  update_text: string | null
  photos: string[] | null
  created_at: string
}

const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80',
]

export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('projects')
      .select('id')
      .eq('is_published', true)
    return (data ?? []).map((p: { id: string }) => ({ slug: p.id }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('projects')
      .select('name, description')
      .eq('id', params.slug)
      .eq('is_published', true)
      .single()

    if (!data) return { title: 'Project' }

    return {
      title: data.name,
      description:
        data.description ??
        `View the ${data.name} project by Kalpak Design Studio.`,
      openGraph: {
        title: `${data.name} | Kalpak Design Studio`,
        description: data.description ?? '',
        images: [DEMO_IMAGES[0]],
      },
    }
  } catch {
    return { title: 'Project' }
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  let project: ProjectDetail | null = null
  let updates: SiteUpdateRow[] = []
  let related: ProjectRow[] = []

  try {
    const supabase = await createClient()

    const [projectRes, updatesRes] = await Promise.all([
      supabase
        .from('projects')
        .select(
          'id, name, city, project_type, status, description, actual_end_date, address, total_budget',
        )
        .eq('id', params.slug)
        .eq('is_published', true)
        .single(),
      supabase
        .from('site_updates')
        .select('id, update_text, photos, created_at')
        .eq('project_id', params.slug)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    project = (projectRes.data ?? null) as ProjectDetail | null
    updates = (updatesRes.data ?? []) as SiteUpdateRow[]

    if (project) {
      const relatedRes = await supabase
        .from('projects')
        .select('id, name, city, project_type')
        .eq('project_type', project.project_type)
        .eq('is_published', true)
        .neq('id', params.slug)
        .limit(3)
      related = (relatedRes.data ?? []) as ProjectRow[]
    }
  } catch {
    project = null
  }

  if (!project) notFound()

  const allPhotos = updates.flatMap((u) => u.photos ?? [])
  const year = project.actual_end_date
    ? new Date(project.actual_end_date).getFullYear()
    : null

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height: '60vh', minHeight: '320px' }}>
        <Image
          src={DEMO_IMAGES[0]}
          alt={project.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Metadata strip */}
      <div className="bg-charcoal text-cream py-6">
        <div className="container-wide flex flex-wrap gap-8 items-center">
          <div>
            <p className="font-body text-[10px] tracking-widest uppercase text-stone mb-1">Project</p>
            <h1 className="font-heading text-3xl md:text-4xl font-light tracking-wide">{project.name}</h1>
          </div>
          {project.city && (
            <div>
              <p className="font-body text-[10px] tracking-widest uppercase text-stone mb-1">Location</p>
              <p className="font-body text-sm text-stone-light">{project.city}</p>
            </div>
          )}
          <div>
            <p className="font-body text-[10px] tracking-widest uppercase text-stone mb-1">Type</p>
            <p className="font-body text-sm text-stone-light capitalize">{project.project_type}</p>
          </div>
          {year && (
            <div>
              <p className="font-body text-[10px] tracking-widest uppercase text-stone mb-1">Year</p>
              <p className="font-body text-sm text-stone-light">{year}</p>
            </div>
          )}
        </div>
      </div>

      <div className="section-pad">
        <div className="container-wide max-w-4xl">
          {/* Description */}
          {project.description && (
            <div className="mb-16">
              <SectionLabel>About This Project</SectionLabel>
              <p className="font-body text-base text-stone leading-relaxed">{project.description}</p>
            </div>
          )}

          {/* Before/After demo */}
          <div className="mb-16">
            <SectionLabel>Before & After</SectionLabel>
            <BeforeAfterSlider
              beforeSrc={DEMO_IMAGES[1]}
              afterSrc={DEMO_IMAGES[0]}
              beforeAlt="Before renovation"
              afterAlt="After renovation"
            />
          </div>

          {/* Photo gallery from site updates */}
          {allPhotos.length > 0 && (
            <div className="mb-16">
              <SectionLabel>Project Gallery</SectionLabel>
              <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                {allPhotos.map((url, i) => (
                  <div key={i} className="break-inside-avoid aspect-video relative overflow-hidden">
                    <Image
                      src={url}
                      alt={`${project.name} — photo ${i + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Demo gallery if no real photos */}
          {allPhotos.length === 0 && (
            <div className="mb-16">
              <SectionLabel>Project Gallery</SectionLabel>
              <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                {DEMO_IMAGES.map((src, i) => (
                  <div key={i} className="break-inside-avoid aspect-video relative overflow-hidden">
                    <Image
                      src={src}
                      alt={`${project.name} — photo ${i + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related projects */}
        {related.length > 0 && (
          <div className="container-wide mt-16 pt-16 border-t border-stone-light/30">
            <SectionLabel>Related Projects</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {related.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        )}

        <div className="container-wide mt-12">
          <Link
            href="/portfolio"
            className="font-body text-xs tracking-widest uppercase text-gold hover:text-gold-light transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Back to Portfolio
          </Link>
        </div>
      </div>
    </>
  )
}
