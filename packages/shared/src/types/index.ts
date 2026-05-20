export type UserRole = 'partner' | 'employee'

export type ProjectStatus =
  | 'lead'
  | 'confirmed'
  | 'in_progress'
  | 'snagging'
  | 'completed'
  | 'on_hold'

export type ProjectType =
  | 'residential'
  | 'commercial'
  | 'office'
  | 'hospitality'
  | 'other'

export type WorkerTrade =
  | 'electrician'
  | 'carpenter'
  | 'painter'
  | 'plumber'
  | 'mason'
  | 'tiler'
  | 'fabricator'
  | 'false_ceiling'
  | 'ac_hvac'
  | 'glass_works'
  | 'polisher'
  | 'general_labour'
  | 'supervisor'
  | 'other'

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'meeting_scheduled'
  | 'proposal_sent'
  | 'won'
  | 'lost'

export type LeadFormStatus = 'new' | 'seen' | 'converted'

export type ClientSource =
  | 'website_form'
  | 'referral'
  | 'direct'
  | 'social_media'
  | 'other'

export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'cheque'

export type DocumentFileType =
  | 'drawing'
  | 'boq'
  | 'contract'
  | 'proposal'
  | 'invoice'
  | 'photo'
  | 'other'

export type ProjectRoleInProject =
  | 'lead_partner'
  | 'supporting_partner'
  | 'lead_employee'
  | 'supporting_employee'

// Entity types matching DB schema exactly

export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  full_name: string
  email: string | null
  phone: string
  city: string | null
  source: ClientSource | null
  lead_status: LeadStatus
  notes: string | null
  budget_range: string | null
  project_type: ProjectType | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  client_id: string | null
  description: string | null
  project_type: ProjectType | null
  status: ProjectStatus
  city: string | null
  address: string | null
  total_budget: number | null
  start_date: string | null
  expected_end_date: string | null
  actual_end_date: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface ProjectAssignment {
  id: string
  project_id: string
  user_id: string
  role_in_project: ProjectRoleInProject | null
  assigned_at: string
  assigned_by: string | null
}

export interface Worker {
  id: string
  full_name: string
  phone: string
  trade: WorkerTrade
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ProjectWorker {
  id: string
  project_id: string
  worker_id: string
  added_by: string | null
  workers_needed: number
  is_active: boolean
  added_at: string
}

export interface SiteUpdate {
  id: string
  project_id: string
  posted_by: string
  update_text: string
  workers_present: string[]
  worker_count: number
  photos: string[]
  update_date: string
  created_at: string
  updated_at: string
}

export interface WorkerPayment {
  id: string
  project_id: string
  worker_id: string
  amount: number
  payment_date: string
  payment_mode: PaymentMode | null
  paid_by: string | null
  description: string | null
  created_at: string
  // joined fields (present when fetched with relations)
  worker?: Pick<Worker, 'full_name' | 'trade'>
  paid_by_profile?: Pick<Profile, 'full_name'>
}

export interface VendorPayment {
  id: string
  project_id: string
  vendor_name: string
  item_description: string
  amount: number
  payment_date: string
  payment_mode: PaymentMode | null
  paid_by: string | null
  bill_photo_url: string | null
  created_at: string
  paid_by_profile?: Pick<Profile, 'full_name'>
}

export interface ProjectFinancialSummary {
  total_budget: number | null
  total_worker_payments: number
  total_vendor_payments: number
  total_spent: number
  remaining_budget: number | null
  budget_utilization_percent: number | null
  worker_payment_count: number
  vendor_payment_count: number
  payment_by_mode: Record<PaymentMode, number>
}

export interface WorkerPaymentSummary {
  worker_id: string
  worker_name: string
  trade: WorkerTrade
  total_paid: number
  payment_count: number
  last_payment_date: string | null
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  tags: string[]
  author_id: string | null
  is_published: boolean
  published_at: string | null
  reading_time_minutes: number | null
  created_at: string
  updated_at: string
  author?: Pick<Profile, 'full_name'>
}

export interface ProjectDocument {
  id: string
  project_id: string
  uploaded_by: string | null
  file_name: string
  file_url: string
  file_type: DocumentFileType | null
  file_size_bytes: number | null
  created_at: string
}

export interface Lead {
  id: string
  full_name: string
  email: string | null
  phone: string
  city: string | null
  project_type: string | null
  budget_range: string | null
  message: string | null
  source_page: string
  status: LeadFormStatus
  converted_to_client_id: string | null
  created_at: string
}

export interface TeamMember {
  id: string
  full_name: string
  email: string
  phone: string | null
  is_active: boolean
  created_at: string
  active_project_count: number
}

// API response envelope
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
