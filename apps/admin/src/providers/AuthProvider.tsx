'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@kalpak/shared'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  role: UserRole | null
  isPartner: boolean
  isEmployee: boolean
  isLoading: boolean
  accessToken: string
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  role: null,
  isPartner: false,
  isEmployee: false,
  isLoading: true,
  accessToken: '',
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [accessToken, setAccessToken] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data as Profile | null)
  }

  async function handleSession(session: Session | null) {
    setUser(session?.user ?? null)
    setAccessToken(session?.access_token ?? '')
    if (session?.user) {
      await loadProfile(session.user.id)
    } else {
      setProfile(null)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session)
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const role = profile?.role ?? null

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isPartner: role === 'partner',
        isEmployee: role === 'employee',
        isLoading,
        accessToken,
        signOut: async () => {
          await supabase.auth.signOut()
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
