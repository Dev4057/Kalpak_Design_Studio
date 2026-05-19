export type ProjectFilters = {
  status?: string
  search?: string
  page?: number
}

export type WorkerFilters = {
  search?: string
  trade?: string
  is_active?: boolean
}

export type LeadFilters = {
  status?: string
  search?: string
  page?: number
}

export type ClientFilters = {
  search?: string
  status?: string
}

export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    list: (filters: ProjectFilters) => ['projects', 'list', filters] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
    workers: (id: string) => ['projects', id, 'workers'] as const,
    updates: (id: string) => ['projects', id, 'updates'] as const,
    documents: (id: string) => ['projects', id, 'documents'] as const,
  },
  workers: {
    all: ['workers'] as const,
    list: (filters: WorkerFilters) => ['workers', 'list', filters] as const,
  },
  leads: {
    all: ['leads'] as const,
    list: (filters: LeadFilters) => ['leads', 'list', filters] as const,
  },
  clients: {
    all: ['clients'] as const,
    list: (filters: ClientFilters) => ['clients', 'list', filters] as const,
    detail: (id: string) => ['clients', 'detail', id] as const,
  },
  profiles: {
    all: ['profiles'] as const,
  },
  dashboard: ['dashboard'] as const,
}
