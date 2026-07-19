-- ============================================================
-- LOGOS storage bucket — public read, anon upload (avatars/logos)
-- Run in Supabase SQL editor (or via db:migrate).
-- ============================================================

-- Create the public bucket if it does not exist.
insert into storage.buckets (id, name, public)
values ('LOGOS', 'LOGOS', true)
on conflict (id) do update set public = true;

-- Public read for anything in the LOGOS bucket.
drop policy if exists "LOGOS public read" on storage.objects;
create policy "LOGOS public read"
  on storage.objects for select
  using (bucket_id = 'LOGOS');

-- Allow anonymous + authenticated uploads into the LOGOS bucket
-- (scoped to the avatars/ prefix used by the accounts signup flow).
drop policy if exists "LOGOS anon upload avatars" on storage.objects;
create policy "LOGOS anon upload avatars"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'LOGOS'
    and (storage.foldername(name))[1] = 'avatars'
  );

-- Allow overwrite/update of own uploads within avatars/ (optional).
drop policy if exists "LOGOS update avatars" on storage.objects;
create policy "LOGOS update avatars"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'LOGOS' and (storage.foldername(name))[1] = 'avatars')
  with check (bucket_id = 'LOGOS' and (storage.foldername(name))[1] = 'avatars');
