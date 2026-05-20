-- Migration: 005_blog.sql
-- Blog posts table for Kalpak Design Studio insights section

create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  cover_image_url text,
  tags text[] default '{}',
  author_id uuid references public.profiles(id) on delete set null,
  is_published boolean default false,
  published_at timestamptz,
  reading_time_minutes integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: published posts readable by everyone (anon), unpublished only by partners
alter table public.blog_posts enable row level security;

create policy "Published blog posts are publicly readable"
  on public.blog_posts for select
  using (is_published = true);

create policy "Partners can manage all blog posts"
  on public.blog_posts for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'partner'
    )
  );

-- Auto-update updated_at on changes
create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row
  execute function public.handle_updated_at();
