-- ============================================================
-- KALPAK DESIGN STUDIO — PHASE 1 MIGRATIONS
-- Paste this entire file into the Supabase SQL Editor and run
-- ============================================================

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


-- ============================================================
-- Migration 002: Triggers
-- ============================================================

-- Generic updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers to all relevant tables
create or replace trigger handle_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create or replace trigger handle_updated_at
  before update on public.clients
  for each row execute function public.handle_updated_at();

create or replace trigger handle_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

create or replace trigger handle_updated_at
  before update on public.workers
  for each row execute function public.handle_updated_at();

create or replace trigger handle_updated_at
  before update on public.site_updates
  for each row execute function public.handle_updated_at();

-- Auto-create profile when a user signs up in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'employee')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- Migration 003: Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_assignments enable row level security;
alter table public.workers enable row level security;
alter table public.project_workers enable row level security;
alter table public.site_updates enable row level security;
alter table public.worker_payments enable row level security;
alter table public.vendor_payments enable row level security;
alter table public.project_documents enable row level security;
alter table public.leads enable row level security;

-- -------------------------------------------------------
-- Helper: check if current user is a partner
-- -------------------------------------------------------
create or replace function public.is_partner()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'partner' and is_active = true
  );
$$ language sql security definer stable;

-- -------------------------------------------------------
-- profiles
-- -------------------------------------------------------
drop policy if exists "Authenticated users can read all profiles" on public.profiles;
create policy "Authenticated users can read all profiles"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "Partners can insert profiles" on public.profiles;
create policy "Partners can insert profiles"
  on public.profiles for insert
  to authenticated
  with check (public.is_partner());

drop policy if exists "Partners can delete profiles" on public.profiles;
create policy "Partners can delete profiles"
  on public.profiles for delete
  to authenticated
  using (public.is_partner());

-- -------------------------------------------------------
-- projects
-- -------------------------------------------------------
drop policy if exists "Partners can read all projects" on public.projects;
create policy "Partners can read all projects"
  on public.projects for select
  to authenticated
  using (public.is_partner());

drop policy if exists "Employees can read assigned projects" on public.projects;
create policy "Employees can read assigned projects"
  on public.projects for select
  to authenticated
  using (
    exists (
      select 1 from public.project_assignments
      where project_id = projects.id and user_id = auth.uid()
    )
  );

drop policy if exists "Partners can insert projects" on public.projects;
create policy "Partners can insert projects"
  on public.projects for insert
  to authenticated
  with check (public.is_partner());

drop policy if exists "Partners can update projects" on public.projects;
create policy "Partners can update projects"
  on public.projects for update
  to authenticated
  using (public.is_partner())
  with check (public.is_partner());

drop policy if exists "Employees can update assigned projects" on public.projects;
create policy "Employees can update assigned projects"
  on public.projects for update
  to authenticated
  using (
    exists (
      select 1 from public.project_assignments
      where project_id = projects.id and user_id = auth.uid()
    )
  );

drop policy if exists "Partners can delete projects" on public.projects;
create policy "Partners can delete projects"
  on public.projects for delete
  to authenticated
  using (public.is_partner());

-- -------------------------------------------------------
-- project_assignments
-- -------------------------------------------------------
drop policy if exists "Partners can read all assignments" on public.project_assignments;
create policy "Partners can read all assignments"
  on public.project_assignments for select
  to authenticated
  using (public.is_partner());

drop policy if exists "Employees can read their project assignments" on public.project_assignments;
create policy "Employees can read their project assignments"
  on public.project_assignments for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.project_assignments pa
      where pa.project_id = project_assignments.project_id and pa.user_id = auth.uid()
    )
  );

drop policy if exists "Partners can insert assignments" on public.project_assignments;
create policy "Partners can insert assignments"
  on public.project_assignments for insert
  to authenticated
  with check (public.is_partner());

drop policy if exists "Partners can update assignments" on public.project_assignments;
create policy "Partners can update assignments"
  on public.project_assignments for update
  to authenticated
  using (public.is_partner());

drop policy if exists "Partners can delete assignments" on public.project_assignments;
create policy "Partners can delete assignments"
  on public.project_assignments for delete
  to authenticated
  using (public.is_partner());

-- -------------------------------------------------------
-- clients
-- -------------------------------------------------------
drop policy if exists "Partners can read all clients" on public.clients;
create policy "Partners can read all clients"
  on public.clients for select
  to authenticated
  using (public.is_partner());

drop policy if exists "Employees can read all clients" on public.clients;
create policy "Employees can read all clients"
  on public.clients for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'employee' and is_active = true
    )
  );

drop policy if exists "Partners can insert clients" on public.clients;
create policy "Partners can insert clients"
  on public.clients for insert
  to authenticated
  with check (public.is_partner());

drop policy if exists "Partners can update clients" on public.clients;
create policy "Partners can update clients"
  on public.clients for update
  to authenticated
  using (public.is_partner());

drop policy if exists "Partners can delete clients" on public.clients;
create policy "Partners can delete clients"
  on public.clients for delete
  to authenticated
  using (public.is_partner());

-- -------------------------------------------------------
-- leads (pipeline data â€” only partners can see)
-- -------------------------------------------------------
drop policy if exists "Partners can read leads" on public.leads;
create policy "Partners can read leads"
  on public.leads for select
  to authenticated
  using (public.is_partner());

drop policy if exists "Anyone can insert leads" on public.leads;
create policy "Anyone can insert leads"
  on public.leads for insert
  with check (true);

drop policy if exists "Partners can update leads" on public.leads;
create policy "Partners can update leads"
  on public.leads for update
  to authenticated
  using (public.is_partner());

drop policy if exists "Partners can delete leads" on public.leads;
create policy "Partners can delete leads"
  on public.leads for delete
  to authenticated
  using (public.is_partner());

-- -------------------------------------------------------
-- workers
-- -------------------------------------------------------
drop policy if exists "Authenticated users can read workers" on public.workers;
create policy "Authenticated users can read workers"
  on public.workers for select
  to authenticated
  using (true);

drop policy if exists "Partners and assigned employees can insert workers" on public.workers;
create policy "Partners and assigned employees can insert workers"
  on public.workers for insert
  to authenticated
  with check (
    public.is_partner()
    or exists (
      select 1 from public.project_assignments
      where user_id = auth.uid()
    )
  );

drop policy if exists "Partners can update workers" on public.workers;
create policy "Partners can update workers"
  on public.workers for update
  to authenticated
  using (public.is_partner());

drop policy if exists "Partners can delete workers" on public.workers;
create policy "Partners can delete workers"
  on public.workers for delete
  to authenticated
  using (public.is_partner());

-- -------------------------------------------------------
-- project_workers
-- -------------------------------------------------------
drop policy if exists "Partners can read all project workers" on public.project_workers;
create policy "Partners can read all project workers"
  on public.project_workers for select
  to authenticated
  using (public.is_partner());

drop policy if exists "Employees can read project workers for their projects" on public.project_workers;
create policy "Employees can read project workers for their projects"
  on public.project_workers for select
  to authenticated
  using (
    exists (
      select 1 from public.project_assignments
      where project_id = project_workers.project_id and user_id = auth.uid()
    )
  );

drop policy if exists "Partners can insert project workers" on public.project_workers;
create policy "Partners can insert project workers"
  on public.project_workers for insert
  to authenticated
  with check (public.is_partner());

drop policy if exists "Assigned employees can insert project workers" on public.project_workers;
create policy "Assigned employees can insert project workers"
  on public.project_workers for insert
  to authenticated
  with check (
    exists (
      select 1 from public.project_assignments
      where project_id = project_workers.project_id and user_id = auth.uid()
    )
  );

drop policy if exists "Partners can update project workers" on public.project_workers;
create policy "Partners can update project workers"
  on public.project_workers for update
  to authenticated
  using (public.is_partner());

drop policy if exists "Partners can delete project workers" on public.project_workers;
create policy "Partners can delete project workers"
  on public.project_workers for delete
  to authenticated
  using (public.is_partner());

-- -------------------------------------------------------
-- site_updates
-- -------------------------------------------------------
drop policy if exists "Partners can read all site updates" on public.site_updates;
create policy "Partners can read all site updates"
  on public.site_updates for select
  to authenticated
  using (public.is_partner());

drop policy if exists "Employees can read updates for assigned projects" on public.site_updates;
create policy "Employees can read updates for assigned projects"
  on public.site_updates for select
  to authenticated
  using (
    exists (
      select 1 from public.project_assignments
      where project_id = site_updates.project_id and user_id = auth.uid()
    )
  );

drop policy if exists "Authenticated users can insert site updates" on public.site_updates;
create policy "Authenticated users can insert site updates"
  on public.site_updates for insert
  to authenticated
  with check (posted_by = auth.uid());

drop policy if exists "Users can update their own site updates" on public.site_updates;
create policy "Users can update their own site updates"
  on public.site_updates for update
  to authenticated
  using (posted_by = auth.uid() or public.is_partner());

drop policy if exists "Users can delete their own site updates" on public.site_updates;
create policy "Users can delete their own site updates"
  on public.site_updates for delete
  to authenticated
  using (posted_by = auth.uid() or public.is_partner());

-- -------------------------------------------------------
-- worker_payments
-- -------------------------------------------------------
drop policy if exists "Partners can read all worker payments" on public.worker_payments;
create policy "Partners can read all worker payments"
  on public.worker_payments for select
  to authenticated
  using (public.is_partner());

drop policy if exists "Employees can read worker payments for assigned projects" on public.worker_payments;
create policy "Employees can read worker payments for assigned projects"
  on public.worker_payments for select
  to authenticated
  using (
    exists (
      select 1 from public.project_assignments
      where project_id = worker_payments.project_id and user_id = auth.uid()
    )
  );

drop policy if exists "Partners can insert worker payments" on public.worker_payments;
create policy "Partners can insert worker payments"
  on public.worker_payments for insert
  to authenticated
  with check (public.is_partner());

drop policy if exists "Assigned employees can insert worker payments" on public.worker_payments;
create policy "Assigned employees can insert worker payments"
  on public.worker_payments for insert
  to authenticated
  with check (
    exists (
      select 1 from public.project_assignments
      where project_id = worker_payments.project_id and user_id = auth.uid()
    )
  );

drop policy if exists "Partners can update worker payments" on public.worker_payments;
create policy "Partners can update worker payments"
  on public.worker_payments for update
  to authenticated
  using (public.is_partner());

drop policy if exists "Partners can delete worker payments" on public.worker_payments;
create policy "Partners can delete worker payments"
  on public.worker_payments for delete
  to authenticated
  using (public.is_partner());

-- -------------------------------------------------------
-- vendor_payments
-- -------------------------------------------------------
drop policy if exists "Partners can read all vendor payments" on public.vendor_payments;
create policy "Partners can read all vendor payments"
  on public.vendor_payments for select
  to authenticated
  using (public.is_partner());

drop policy if exists "Employees can read vendor payments for assigned projects" on public.vendor_payments;
create policy "Employees can read vendor payments for assigned projects"
  on public.vendor_payments for select
  to authenticated
  using (
    exists (
      select 1 from public.project_assignments
      where project_id = vendor_payments.project_id and user_id = auth.uid()
    )
  );

drop policy if exists "Partners can insert vendor payments" on public.vendor_payments;
create policy "Partners can insert vendor payments"
  on public.vendor_payments for insert
  to authenticated
  with check (public.is_partner());

drop policy if exists "Assigned employees can insert vendor payments" on public.vendor_payments;
create policy "Assigned employees can insert vendor payments"
  on public.vendor_payments for insert
  to authenticated
  with check (
    exists (
      select 1 from public.project_assignments
      where project_id = vendor_payments.project_id and user_id = auth.uid()
    )
  );

drop policy if exists "Partners can update vendor payments" on public.vendor_payments;
create policy "Partners can update vendor payments"
  on public.vendor_payments for update
  to authenticated
  using (public.is_partner());

drop policy if exists "Partners can delete vendor payments" on public.vendor_payments;
create policy "Partners can delete vendor payments"
  on public.vendor_payments for delete
  to authenticated
  using (public.is_partner());

-- -------------------------------------------------------
-- project_documents
-- -------------------------------------------------------
drop policy if exists "Partners can read all documents" on public.project_documents;
create policy "Partners can read all documents"
  on public.project_documents for select
  to authenticated
  using (public.is_partner());

drop policy if exists "Employees can read documents for assigned projects" on public.project_documents;
create policy "Employees can read documents for assigned projects"
  on public.project_documents for select
  to authenticated
  using (
    exists (
      select 1 from public.project_assignments
      where project_id = project_documents.project_id and user_id = auth.uid()
    )
  );

drop policy if exists "Authenticated users can insert documents" on public.project_documents;
create policy "Authenticated users can insert documents"
  on public.project_documents for insert
  to authenticated
  with check (uploaded_by = auth.uid());

drop policy if exists "Uploaders and partners can delete documents" on public.project_documents;
create policy "Uploaders and partners can delete documents"
  on public.project_documents for delete
  to authenticated
  using (uploaded_by = auth.uid() or public.is_partner());

