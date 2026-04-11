create or replace function public.has_profile_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.user_role = any (allowed_roles)
  );
$$;

drop policy if exists "News are insertable by admins and operators" on public.news;
drop policy if exists "News are updatable by admins and operators" on public.news;
drop policy if exists "News are deletable by admins" on public.news;
create policy "News are insertable by admins and operators"
on public.news
for insert
with check (public.has_profile_role(array['admin', 'operator']::text[]));

create policy "News are readable by admins and operators"
on public.news
for select
using (public.has_profile_role(array['admin', 'operator']::text[]));

create policy "News are updatable by admins and operators"
on public.news
for update
using (public.has_profile_role(array['admin', 'operator']::text[]))
with check (public.has_profile_role(array['admin', 'operator']::text[]));

create policy "News are deletable by admins"
on public.news
for delete
using (public.has_profile_role(array['admin']::text[]));

drop policy if exists "Carousel items are insertable by admins and operators" on public.carousel_items;
drop policy if exists "Carousel items are updatable by admins and operators" on public.carousel_items;
drop policy if exists "Carousel items are deletable by admins" on public.carousel_items;
create policy "Carousel items are insertable by admins and operators"
on public.carousel_items
for insert
with check (public.has_profile_role(array['admin', 'operator']::text[]));

create policy "Carousel items are updatable by admins and operators"
on public.carousel_items
for update
using (public.has_profile_role(array['admin', 'operator']::text[]))
with check (public.has_profile_role(array['admin', 'operator']::text[]));

create policy "Carousel items are deletable by admins"
on public.carousel_items
for delete
using (public.has_profile_role(array['admin']::text[]));

drop policy if exists "Events are insertable by admins and operators" on public.events;
drop policy if exists "Events are updatable by admins and operators" on public.events;
drop policy if exists "Events are deletable by admins" on public.events;
create policy "Events are insertable by admins and operators"
on public.events
for insert
with check (public.has_profile_role(array['admin', 'operator']::text[]));

create policy "Events are updatable by admins and operators"
on public.events
for update
using (public.has_profile_role(array['admin', 'operator']::text[]))
with check (public.has_profile_role(array['admin', 'operator']::text[]));

create policy "Events are deletable by admins"
on public.events
for delete
using (public.has_profile_role(array['admin']::text[]));

drop policy if exists "Subscriptions are readable by admins and operators" on public.subscriptions;
drop policy if exists "Subscriptions are updatable by admins" on public.subscriptions;
create policy "Subscriptions are readable by admins and operators"
on public.subscriptions
for select
using (public.has_profile_role(array['admin', 'operator']::text[]));

create policy "Subscriptions are updatable by admins"
on public.subscriptions
for update
using (public.has_profile_role(array['admin']::text[]))
with check (public.has_profile_role(array['admin']::text[]));

drop policy if exists "Wallets are readable by admins and operators" on public.wallets;
drop policy if exists "Wallets are updatable by admins" on public.wallets;
create policy "Wallets are readable by admins and operators"
on public.wallets
for select
using (public.has_profile_role(array['admin', 'operator']::text[]));

create policy "Wallets are updatable by admins"
on public.wallets
for update
using (public.has_profile_role(array['admin']::text[]))
with check (public.has_profile_role(array['admin']::text[]));

drop policy if exists "Wallet transactions are readable by admins and operators" on public.wallet_transactions;
drop policy if exists "Wallet transactions are insertable by admins" on public.wallet_transactions;
create policy "Wallet transactions are readable by admins and operators"
on public.wallet_transactions
for select
using (public.has_profile_role(array['admin', 'operator']::text[]));

create policy "Wallet transactions are insertable by admins"
on public.wallet_transactions
for insert
with check (public.has_profile_role(array['admin']::text[]));
