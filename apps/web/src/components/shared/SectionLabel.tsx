import { cn } from '@/lib/utils'

interface SectionLabelProps {
  children: React.ReactNode
  className?: string
  light?: boolean
}

export default function SectionLabel({ children, className, light = false }: SectionLabelProps) {
  return (
    <span
      className={cn(
        'block font-body text-xs tracking-widest uppercase mb-4',
        light ? 'text-stone-light/60' : 'text-stone',
        className,
      )}
    >
      {children}
    </span>
  )
}
