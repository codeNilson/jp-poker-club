create type public.event_type as enum ('tournament', 'cash_game');

alter table public.events
  add column event_type public.event_type not null default 'tournament',
  alter column buy_in drop not null,
  add column blinds text;

alter table public.cash_game_sessions
  add column event_id uuid references public.events(id) on delete set null;

create index cash_game_sessions_event_id_idx on public.cash_game_sessions (event_id);
