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
    reference_id,
    description
  )
  values (
    target_user_id,
    'adjustment',
    abs(adjustment_amount),
    current_balance,
    next_balance,
    'admin_adjustment',
    auth.uid(),
    adjustment_reason
  )
  returning * into inserted_transaction;

  return inserted_transaction;
end;
$$;
