-- ============================================================
-- Migration 001: Initial Schema
-- Kalpak Design Studio
-- ============================================================

-- -------------------------------------------------------
-- profiles (extends auth.users)
-- -------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text not null,
  phone text,
  role text not null check (role in ('partner', 'employee')),
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_is_active_idx on public.profiles(is_active);

-- -------------------------------------------------------
-- clients
-- -------------------------------------------------------
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text,
  phone text not null,
  city text,
  source text check (source in ('website_form', 'referral', 'direct', 'social_media', 'other')),
  lead_status text default 'new' check (lead_status in ('new', 'contacted', 'meeting_scheduled', 'proposal_sent', 'won', 'lost')),
  notes text,
  budget_range text,
  project_type text check (project_type in ('residential', 'commercial', 'office', 'hospitality', 'other')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists clients_lead_status_idx on public.clients(lead_status);
create index if not exists clients_created_at_idx on public.clients(created_at desc);
create index if not exists clients_phone_idx on public.clients(phone);

-- -------------------------------------------------------
-- projects
-- -------------------------------------------------------
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  client_id uuid references public.clients(id) on delete set null,
  description text,
  project_type text check (project_type in ('residential', 'commercial', 'office', 'hospitality', 'other')),
  status text default 'lead' check (status in ('lead', 'confirmed', 'in_progress', 'snagging', 'completed', 'on_hold')),
  city text,
  address text,
  total_budget numeric(12,2),
  start_date date,
  expected_end_date date,
  actual_end_date date,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists projects_client_id_idx on public.projects(client_id);
create index if not exists projects_status_idx on public.projects(status);
create index if not exists projects_created_at_idx on public.projects(created_at desc);
create index if not exists projects_is_published_idx on public.projects(is_published);

-- -------------------------------------------------------
-- project_assignments
-- -------------------------------------------------------
create table if not exists public.project_assignments (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role_in_project text check (role_in_project in ('lead_partner', 'supporting_partner', 'lead_employee', 'supporting_employee')),
  assigned_at timestamptz default now(),
  assigned_by uuid references public.profiles(id),
  unique(project_id, user_id)
);

create index if not exists project_assignments_project_id_idx on public.project_assignments(project_id);
create index if not exists project_assignments_user_id_idx on public.project_assignments(user_id);

-- -------------------------------------------------------
-- workers
-- -------------------------------------------------------
create table if not exists public.workers (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  phone text not null,
  trade text not null check (trade in (
    'electrician', 'carpenter', 'painter', 'plumber', 'mason', 'tiler',
    'fabricator', 'false_ceiling', 'ac_hvac', 'glass_works', 'polisher',
    'general_labour', 'supervisor', 'other'
  )),
  is_active boolean default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists workers_trade_idx on public.workers(trade);
create index if not exists workers_is_active_idx on public.workers(is_active);
create index if not exists workers_phone_idx on public.workers(phone);

-- -------------------------------------------------------
-- project_workers
-- -------------------------------------------------------
create table if not exists public.project_workers (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  worker_id uuid references public.workers(id) on delete cascade not null,
  added_by uuid references public.profiles(id),
  workers_needed integer default 1,
  is_active boolean default true,
  added_at timestamptz default now(),
  unique(project_id, worker_id)
);

create index if not exists project_workers_project_id_idx on public.project_workers(project_id);
create index if not exists project_workers_worker_id_idx on public.project_workers(worker_id);

-- -------------------------------------------------------
-- site_updates
-- -------------------------------------------------------
create table if not exists public.site_updates (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  posted_by uuid references public.profiles(id) not null,
  update_text text not null,
  workers_present uuid[] default '{}',
  worker_count integer default 0,
  photos text[] default '{}',
  update_date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists site_updates_project_id_idx on public.site_updates(project_id);
create index if not exists site_updates_posted_by_idx on public.site_updates(posted_by);
create index if not exists site_updates_update_date_idx on public.site_updates(update_date desc);
create index if not exists site_updates_created_at_idx on public.site_updates(created_at desc);

-- -------------------------------------------------------
-- worker_payments
-- -------------------------------------------------------
create table if not exists public.worker_payments (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  worker_id uuid references public.workers(id) on delete cascade not null,
  amount numeric(10,2) not null,
  payment_date date not null default current_date,
  payment_mode text check (payment_mode in ('cash', 'upi', 'bank_transfer', 'cheque')),
  paid_by uuid references public.profiles(id),
  description text,
  created_at timestamptz default now()
);

create index if not exists worker_payments_project_id_idx on public.worker_payments(project_id);
create index if not exists worker_payments_worker_id_idx on public.worker_payments(worker_id);
create index if not exists worker_payments_payment_date_idx on public.worker_payments(payment_date desc);

-- -------------------------------------------------------
-- vendor_payments
-- -------------------------------------------------------
create table if not exists public.vendor_payments (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  vendor_name text not null,
  item_description text not null,
  amount numeric(10,2) not null,
  payment_date date not null default current_date,
  payment_mode text check (payment_mode in ('cash', 'upi', 'bank_transfer', 'cheque')),
  paid_by uuid references public.profiles(id),
  bill_photo_url text,
  created_at timestamptz default now()
);

create index if not exists vendor_payments_project_id_idx on public.vendor_payments(project_id);
create index if not exists vendor_payments_payment_date_idx on public.vendor_payments(payment_date desc);
create index if not exists vendor_payments_vendor_name_idx on public.vendor_payments(vendor_name);

-- -------------------------------------------------------
-- project_documents
-- -------------------------------------------------------
create table if not exists public.project_documents (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id),
  file_name text not null,
  file_url text not null,
  file_type text check (file_type in ('drawing', 'boq', 'contract', 'proposal', 'invoice', 'photo', 'other')),
  file_size_bytes integer,
  created_at timestamptz default now()
);

create index if not exists project_documents_project_id_idx on public.project_documents(project_id);
create index if not exists project_documents_uploaded_by_idx on public.project_documents(uploaded_by);
create index if not exists project_documents_file_type_idx on public.project_documents(file_type);

-- -------------------------------------------------------
-- leads (from public contact form)
-- -------------------------------------------------------
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text,
  phone text not null,
  city text,
  project_type text,
  budget_range text,
  message text,
  source_page text default 'contact_form',
  status text default 'new' check (status in ('new', 'seen', 'converted')),
  converted_to_client_id uuid references public.clients(id),
  created_at timestamptz default now()
);

create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
