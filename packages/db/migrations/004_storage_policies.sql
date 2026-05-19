-- ============================================================
-- Migration 004: Storage Policies
-- Run in Supabase SQL editor after creating storage buckets
-- ============================================================

-- project-documents: authenticated upload, uploader/partner delete
insert into storage.policies (name, bucket_id, operation, definition)
values
  (
    'Authenticated users can upload project documents',
    'project-documents',
    'INSERT',
    'auth.role() = ''authenticated'''
  ),
  (
    'Authenticated users can read project documents',
    'project-documents',
    'SELECT',
    'auth.role() = ''authenticated'''
  ),
  (
    'Uploaders and partners can delete project documents',
    'project-documents',
    'DELETE',
    '(storage.foldername(name))[1] = auth.uid()::text or (select is_partner())'
  )
on conflict do nothing;

-- site-photos: authenticated upload, uploader/partner delete
insert into storage.policies (name, bucket_id, operation, definition)
values
  (
    'Authenticated users can upload site photos',
    'site-photos',
    'INSERT',
    'auth.role() = ''authenticated'''
  ),
  (
    'Authenticated users can read site photos',
    'site-photos',
    'SELECT',
    'auth.role() = ''authenticated'''
  ),
  (
    'Uploaders and partners can delete site photos',
    'site-photos',
    'DELETE',
    '(storage.foldername(name))[1] = auth.uid()::text or (select is_partner())'
  )
on conflict do nothing;

-- avatars: public read, authenticated upload own folder, uploader delete
insert into storage.policies (name, bucket_id, operation, definition)
values
  (
    'Public can read avatars',
    'avatars',
    'SELECT',
    'true'
  ),
  (
    'Authenticated users can upload their avatar',
    'avatars',
    'INSERT',
    'auth.role() = ''authenticated'' and (storage.foldername(name))[1] = auth.uid()::text'
  ),
  (
    'Users can delete their own avatar',
    'avatars',
    'DELETE',
    '(storage.foldername(name))[1] = auth.uid()::text'
  )
on conflict do nothing;

-- bill-photos: authenticated upload, partner/uploader read and delete
insert into storage.policies (name, bucket_id, operation, definition)
values
  (
    'Authenticated users can upload bill photos',
    'bill-photos',
    'INSERT',
    'auth.role() = ''authenticated'''
  ),
  (
    'Authenticated users can read bill photos',
    'bill-photos',
    'SELECT',
    'auth.role() = ''authenticated'''
  ),
  (
    'Partners can delete bill photos',
    'bill-photos',
    'DELETE',
    'auth.role() = ''authenticated'' and (select is_partner())'
  )
on conflict do nothing;
