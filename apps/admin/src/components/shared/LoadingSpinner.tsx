import { cn } from '@/lib/utils'

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]',
        className
      )}
      role="status"
    >
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-48">
      <LoadingSpinner className="text-primary w-8 h-8" />
    </div>
  )
}
