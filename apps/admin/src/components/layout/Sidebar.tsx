'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FolderOpen,
  HardHat,
  Users,
  Building2,
  LogOut,
  BarChart3,
  BookOpen,
  UserCog,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, partnerOnly: true },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/workers', label: 'Workers', icon: HardHat },
  { href: '/leads', label: 'Leads', icon: Users, partnerOnly: true },
  { href: '/clients', label: 'Clients', icon: Building2 },
  { href: '/team', label: 'Team', icon: UserCog, partnerOnly: true },
  { href: '/reports', label: 'Reports', icon: BarChart3, partnerOnly: true },
  { href: '/blog', label: 'Blog', icon: BookOpen, partnerOnly: true },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, role, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?'

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-text">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <p className="text-lg font-medium tracking-[0.15em] text-primary">KALPAK</p>
        <p className="text-[10px] tracking-[0.2em] text-sidebar-text/50 mt-0.5">ADMIN</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          if (item.partnerOnly && role !== 'partner') return null
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                active
                  ? 'text-sidebar-active bg-white/10 border-l-2 border-sidebar-active pl-[10px]'
                  : 'text-sidebar-text/70 hover:text-sidebar-text hover:bg-white/5'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-text truncate">
              {profile?.full_name ?? 'Unknown'}
            </p>
            <Badge
              className={cn(
                'text-[10px] px-1.5 py-0 h-4 mt-0.5',
                role === 'partner'
                  ? 'bg-primary/20 text-primary border-0'
                  : 'bg-white/10 text-sidebar-text/70 border-0'
              )}
            >
              {role ?? '—'}
            </Badge>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sidebar-text/50 hover:text-sidebar-text transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
