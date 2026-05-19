import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <span className="block font-body text-xs tracking-widest uppercase text-stone mb-6">404</span>
        <h1 className="font-heading text-6xl md:text-8xl font-light text-charcoal tracking-wide mb-6">
          Page Not Found
        </h1>
        <p className="font-body text-sm text-stone leading-relaxed mb-10 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link href="/" className="btn-gold">Return Home</Link>
      </div>
    </div>
  )
}
