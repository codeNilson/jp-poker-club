-- Create carousel_items table
create table public.carousel_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  desktop_image_url text not null,
  mobile_image_url text not null,
  action_text text not null default 'Saiba mais',
  link_url text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.carousel_items enable row level security;

create policy "Carousel items are publicly readable"
on public.carousel_items
for select
using (true);

-- Create news category enum and news table
create type public.news_category as enum ('clube', 'eventos', 'ranking', 'assinatura', 'comunicado', 'promocao');

create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  content text not null,
  slug text not null unique,
  category public.news_category not null,
  cover_image_url text,
  read_time_minutes integer not null default 3 check (read_time_minutes > 0),
  is_featured boolean not null default false,
  is_hot boolean not null default false,
  is_active boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index news_published_at_idx on public.news (published_at desc);
create index news_category_published_at_idx on public.news (category, published_at desc);
create index news_featured_published_at_idx
  on public.news (is_featured, published_at desc)
  where is_active = true;

create unique index news_single_active_featured_idx
  on public.news (is_featured)
  where is_active = true and is_featured = true;

create trigger set_news_updated_at
before update on public.news
for each row execute function public.set_updated_at();

alter table public.news enable row level security;

create policy "News are publicly readable when active and published"
on public.news
for select
using (is_active = true and published_at <= now());

-- Add cash_game_sessions table and update tournament_entries
alter table public.tournament_entries
  alter column final_position drop not null,
  alter column points_earned drop not null;

create table public.cash_game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  played_at timestamptz not null default now(),
  buy_in numeric(12,2) not null check (buy_in >= 0),
  cash_out numeric(12,2) not null check (cash_out >= 0),
  net_result numeric(12,2) not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cash_game_sessions_user_id_idx on public.cash_game_sessions (user_id);
create index cash_game_sessions_user_id_played_at_idx on public.cash_game_sessions (user_id, played_at desc);

create trigger set_cash_game_sessions_updated_at
before update on public.cash_game_sessions
for each row execute function public.set_updated_at();

alter table public.cash_game_sessions enable row level security;

create policy "Cash game sessions are readable by the owner"
on public.cash_game_sessions
for select
using (auth.uid() = user_id);

create policy "Cash game sessions are insertable by the owner"
on public.cash_game_sessions
for insert
with check (auth.uid() = user_id);

create policy "Cash game sessions are updatable by the owner"
on public.cash_game_sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Cash game sessions are deletable by the owner"
on public.cash_game_sessions
for delete
using (auth.uid() = user_id);
