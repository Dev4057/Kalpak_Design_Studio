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
