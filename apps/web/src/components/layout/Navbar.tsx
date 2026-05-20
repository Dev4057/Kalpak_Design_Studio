'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/insights', label: 'Insights' },
  { href: '/estimator', label: 'Estimator' },
  { href: '/contact', label: 'Contact' },
]

const SERVICE_LINKS = [
  { href: '/services/interior-design', label: 'Interior Design' },
  { href: '/services/architecture', label: 'Architecture' },
  { href: '/services/turnkey', label: 'Turnkey Projects' },
  { href: '/services/space-planning', label: 'Space Planning' },
]

export default function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [isScrolled, setIsScrolled] = useState(!isHome)
  const [mobileOpen, setMobileOpen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    setMobileOpen(false)

    if (!isHome) {
      setIsScrolled(true)
      return
    }

    setIsScrolled(false)

    const sentinel = document.querySelector('#nav-sentinel')
    if (!sentinel) return

    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: 0 },
    )
    observerRef.current.observe(sentinel)

    return () => observerRef.current?.disconnect()
  }, [pathname, isHome])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const linkClass = (href: string, transparent = false) =>
    cn(
      'text-xs tracking-widest uppercase font-body transition-colors duration-200 relative pb-0.5',
      isActive(href)
        ? 'text-gold after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-gold'
        : transparent
          ? 'text-white/80 hover:text-white'
          : 'text-charcoal hover:text-gold',
    )

  const transparent = isHome && !isScrolled

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-cream border-b border-stone-light/40 shadow-sm'
            : 'bg-transparent',
        )}
      >
        <div className="container-wide flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none">
            <span
              className={cn(
                'font-heading text-2xl md:text-3xl font-light tracking-wider transition-colors duration-300',
                transparent ? 'text-white' : 'text-gold',
              )}
            >
              KALPAK
            </span>
            <span
              className={cn(
                'font-body text-[9px] tracking-widest uppercase mt-0.5 transition-colors duration-300',
                transparent ? 'text-white/60' : 'text-stone',
              )}
            >
              DESIGN STUDIO
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.slice(0, 2).map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href, transparent)}>
                {link.label}
              </Link>
            ))}

            {/* Services dropdown */}
            <div className="relative group">
              <button
                className={cn(
                  'text-xs tracking-widest uppercase font-body transition-colors duration-200 flex items-center gap-1 pb-0.5',
                  isActive('/services')
                    ? 'text-gold'
                    : transparent
                      ? 'text-white/80 hover:text-white'
                      : 'text-charcoal hover:text-gold',
                )}
              >
                Services
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 min-w-52 bg-cream shadow-lg border border-stone-light/30 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                {SERVICE_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-5 py-2.5 text-xs tracking-widest uppercase font-body text-charcoal hover:text-gold hover:bg-warm-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {NAV_LINKS.slice(2).map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href, transparent)}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <Link
            href="/contact"
            className={cn(
              'hidden md:inline-flex items-center px-5 py-2 text-xs tracking-widest uppercase font-body border transition-all duration-200',
              transparent
                ? 'border-white text-white hover:bg-white hover:text-charcoal'
                : 'border-gold text-charcoal hover:bg-gold hover:text-white',
            )}
          >
            Book Consultation
          </Link>

          {/* Mobile hamburger */}
          <button
            className={cn(
              'md:hidden flex flex-col gap-1.5 p-2',
              transparent ? 'text-white' : 'text-charcoal',
            )}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className={cn('block h-px w-6 bg-current transition-all duration-200', mobileOpen && 'rotate-45 translate-y-2')} />
            <span className={cn('block h-px w-6 bg-current transition-all duration-200', mobileOpen && 'opacity-0')} />
            <span className={cn('block h-px w-6 bg-current transition-all duration-200', mobileOpen && '-rotate-45 -translate-y-2')} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-cream flex flex-col md:hidden transition-all duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      >
        <div className="container-wide pt-24 pb-12 flex flex-col gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'font-heading text-4xl font-light tracking-wide transition-colors duration-200',
                isActive(link.href) ? 'text-gold' : 'text-charcoal hover:text-gold',
              )}
            >
              {link.label}
            </Link>
          ))}
          <div>
            <span className="font-heading text-4xl font-light tracking-wide text-charcoal">Services</span>
            <div className="flex flex-col gap-3 mt-3 pl-4 border-l border-stone-light">
              {SERVICE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm tracking-widest uppercase font-body text-stone hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="btn-gold mt-4 text-center"
          >
            Book Consultation
          </Link>
        </div>
      </div>
    </>
  )
}
