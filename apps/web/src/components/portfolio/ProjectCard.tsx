import Image from 'next/image'
import Link from 'next/link'

export type ProjectRow = {
  id: string
  name: string
  city: string | null
  project_type: string
}

const TYPE_IMAGES: Record<string, string> = {
  residential: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
  commercial: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  office: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80',
  hospitality: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  other: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
}

export default function ProjectCard({ project }: { project: ProjectRow }) {
  const imgSrc = TYPE_IMAGES[project.project_type] ?? TYPE_IMAGES.other

  return (
    <Link
      href={`/portfolio/${project.id}`}
      className="group block relative overflow-hidden aspect-[3/4] bg-warm-white"
    >
      <Image
        src={imgSrc}
        alt={project.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Type badge */}
      <div className="absolute top-4 left-4 bg-cream/90 backdrop-blur-sm px-3 py-1.5">
        <span className="font-body text-[10px] tracking-widest uppercase text-charcoal">
          {project.project_type}
        </span>
      </div>

      {/* Hover overlay sliding from bottom */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/75 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
        <h3 className="font-heading text-xl font-light text-white tracking-wide">{project.name}</h3>
        {project.city && (
          <p className="font-body text-xs text-stone-light/80 mt-1.5 tracking-wider uppercase">
            {project.city}
          </p>
        )}
      </div>
    </Link>
  )
}
