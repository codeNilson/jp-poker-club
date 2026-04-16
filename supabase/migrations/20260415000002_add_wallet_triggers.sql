CREATE OR REPLACE FUNCTION public.handle_wallet_transaction()
RETURNS TRIGGER AS $$
BEGIN

  IF NEW.type IN ('deposit', 'bonus') OR (NEW.type = 'adjustment' AND NEW.amount > 0) THEN
    UPDATE public.wallets
    SET balance = balance + NEW.amount,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    
  ELSIF NEW.type = 'debit' OR (NEW.type = 'adjustment' AND NEW.amount < 0) THEN
    UPDATE public.wallets
    SET balance = balance - abs(NEW.amount),
        updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_wallet_transaction_insert ON public.wallet_transactions;
CREATE TRIGGER on_wallet_transaction_insert
AFTER INSERT ON public.wallet_transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_wallet_transaction();

CREATE OR REPLACE FUNCTION public.admin_adjust_wallet_balance(
  target_user_id uuid,
  adjustment_amount numeric,
  adjustment_reason text default null
)
RETURNS public.wallet_transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance numeric(12,2);
  inserted_transaction public.wallet_transactions;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication is required to adjust wallets.';
  END IF;

  IF NOT public.has_profile_role(ARRAY['admin']::text[]) THEN
    RAISE EXCEPTION 'Only admins can adjust wallets.';
  END IF;

  IF adjustment_amount = 0 THEN
    RAISE EXCEPTION 'Adjustment amount cannot be zero.';
  END IF;

  SELECT balance INTO current_balance
  FROM public.wallets
  WHERE user_id = target_user_id;

  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for target user.';
  END IF;

  IF current_balance + adjustment_amount < 0 THEN
    RAISE EXCEPTION 'Adjustment would result in a negative wallet balance.';
  END IF;

  INSERT INTO public.wallet_transactions (
    user_id,
    type,
    amount,
    balance_before,
    balance_after,
    reference_type,
    reference_id,
    description
  )
  VALUES (
    target_user_id,
    'adjustment',
    abs(adjustment_amount),
    current_balance,
    current_balance + adjustment_amount,
    'admin_adjustment',
    auth.uid(),
    adjustment_reason
  )
  RETURNING * INTO inserted_transaction;

  RETURN inserted_transaction;
END;
$$;