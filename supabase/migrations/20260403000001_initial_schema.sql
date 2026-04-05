create extension if not exists "pgcrypto";

create type public.elo_tier as enum ('bronze', 'prata', 'ouro', 'platina', 'diamante');
create type public.event_status as enum ('upcoming', 'ongoing', 'finished');
create type public.subscription_status as enum ('inactive', 'active', 'past_due', 'canceled');
create type public.wallet_transaction_type as enum ('deposit', 'bonus', 'debit', 'refund', 'adjustment');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata jsonb;
  fallback_display_name text;
begin
  metadata := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  fallback_display_name := nullif(
    trim(
      coalesce(
        metadata ->> 'full_name',
        metadata ->> 'name',
        metadata ->> 'user_name',
        metadata ->> 'username',
        split_part(coalesce(new.email, ''), '@', 1)
      )
    ),
    ''
  );

  insert into public.profiles (
    id,
    display_name,
    avatar_url
  )
  values (
    new.id,
    coalesce(fallback_display_name, 'Jogador'),
    metadata ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.wallets (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  elo_points integer not null default 0,
  elo_tier public.elo_tier not null default 'bronze',
  is_subscriber boolean not null default false,
  user_role text not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.wallet_transaction_type not null,
  amount numeric(12,2) not null check (amount > 0),
  balance_before numeric(12,2) not null,
  balance_after numeric(12,2) not null,
  reference_type text,
  reference_id uuid,
  description text,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status public.subscription_status not null default 'inactive',
  provider text not null default 'pagarme',
  provider_customer_id text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date timestamptz not null,
  buy_in numeric(12,2) not null check (buy_in >= 0),
  max_players integer not null check (max_players > 0),
  status public.event_status not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tournament_entries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  final_position integer not null check (final_position > 0),
  points_earned integer not null default 0,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index profiles_elo_points_idx on public.profiles (elo_points desc);
create index wallet_transactions_user_id_created_at_idx on public.wallet_transactions (user_id, created_at desc);
create index subscriptions_status_idx on public.subscriptions (status);
create index events_status_event_date_idx on public.events (status, event_date);
create index tournament_entries_event_id_idx on public.tournament_entries (event_id);
create index tournament_entries_user_id_idx on public.tournament_entries (user_id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_wallets_updated_at
before update on public.wallets
for each row execute function public.set_updated_at();

create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create trigger set_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.events enable row level security;
alter table public.tournament_entries enable row level security;

create policy "Profiles are publicly readable"
on public.profiles
for select
using (true);

create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Wallets are readable by the owner"
on public.wallets
for select
using (auth.uid() = user_id);

create policy "Wallet transactions are readable by the owner"
on public.wallet_transactions
for select
using (auth.uid() = user_id);

create policy "Subscriptions are readable by the owner"
on public.subscriptions
for select
using (auth.uid() = user_id);

create policy "Events are publicly readable"
on public.events
for select
using (true);

create policy "Tournament entries are publicly readable"
on public.tournament_entries
for select
using (true);
