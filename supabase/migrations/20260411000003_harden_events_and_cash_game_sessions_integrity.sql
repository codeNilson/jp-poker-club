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
