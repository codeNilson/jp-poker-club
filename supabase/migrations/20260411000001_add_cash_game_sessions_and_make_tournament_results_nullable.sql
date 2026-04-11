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
