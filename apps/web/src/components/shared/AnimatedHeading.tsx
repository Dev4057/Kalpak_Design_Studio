'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedHeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  children: React.ReactNode
  className?: string
  delay?: number
}

export default function AnimatedHeading({
  as: Tag = 'h2',
  children,
  className,
  delay = 0,
}: AnimatedHeadingProps) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
      whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      viewport={{ once: true, margin: '-50px' }}
    >
      <Tag className={cn('font-heading', className)}>{children}</Tag>
    </motion.div>
  )
}
