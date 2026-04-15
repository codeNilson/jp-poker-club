-- Tabela de pagamentos Mercado Pago
create table public.payments (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  status         text        not null default 'pending',
  amount         numeric(12,2) not null check (amount > 0),
  preference_id  text,
  mp_payment_id  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Trigger para atualizar updated_at automaticamente
create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

-- Índices para consulta eficiente e idempotência
create index payments_user_id_status_idx  on public.payments (user_id, status);
create index payments_mp_payment_id_idx   on public.payments (mp_payment_id)
  where mp_payment_id is not null;

-- RLS
alter table public.payments enable row level security;

-- Dono pode ver seus próprios pagamentos
create policy "Payments are readable by the owner"
on public.payments
for select
using (auth.uid() = user_id);

-- Apenas o backend (service role) pode inserir / atualizar
-- Não há políticas client-side de INSERT/UPDATE: o webhook e a Server Action
-- usam o admin client (service role) que ignora RLS.
