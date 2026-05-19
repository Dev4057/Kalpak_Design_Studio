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
-- leads (pipeline data — only partners can see)
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
