create table public.event_confirmations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index event_confirmations_event_id_created_at_idx
on public.event_confirmations (event_id, created_at desc);

create index event_confirmations_user_id_created_at_idx
on public.event_confirmations (user_id, created_at desc);

create or replace function public.handle_event_confirmation_integrity()
returns trigger
language plpgsql
as $$
declare
  current_status public.event_status;
  current_max_players integer;
  current_confirmations integer;
begin
  select e.status, e.max_players
    into current_status, current_max_players
  from public.events e
  where e.id = new.event_id;

  if current_status is null then
    raise exception 'event_confirmations.event_id must reference an existing event';
  end if;

  if current_status not in ('upcoming', 'ongoing') then
    raise exception 'Nao e possivel confirmar presenca em evento encerrado';
  end if;

  select count(*)
    into current_confirmations
  from public.event_confirmations ec
  where ec.event_id = new.event_id;

  if current_confirmations >= current_max_players then
    raise exception 'Evento sem vagas disponiveis';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_event_confirmation_integrity on public.event_confirmations;

create trigger enforce_event_confirmation_integrity
before insert on public.event_confirmations
for each row execute function public.handle_event_confirmation_integrity();

alter table public.event_confirmations enable row level security;

create policy "Event confirmations are publicly readable"
on public.event_confirmations
for select
using (true);

create policy "Users can confirm themselves in events"
on public.event_confirmations
for insert
with check (auth.uid() = user_id);

create policy "Users can cancel their own confirmations"
on public.event_confirmations
for delete
using (auth.uid() = user_id);