'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import ProjectGrid from './ProjectGrid'
import type { ProjectRow } from './ProjectCard'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office', label: 'Office' },
  { value: 'hospitality', label: 'Hospitality' },
] as const

type FilterValue = (typeof FILTERS)[number]['value']

export default function ProjectFilter({ projects }: { projects: ProjectRow[] }) {
  const [active, setActive] = useState<FilterValue>('all')

  const filtered =
    active === 'all' ? projects : projects.filter((p) => p.project_type === active)

  return (
    <>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-12" role="tablist" aria-label="Filter projects by type">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActive(filter.value)}
            role="tab"
            aria-selected={active === filter.value}
            className={cn(
              'font-body text-xs tracking-widest uppercase px-5 py-2.5 border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
              active === filter.value
                ? 'bg-charcoal text-cream border-charcoal'
                : 'border-stone-light text-stone hover:border-charcoal hover:text-charcoal',
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <ProjectGrid projects={filtered} />
    </>
  )
}
