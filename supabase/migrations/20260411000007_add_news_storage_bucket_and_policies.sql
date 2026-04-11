insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'jp-poker-club-image-vault',
  'jp-poker-club-image-vault',
  true,
  8388608,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "News images are insertable by admins/operators" on storage.objects;
drop policy if exists "News images are updatable by admins/operators" on storage.objects;
drop policy if exists "News images are deletable by admins/operators" on storage.objects;

create policy "News images are insertable by admins/operators"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'jp-poker-club-image-vault'
  and public.has_profile_role(array['admin', 'operator']::text[])
);

create policy "News images are updatable by admins/operators"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'jp-poker-club-image-vault'
  and public.has_profile_role(array['admin', 'operator']::text[])
)
with check (
  bucket_id = 'jp-poker-club-image-vault'
  and public.has_profile_role(array['admin', 'operator']::text[])
);

create policy "News images are deletable by admins/operators"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'jp-poker-club-image-vault'
  and public.has_profile_role(array['admin', 'operator']::text[])
);
