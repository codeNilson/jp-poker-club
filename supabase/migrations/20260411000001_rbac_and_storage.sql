-- Add event_type and cash game support
create type public.event_type as enum ('tournament', 'cash_game');

alter table public.events
  add column event_type public.event_type not null default 'tournament',
  alter column buy_in drop not null,
  add column blinds text;

alter table public.cash_game_sessions
  add column event_id uuid references public.events(id) on delete set null;

create index cash_game_sessions_event_id_idx on public.cash_game_sessions (event_id);

-- Add event type constraints and integrity checks
alter table public.events
  add constraint events_type_required_fields_chk
  check (
    (event_type = 'tournament' and buy_in is not null)
    or (event_type = 'cash_game' and nullif(trim(blinds), '') is not null)
  );

create or replace function public.handle_cash_game_session_integrity()
returns trigger
language plpgsql
as $$
declare
  linked_event_type public.event_type;
begin
  new.net_result := new.cash_out - new.buy_in;

  if new.event_id is null then
    return new;
  end if;

  select e.event_type
    into linked_event_type
  from public.events e
  where e.id = new.event_id;

  if linked_event_type is null then
    return new;
  end if;

  if linked_event_type <> 'cash_game' then
    raise exception 'cash_game_sessions.event_id must reference an events row with event_type=cash_game';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_cash_game_session_integrity on public.cash_game_sessions;

create trigger enforce_cash_game_session_integrity
before insert or update on public.cash_game_sessions
for each row execute function public.handle_cash_game_session_integrity();

-- RBAC function for role checks
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

-- Admin RLS policies
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

-- Admin wallet adjustment function
create or replace function public.admin_adjust_wallet_balance(
  target_user_id uuid,
  adjustment_amount numeric,
  adjustment_reason text default null
)
returns public.wallet_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  current_balance numeric(12,2);
  next_balance numeric(12,2);
  inserted_transaction public.wallet_transactions;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to adjust wallets.';
  end if;

  if not public.has_profile_role(array['admin']::text[]) then
    raise exception 'Only admins can adjust wallets.';
  end if;

  if adjustment_amount = 0 then
    raise exception 'Adjustment amount cannot be zero.';
  end if;

  select w.balance
    into current_balance
  from public.wallets w
  where w.user_id = target_user_id
  for update;

  if current_balance is null then
    raise exception 'Wallet not found for target user.';
  end if;

  next_balance := current_balance + adjustment_amount;

  if next_balance < 0 then
    raise exception 'Adjustment would result in a negative wallet balance.';
  end if;

  update public.wallets
    set balance = next_balance,
        updated_at = now()
  where user_id = target_user_id;

  insert into public.wallet_transactions (
    user_id,
    type,
    amount,
    balance_before,
    balance_after,
    reference_type,
    description
  )
  values (
    target_user_id,
    'adjustment',
    abs(adjustment_amount),
    current_balance,
    next_balance,
    'admin_adjustment',
    adjustment_reason
  )
  returning * into inserted_transaction;

  return inserted_transaction;
end;
$$;

-- Subscription sync trigger
create or replace function public.sync_profile_subscriber_from_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set is_subscriber = (new.status = 'active')
  where id = new.user_id;

  return new;
end;
$$;

drop trigger if exists sync_profile_subscriber_from_subscription on public.subscriptions;

create trigger sync_profile_subscriber_from_subscription
after insert or update of status on public.subscriptions
for each row execute function public.sync_profile_subscriber_from_subscription();

update public.profiles p
set is_subscriber = exists (
  select 1
  from public.subscriptions s
  where s.user_id = p.id
    and s.status = 'active'
);

-- Storage bucket and policies
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
