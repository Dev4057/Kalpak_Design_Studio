'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLeads, useUpdateLeadStatus } from '@/hooks/useLeads'
import { LeadCard } from '@/components/leads/LeadCard'
import { ConvertLeadDialog } from '@/components/leads/ConvertLeadDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import type { Lead, LeadFormStatus } from '@kalpak/shared'
import { formatPhone, formatDate } from '@kalpak/shared'
import { formatDistanceToNow } from 'date-fns'
import { Phone, Mail, MapPin, ArrowLeftRight } from 'lucide-react'

const COLUMNS: { status: LeadFormStatus; label: string; color: string }[] = [
  { status: 'new', label: 'New', color: 'bg-primary/10 text-primary' },
  { status: 'seen', label: 'Seen', color: 'bg-blue-50 text-blue-700' },
  { status: 'converted', label: 'Converted', color: 'bg-green-50 text-green-700' },
]

export default function LeadsPage() {
  const { role, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { data, isLoading } = useLeads()
  const updateStatus = useUpdateLeadStatus()

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [convertLead, setConvertLead] = useState<Lead | null>(null)

  useEffect(() => {
    if (!authLoading && role !== 'partner') {
      router.replace('/projects')
    }
  }, [role, authLoading, router])

  const leads = data?.data ?? []

  function getColumnLeads(status: LeadFormStatus) {
    return leads.filter((l) => l.status === status)
  }

  function handleDragStart(e: React.DragEvent, leadId: string) {
    e.dataTransfer.setData('leadId', leadId)
    setDraggingId(leadId)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function handleDrop(e: React.DragEvent, newStatus: LeadFormStatus) {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('leadId')
    if (!leadId) return
    const lead = leads.find((l) => l.id === leadId)
    if (!lead || lead.status === newStatus) return
    updateStatus.mutate({ id: leadId, data: { status: newStatus } })
    setDraggingId(null)
  }

  if (authLoading || role !== 'partner') return null

  return (
    <div>
      <PageHeader title="Leads" description="Manage your CRM pipeline" />

      {isLoading ? (
        <div className="flex gap-4">
          {COLUMNS.map((col) => (
            <div key={col.status} className="flex-1 min-w-0">
              <Skeleton className="h-8 mb-3 rounded" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colLeads = getColumnLeads(col.status)
            return (
              <div
                key={col.status}
                className="flex-1 min-w-64"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.status)}
              >
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-medium text-sm text-text-primary">{col.label}</h3>
                  <Badge className={`text-xs ${col.color} border-0`}>{colLeads.length}</Badge>
                </div>
                <div className="space-y-2 min-h-16">
                  {colLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      isDragging={draggingId === lead.id}
                      onClick={() => setSelectedLead(lead)}
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lead detail sheet */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {selectedLead && (
            <>
              <SheetHeader className="mb-4">
                <SheetTitle>{selectedLead.full_name}</SheetTitle>
              </SheetHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  {selectedLead.phone && (
                    <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-2 text-sm hover:text-primary">
                      <Phone className="w-4 h-4 text-text-secondary" />
                      {formatPhone(selectedLead.phone)}
                    </a>
                  )}
                  {selectedLead.email && (
                    <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2 text-sm hover:text-primary">
                      <Mail className="w-4 h-4 text-text-secondary" />
                      {selectedLead.email}
                    </a>
                  )}
                  {selectedLead.city && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <MapPin className="w-4 h-4" />
                      {selectedLead.city}
                    </div>
                  )}
                </div>

                <div className="text-sm space-y-1 border rounded-md p-3 bg-muted/30">
                  {selectedLead.project_type && (
                    <p><span className="text-text-secondary">Type:</span> {selectedLead.project_type}</p>
                  )}
                  {selectedLead.budget_range && (
                    <p><span className="text-text-secondary">Budget:</span> {selectedLead.budget_range}</p>
                  )}
                  <p>
                    <span className="text-text-secondary">Received:</span>{' '}
                    {formatDate(selectedLead.created_at)} ({formatDistanceToNow(new Date(selectedLead.created_at), { addSuffix: true })})
                  </p>
                </div>

                {selectedLead.message && (
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Message</p>
                    <p className="text-sm text-text-primary whitespace-pre-line bg-muted/30 p-3 rounded-md">
                      {selectedLead.message}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs text-text-secondary">Change status:</span>
                  {COLUMNS.map((col) => (
                    <button
                      key={col.status}
                      onClick={() => {
                        updateStatus.mutate({ id: selectedLead.id, data: { status: col.status } })
                        setSelectedLead((prev) => prev ? { ...prev, status: col.status } : null)
                      }}
                      className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                        selectedLead.status === col.status
                          ? `${col.color} border-transparent`
                          : 'border-border text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>

                {selectedLead.status !== 'converted' && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setConvertLead(selectedLead)
                      setSelectedLead(null)
                    }}
                  >
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                    Convert to Client
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {convertLead && (
        <ConvertLeadDialog
          lead={convertLead}
          open={!!convertLead}
          onOpenChange={(open) => !open && setConvertLead(null)}
          onConverted={() => setConvertLead(null)}
        />
      )}
    </div>
  )
}
