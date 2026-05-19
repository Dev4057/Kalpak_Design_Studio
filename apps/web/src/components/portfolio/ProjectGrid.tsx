'use client'

import { motion, AnimatePresence } from 'framer-motion'
import ProjectCard, { type ProjectRow } from './ProjectCard'

export default function ProjectGrid({ projects }: { projects: ProjectRow[] }) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="font-heading text-2xl font-light text-stone tracking-wide">
          No projects found for this category.
        </p>
        <p className="font-body text-sm text-stone mt-2">Check back soon as we add more work.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
