import { LoginForm } from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — Kalpak Admin',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-medium tracking-[0.15em] text-primary">KALPAK</p>
          <p className="text-xs tracking-[0.2em] text-text-secondary mt-1">DESIGN STUDIO</p>
          <p className="text-xs text-text-secondary mt-3">Admin Console</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
