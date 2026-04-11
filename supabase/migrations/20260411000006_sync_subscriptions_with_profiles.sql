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
