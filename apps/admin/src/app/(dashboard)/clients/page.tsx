'use client'

import { useState, useEffect } from 'react'
import { useClients } from '@/hooks/useClients'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Building2, Search, Phone, Mail } from 'lucide-react'
import { formatPhone, formatDate } from '@kalpak/shared'

export default function ClientsPage() {
  const { isPartner } = useAuth()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useClients({ search: debouncedSearch || undefined })
  const clients = data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Clients"
        description="All clients of Kalpak Design Studio"
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <Input
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        <Badge variant="secondary" className="text-xs">{clients.length} clients</Badge>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No clients yet"
          description="Clients are created from leads or added manually."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.full_name}</TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    {client.phone && (
                      <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary">
                        <Phone className="w-3 h-3" />
                        {formatPhone(client.phone)}
                      </a>
                    )}
                    {client.email && (
                      <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-text-secondary text-sm">{client.city ?? '—'}</TableCell>
                <TableCell>
                  {client.project_type && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {client.project_type.replace('_', ' ')}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-text-secondary text-sm capitalize">
                  {client.source?.replace('_', ' ') ?? '—'}
                </TableCell>
                <TableCell className="text-text-secondary text-sm">
                  {formatDate(client.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
