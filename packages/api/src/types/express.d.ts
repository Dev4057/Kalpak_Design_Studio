import type { UserRole, Profile } from '@kalpak/shared'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: UserRole
        profile: Profile
      }
    }
  }
}

export {}
