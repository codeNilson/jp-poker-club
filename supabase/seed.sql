-- Inserindo dados falsos do Carrossel
insert into public.carousel_items (id, title, description, desktop_image_url, mobile_image_url, action_text, link_url, is_active, sort_order)
select v.id::uuid, v.title, v.description, v.desktop_image_url, v.mobile_image_url, v.action_text, v.link_url, v.is_active, v.sort_order
from (
  values
    ('11111111-1111-4111-8111-111111111131', 'Torneio Deep Stack de Abril', 'Inscricoes abertas com vagas limitadas para a etapa principal do mes.', 'https://placehold.co/1200x630/0F0F13/32E035?text=Evento+Abril', 'https://placehold.co/800x1000/0F0F13/32E035?text=Evento+Abril', 'Ver evento', '/eventos', true, 1),
    ('22222222-2222-4222-8222-222222222232', 'Promocao de Recarga da Carteira', 'Aproveite os creditos extras para assinantes nas recargas via PIX.', 'https://placehold.co/1200x630/101418/32E035?text=Promocao+Carteira', 'https://placehold.co/800x1000/101418/32E035?text=Promocao+Carteira', 'Conferir promocao', '/promocoes', true, 2),
    ('33333333-3333-4333-8333-333333333333', 'Ranking Atualizado da Semana', 'Veja quem subiu no Elo apos os ultimos resultados registrados.', 'https://placehold.co/1200x630/141414/32E035?text=Ranking+da+Semana', 'https://placehold.co/800x1000/141414/32E035?text=Ranking+da+Semana', 'Ler noticia', '/noticias', true, 3),
    ('44444444-4444-4444-8444-444444444444', 'Especial de Boas-vindas', 'Campanha temporariamente pausada para revisao de regras internas.', 'https://placehold.co/1200x630/0F0F13/4B5563?text=Campanha+Pausada', 'https://placehold.co/800x1000/0F0F13/4B5563?text=Campanha+Pausada', 'Saiba mais', '/promocoes/especial-boas-vindas', false, 4),
    ('55555555-5555-4555-8555-555555555557', 'Agenda de Torneios da Semana', 'Resumo rapido da programacao para os proximos dias.', 'https://placehold.co/1200x630/0F0F13/32E035?text=Agenda+Semana', 'https://placehold.co/800x1000/0F0F13/32E035?text=Agenda+Semana', 'Ver agenda', '/eventos', true, 5),
    ('66666666-6666-4666-8666-666666666668', 'Beneficio de Assinante Ativo', 'Descricao curta do bonus aplicado nas recargas aprovadas.', 'https://placehold.co/1200x630/101418/32E035?text=Assinante', 'https://placehold.co/800x1000/101418/32E035?text=Assinante', 'Ver beneficio', '/promocoes', true, 6),
    ('77777777-7777-4777-8777-777777777779', 'Radar do Clube', 'Noticias e eventos reunidos em um unico destaque.', 'https://placehold.co/1200x630/141414/32E035?text=Radar+do+Clube', 'https://placehold.co/800x1000/141414/32E035?text=Radar+do+Clube', 'Abrir radar', '/noticias', true, 7),
    ('88888888-8888-4888-8888-88888888888a', 'Mesa Presencial e Comunidade', 'Convite para participar das noites presenciais do clube.', 'https://placehold.co/1200x630/0F0F13/32E035?text=Comunidade', 'https://placehold.co/800x1000/0F0F13/32E035?text=Comunidade', 'Falar com a equipe', '/fale-conosco', true, 8),
    ('99999999-9999-4999-8999-999999999992', 'Historico de Resultados', 'Consulta rapida aos ultimos eventos e posicoes registradas.', 'https://placehold.co/1200x630/101418/32E035?text=Resultados', 'https://placehold.co/800x1000/101418/32E035?text=Resultados', 'Ver resultados', '/noticias', true, 9),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaad', 'Clube em Movimento', 'Destaque institucional com foco em agenda e proximos passos.', 'https://placehold.co/1200x630/141414/32E035?text=Clube+em+Movimento', 'https://placehold.co/800x1000/141414/32E035?text=Clube+em+Movimento', 'Conhecer mais', '/fale-conosco', true, 10)
) as v(id, title, description, desktop_image_url, mobile_image_url, action_text, link_url, is_active, sort_order)
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  desktop_image_url = excluded.desktop_image_url,
  mobile_image_url = excluded.mobile_image_url,
  action_text = excluded.action_text,
  link_url = excluded.link_url,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- Inserindo usuarios falsos para suportar os dados de perfil, carteira e torneio
insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
)
select v.id::uuid, v.aud, v.role, v.email, v.encrypted_password, v.email_confirmed_at, v.raw_app_meta_data, v.raw_user_meta_data, v.created_at, v.updated_at, v.is_sso_user, v.is_anonymous
from (
  values
    ('11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'ana.silva@jpclub.local', null, now() - interval '20 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Ana Silva","avatar_url":"https://placehold.co/200x200/0F0F13/32E035?text=AS"}'::jsonb, now() - interval '20 days', now() - interval '20 days', false, false),
    ('22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'bruno.costa@jpclub.local', null, now() - interval '19 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Bruno Costa","avatar_url":"https://placehold.co/200x200/0F0F13/32E035?text=BC"}'::jsonb, now() - interval '19 days', now() - interval '19 days', false, false),
    ('33333333-3333-4333-8333-333333333333', 'authenticated', 'authenticated', 'carla.mendes@jpclub.local', null, now() - interval '18 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Carla Mendes","avatar_url":"https://placehold.co/200x200/0F0F13/32E035?text=CM"}'::jsonb, now() - interval '18 days', now() - interval '18 days', false, false),
    ('44444444-4444-4444-8444-444444444444', 'authenticated', 'authenticated', 'diego.rocha@jpclub.local', null, now() - interval '17 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Diego Rocha","avatar_url":"https://placehold.co/200x200/0F0F13/32E035?text=DR"}'::jsonb, now() - interval '17 days', now() - interval '17 days', false, false),
    ('55555555-5555-4555-8555-555555555555', 'authenticated', 'authenticated', 'elisa.pereira@jpclub.local', null, now() - interval '16 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Elisa Pereira","avatar_url":"https://placehold.co/200x200/0F0F13/32E035?text=EP"}'::jsonb, now() - interval '16 days', now() - interval '16 days', false, false),
    ('66666666-6666-4666-8666-666666666666', 'authenticated', 'authenticated', 'fabio.lima@jpclub.local', null, now() - interval '15 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Fabio Lima","avatar_url":"https://placehold.co/200x200/0F0F13/32E035?text=FL"}'::jsonb, now() - interval '15 days', now() - interval '15 days', false, false),
    ('77777777-7777-4777-8777-777777777777', 'authenticated', 'authenticated', 'gabriela.nunes@jpclub.local', null, now() - interval '14 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Gabriela Nunes","avatar_url":"https://placehold.co/200x200/0F0F13/32E035?text=GN"}'::jsonb, now() - interval '14 days', now() - interval '14 days', false, false),
    ('88888888-8888-4888-8888-888888888888', 'authenticated', 'authenticated', 'henrique.alves@jpclub.local', null, now() - interval '13 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Henrique Alves","avatar_url":"https://placehold.co/200x200/0F0F13/32E035?text=HA"}'::jsonb, now() - interval '13 days', now() - interval '13 days', false, false),
    ('99999999-9999-4999-8999-999999999999', 'authenticated', 'authenticated', 'isabela.torres@jpclub.local', null, now() - interval '12 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Isabela Torres","avatar_url":"https://placehold.co/200x200/0F0F13/32E035?text=IT"}'::jsonb, now() - interval '12 days', now() - interval '12 days', false, false),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'joao.martins@jpclub.local', null, now() - interval '11 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Joao Martins","avatar_url":"https://placehold.co/200x200/0F0F13/32E035?text=JM"}'::jsonb, now() - interval '11 days', now() - interval '11 days', false, false)
) as v(id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
on conflict (id) do update
set
  aud = excluded.aud,
  role = excluded.role,
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = excluded.updated_at,
  is_sso_user = excluded.is_sso_user,
  is_anonymous = excluded.is_anonymous;

-- Inserindo perfis falsos
insert into public.profiles (id, display_name, avatar_url, elo_points, elo_tier, is_subscriber, user_role, created_at, updated_at)
select v.id::uuid, v.display_name, v.avatar_url, v.elo_points, v.elo_tier::public.elo_tier, v.is_subscriber, v.user_role, v.created_at, v.updated_at
from (
  values
    ('11111111-1111-4111-8111-111111111111', 'Ana Silva', 'https://placehold.co/200x200/0F0F13/32E035?text=AS', 320, 'bronze', false, 'admin', now() - interval '20 days', now() - interval '20 days'),
    ('22222222-2222-4222-8222-222222222222', 'Bruno Costa', 'https://placehold.co/200x200/0F0F13/32E035?text=BC', 780, 'prata', true, 'member', now() - interval '19 days', now() - interval '19 days'),
    ('33333333-3333-4333-8333-333333333333', 'Carla Mendes', 'https://placehold.co/200x200/0F0F13/32E035?text=CM', 1180, 'prata', false, 'member', now() - interval '18 days', now() - interval '18 days'),
    ('44444444-4444-4444-8444-444444444444', 'Diego Rocha', 'https://placehold.co/200x200/0F0F13/32E035?text=DR', 1860, 'ouro', true, 'moderator', now() - interval '17 days', now() - interval '17 days'),
    ('55555555-5555-4555-8555-555555555555', 'Elisa Pereira', 'https://placehold.co/200x200/0F0F13/32E035?text=EP', 2740, 'ouro', false, 'member', now() - interval '16 days', now() - interval '16 days'),
    ('66666666-6666-4666-8666-666666666666', 'Fabio Lima', 'https://placehold.co/200x200/0F0F13/32E035?text=FL', 4020, 'platina', true, 'operator', now() - interval '15 days', now() - interval '15 days'),
    ('77777777-7777-4777-8777-777777777777', 'Gabriela Nunes', 'https://placehold.co/200x200/0F0F13/32E035?text=GN', 5450, 'platina', false, 'member', now() - interval '14 days', now() - interval '14 days'),
    ('88888888-8888-4888-8888-888888888888', 'Henrique Alves', 'https://placehold.co/200x200/0F0F13/32E035?text=HA', 7600, 'diamante', true, 'admin', now() - interval '13 days', now() - interval '13 days'),
    ('99999999-9999-4999-8999-999999999999', 'Isabela Torres', 'https://placehold.co/200x200/0F0F13/32E035?text=IT', 150, 'bronze', false, 'member', now() - interval '12 days', now() - interval '12 days'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Joao Martins', 'https://placehold.co/200x200/0F0F13/32E035?text=JM', 1450, 'prata', false, 'member', now() - interval '11 days', now() - interval '11 days')
) as v(id, display_name, avatar_url, elo_points, elo_tier, is_subscriber, user_role, created_at, updated_at)
on conflict (id) do update
set
  display_name = excluded.display_name,
  avatar_url = excluded.avatar_url,
  elo_points = excluded.elo_points,
  elo_tier = excluded.elo_tier,
  is_subscriber = excluded.is_subscriber,
  user_role = excluded.user_role,
  updated_at = excluded.updated_at;

-- Inserindo carteiras falsas
insert into public.wallets (user_id, balance, created_at, updated_at)
select v.user_id::uuid, v.balance, v.created_at, v.updated_at
from (
  values
    ('11111111-1111-4111-8111-111111111111', 100.00, now() - interval '20 days', now() - interval '20 days'),
    ('22222222-2222-4222-8222-222222222222', 120.00, now() - interval '19 days', now() - interval '19 days'),
    ('33333333-3333-4333-8333-333333333333', 65.00, now() - interval '18 days', now() - interval '18 days'),
    ('44444444-4444-4444-8444-444444444444', 150.00, now() - interval '17 days', now() - interval '17 days'),
    ('55555555-5555-4555-8555-555555555555', 210.00, now() - interval '16 days', now() - interval '16 days'),
    ('66666666-6666-4666-8666-666666666666', 300.00, now() - interval '15 days', now() - interval '15 days'),
    ('77777777-7777-4777-8777-777777777777', 80.00, now() - interval '14 days', now() - interval '14 days'),
    ('88888888-8888-4888-8888-888888888888', 540.00, now() - interval '13 days', now() - interval '13 days'),
    ('99999999-9999-4999-8999-999999999999', 45.00, now() - interval '12 days', now() - interval '12 days'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 95.00, now() - interval '11 days', now() - interval '11 days')
) as v(user_id, balance, created_at, updated_at)
on conflict (user_id) do update
set
  balance = excluded.balance,
  updated_at = excluded.updated_at;

-- Inserindo assinaturas falsas
insert into public.subscriptions (user_id, status, provider, provider_customer_id, provider_subscription_id, current_period_start, current_period_end, canceled_at, created_at, updated_at)
select v.user_id::uuid, v.status::public.subscription_status, v.provider, v.provider_customer_id, v.provider_subscription_id, v.current_period_start, v.current_period_end, v.canceled_at, v.created_at, v.updated_at
from (
  values
    ('11111111-1111-4111-8111-111111111111', 'inactive', 'pagarme', 'cus_seed_01', null, null, null, null, now() - interval '20 days', now() - interval '20 days'),
    ('22222222-2222-4222-8222-222222222222', 'active', 'pagarme', 'cus_seed_02', 'sub_seed_02', now() - interval '2 days', now() + interval '28 days', null, now() - interval '19 days', now() - interval '19 days'),
    ('33333333-3333-4333-8333-333333333333', 'past_due', 'pagarme', 'cus_seed_03', 'sub_seed_03', now() - interval '32 days', now() - interval '2 days', null, now() - interval '18 days', now() - interval '18 days'),
    ('44444444-4444-4444-8444-444444444444', 'active', 'pagarme', 'cus_seed_04', 'sub_seed_04', now() - interval '5 days', now() + interval '25 days', null, now() - interval '17 days', now() - interval '17 days'),
    ('55555555-5555-4555-8555-555555555555', 'canceled', 'pagarme', 'cus_seed_05', 'sub_seed_05', now() - interval '45 days', now() - interval '15 days', now() - interval '7 days', now() - interval '16 days', now() - interval '16 days'),
    ('66666666-6666-4666-8666-666666666666', 'active', 'pagarme', 'cus_seed_06', 'sub_seed_06', now() - interval '1 day', now() + interval '29 days', null, now() - interval '15 days', now() - interval '15 days'),
    ('77777777-7777-4777-8777-777777777777', 'inactive', 'pagarme', 'cus_seed_07', null, null, null, null, now() - interval '14 days', now() - interval '14 days'),
    ('88888888-8888-4888-8888-888888888888', 'active', 'pagarme', 'cus_seed_08', 'sub_seed_08', now() - interval '4 days', now() + interval '26 days', null, now() - interval '13 days', now() - interval '13 days'),
    ('99999999-9999-4999-8999-999999999999', 'inactive', 'pagarme', 'cus_seed_09', null, null, null, null, now() - interval '12 days', now() - interval '12 days'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'active', 'pagarme', 'cus_seed_10', 'sub_seed_10', now() - interval '3 days', now() + interval '27 days', null, now() - interval '11 days', now() - interval '11 days')
) as v(user_id, status, provider, provider_customer_id, provider_subscription_id, current_period_start, current_period_end, canceled_at, created_at, updated_at)
on conflict (user_id) do update
set
  status = excluded.status,
  provider = excluded.provider,
  provider_customer_id = excluded.provider_customer_id,
  provider_subscription_id = excluded.provider_subscription_id,
  current_period_start = excluded.current_period_start,
  current_period_end = excluded.current_period_end,
  canceled_at = excluded.canceled_at,
  updated_at = excluded.updated_at;

-- Inserindo transacoes da carteira
insert into public.wallet_transactions (id, user_id, type, amount, balance_before, balance_after, description, created_at)
select v.id::uuid, v.user_id::uuid, v.type::public.wallet_transaction_type, v.amount, v.balance_before, v.balance_after, v.description, v.created_at
from (
  values
    ('11111111-1111-4111-8111-111111111171', '11111111-1111-4111-8111-111111111111', 'deposit', 100.00, 0.00, 100.00, 'Deposito inicial do seed', now() - interval '20 days' + interval '1 hour'),
    ('22222222-2222-4222-8222-222222222272', '22222222-2222-4222-8222-222222222222', 'bonus', 20.00, 100.00, 120.00, 'Bonus de assinatura aplicado no seed', now() - interval '19 days' + interval '1 hour'),
    ('33333333-3333-4333-8333-333333333373', '33333333-3333-4333-8333-333333333333', 'debit', 35.00, 100.00, 65.00, 'Debito de buy-in do seed', now() - interval '18 days' + interval '1 hour'),
    ('44444444-4444-4444-8444-444444444474', '44444444-4444-4444-8444-444444444444', 'refund', 50.00, 100.00, 150.00, 'Estorno manual do seed', now() - interval '17 days' + interval '1 hour'),
    ('55555555-5555-4555-8555-555555555575', '55555555-5555-4555-8555-555555555555', 'adjustment', 210.00, 0.00, 210.00, 'Ajuste de carteira do seed', now() - interval '16 days' + interval '1 hour'),
    ('66666666-6666-4666-8666-666666666676', '66666666-6666-4666-8666-666666666666', 'deposit', 300.00, 0.00, 300.00, 'Deposito inicial do seed', now() - interval '15 days' + interval '1 hour'),
    ('77777777-7777-4777-8777-777777777777', '77777777-7777-4777-8777-777777777777', 'bonus', 80.00, 0.00, 80.00, 'Credito promocional do seed', now() - interval '14 days' + interval '1 hour'),
    ('88888888-8888-4888-8888-888888888878', '88888888-8888-4888-8888-888888888888', 'debit', 60.00, 600.00, 540.00, 'Debito para torneio do seed', now() - interval '13 days' + interval '1 hour'),
    ('99999999-9999-4999-8999-999999999979', '99999999-9999-4999-8999-999999999999', 'refund', 45.00, 0.00, 45.00, 'Estorno de reserva do seed', now() - interval '12 days' + interval '1 hour'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa7a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'deposit', 95.00, 0.00, 95.00, 'Deposito inicial do seed', now() - interval '11 days' + interval '1 hour')
) as v(id, user_id, type, amount, balance_before, balance_after, description, created_at)
on conflict (id) do update
set
  user_id = excluded.user_id,
  type = excluded.type,
  amount = excluded.amount,
  balance_before = excluded.balance_before,
  balance_after = excluded.balance_after,
  description = excluded.description,
  created_at = excluded.created_at;

-- Inserindo eventos falsos
insert into public.events (id, title, description, event_date, buy_in, max_players, status, created_at, updated_at)
select v.id::uuid, v.title, v.description, v.event_date, v.buy_in, v.max_players, v.status::public.event_status, v.created_at, v.updated_at
from (
  values
    ('11111111-1111-4111-8111-111111111112', 'Turbo Knockout presencial', 'Evento rapido com estrutura dinamica para sabado a noite.', now() - interval '14 days', 60.00, 32, 'finished', now() - interval '14 days', now() - interval '14 days'),
    ('22222222-2222-4222-8222-222222222223', 'Main Event da semana', 'Torneio principal com pontuacao integral para o ranking.', now() - interval '11 days', 100.00, 40, 'finished', now() - interval '11 days', now() - interval '11 days'),
    ('33333333-3333-4333-8333-333333333334', 'Sit and Go de aquecimento', 'Mesa rapida para preparacao antes do evento principal.', now() - interval '9 days', 30.00, 10, 'finished', now() - interval '9 days', now() - interval '9 days'),
    ('44444444-4444-4444-8444-444444444445', 'Championship Night', 'Etapa em andamento com mesa cheia e cobertura dedicada.', now() - interval '30 minutes', 80.00, 36, 'ongoing', now() - interval '2 hours', now() - interval '30 minutes'),
    ('55555555-5555-4555-8555-555555555556', 'Ladies and Allies', 'Noite especial com foco em comunidade e boas mesas.', now() + interval '2 days', 50.00, 24, 'upcoming', now(), now()),
    ('66666666-6666-4666-8666-666666666667', 'High Roller Sunday', 'Evento premium para jogadores mais agressivos.', now() + interval '4 days', 150.00, 20, 'upcoming', now(), now()),
    ('77777777-7777-4777-8777-777777777778', 'Deep Stack Twilight', 'Etapa longa com stacks profundos e leitura de mesa.', now() - interval '6 days', 70.00, 30, 'finished', now() - interval '6 days', now() - interval '6 days'),
    ('88888888-8888-4888-8888-888888888889', 'Omaha Night', 'Sessao alternativa para variar o formato do jogo.', now() + interval '7 days', 40.00, 18, 'upcoming', now(), now()),
    ('99999999-9999-4999-8999-999999999990', 'Heads-up Challenge', 'Duelo direto com eliminacao rapida e muita pressao.', now() - interval '3 days', 35.00, 16, 'finished', now() - interval '3 days', now() - interval '3 days'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab', 'Final Table Clinic', 'Treino guiado para ajustes finos de fase decisiva.', now() + interval '10 days', 25.00, 12, 'upcoming', now(), now())
) as v(id, title, description, event_date, buy_in, max_players, status, created_at, updated_at)
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  event_date = excluded.event_date,
  buy_in = excluded.buy_in,
  max_players = excluded.max_players,
  status = excluded.status,
  updated_at = excluded.updated_at;

-- Inserindo resultados dos torneios
insert into public.tournament_entries (id, event_id, user_id, final_position, points_earned, created_at)
select v.id::uuid, v.event_id::uuid, v.user_id::uuid, v.final_position, v.points_earned, v.created_at
from (
  values
    ('11111111-1111-4111-8111-111111111121', '11111111-1111-4111-8111-111111111112', '88888888-8888-4888-8888-888888888888', 1, 100, now() - interval '14 days' + interval '2 hours'),
    ('22222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222223', '66666666-6666-4666-8666-666666666666', 1, 100, now() - interval '11 days' + interval '2 hours'),
    ('33333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333334', '44444444-4444-4444-8444-444444444444', 1, 80, now() - interval '9 days' + interval '2 hours'),
    ('44444444-4444-4444-8444-444444444445', '77777777-7777-4777-8777-777777777778', '55555555-5555-4555-8555-555555555555', 1, 70, now() - interval '6 days' + interval '2 hours'),
    ('55555555-5555-4555-8555-555555555556', '99999999-9999-4999-8999-999999999990', '33333333-3333-4333-8333-333333333333', 1, 60, now() - interval '3 days' + interval '2 hours'),
    ('66666666-6666-4666-8666-666666666667', '11111111-1111-4111-8111-111111111112', '22222222-2222-4222-8222-222222222222', 2, 50, now() - interval '14 days' + interval '3 hours'),
    ('77777777-7777-4777-8777-777777777778', '22222222-2222-4222-8222-222222222223', '11111111-1111-4111-8111-111111111111', 2, 40, now() - interval '11 days' + interval '3 hours'),
    ('88888888-8888-4888-8888-888888888889', '33333333-3333-4333-8333-333333333334', '99999999-9999-4999-8999-999999999999', 2, 30, now() - interval '9 days' + interval '3 hours'),
    ('99999999-9999-4999-8999-999999999990', '77777777-7777-4777-8777-777777777778', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 2, 25, now() - interval '6 days' + interval '3 hours'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab', '99999999-9999-4999-8999-999999999990', '77777777-7777-4777-8777-777777777777', 2, 20, now() - interval '3 days' + interval '3 hours')
) as v(id, event_id, user_id, final_position, points_earned, created_at)
on conflict (id) do update
set
  event_id = excluded.event_id,
  user_id = excluded.user_id,
  final_position = excluded.final_position,
  points_earned = excluded.points_earned,
  created_at = excluded.created_at;

-- Inserindo dados falsos de Notícias
insert into public.news (id, title, description, content, slug, category, cover_image_url, read_time_minutes, is_featured, is_hot, is_active, published_at)
select v.id::uuid, v.title, v.description, v.content, v.slug, v.category::public.news_category, v.cover_image_url, v.read_time_minutes, v.is_featured, v.is_hot, v.is_active, v.published_at
from (
  values
    ('11111111-1111-4111-8111-111111111121', 'Ranking de abril ganhou novo topo da tabela', 'A disputa ficou mais apertada nas primeiras rodadas.', 'O ranking de abril foi atualizado com destaque para os jogadores que mais pontuaram na ultima semana.', 'ranking-de-abril-ganhou-novo-topo-da-tabela', 'ranking', null, 4, true, true, true, now() - interval '1 day'),
    ('22222222-2222-4222-8222-222222222223', 'Agenda oficial de torneios foi revisada', 'Datas e limites ficaram mais claros para os proximos eventos.', 'A agenda publica agora mostra os proximos encontros com mais clareza e melhor separacao por formato.', 'agenda-oficial-de-torneios-foi-revisada', 'eventos', null, 3, false, false, true, now() - interval '2 days'),
    ('33333333-3333-4333-8333-333333333334', 'Bonus de 20 por cento para assinantes segue ativo', 'O credito adicional continua valendo para depositos confirmados.', 'O beneficio de assinatura continua sendo aplicado automaticamente no momento da confirmacao do deposito.', 'bonus-de-20-por-cento-para-assinantes-segue-ativo', 'assinatura', null, 5, false, false, true, now() - interval '3 days'),
    ('44444444-4444-4444-8444-444444444445', 'Regras do buy-in presencial seguem em validacao', 'A equipe ainda fecha o fluxo final antes de publicar a regra definitiva.', 'O processo presencial segue em revisao interna para que a operacao fique simples e segura para o clube.', 'regras-do-buy-in-presencial-seguem-em-validacao', 'comunicado', null, 2, false, false, true, now() - interval '4 days'),
    ('55555555-5555-4555-8555-555555555556', 'Bastidores do clube mostram semana movimentada', 'Mesa cheia, agenda intensa e mais procura por eventos.', 'O movimento da semana mostrou um clube mais ativo, com varios jogadores voltando para o calendario presencial.', 'bastidores-do-clube-mostram-semana-movimentada', 'clube', null, 4, false, true, true, now() - interval '5 days'),
    ('66666666-6666-4666-8666-666666666667', 'Promocao de recarga ganhou nova janela', 'A campanha de credito voltou com periodo limitado.', 'A recarga promocional agora conta com uma nova janela de participacao para assinantes e convidados.', 'promocao-de-recarga-ganhou-nova-janela', 'promocao', null, 3, false, true, true, now() - interval '6 days'),
    ('77777777-7777-4777-8777-777777777778', 'Estrutura deep stack favorece jogo tecnico', 'O formato longo privilegia leitura de mesa e paciencia.', 'Com mais fichas iniciais e niveis extensos, o deep stack valoriza consistencia ao longo da noite.', 'estrutura-deep-stack-favorece-jogo-tecnico', 'eventos', null, 4, false, false, true, now() - interval '7 days'),
    ('88888888-8888-4888-8888-888888888889', 'Semana de radar traz eventos e noticias reais', 'Conteudo agora puxa dados da base de forma direta.', 'O radar semanal combina eventos proximos e noticias publicadas recentemente para manter a home atualizada.', 'semana-de-radar-traz-eventos-e-noticias-reais', 'clube', null, 4, false, false, true, now() - interval '8 days'),
    ('99999999-9999-4999-8999-999999999990', 'Mesa final pede controle e ajuste de ritmo', 'Dicas rapidas para nao acelerar demais na reta decisiva.', 'A leitura de stack e a selecao de spots continuam sendo os pontos mais importantes nas ultimas posicoes.', 'mesa-final-pede-controle-e-ajuste-de-ritmo', 'ranking', null, 5, false, false, true, now() - interval '9 days'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab', 'Comunidade recebe rodada extra de avisos', 'Atualizacoes gerais para fechar a semana com mais contexto.', 'Os avisos da comunidade agora reune calendario, destaque de assinantes e novas janelas de jogo.', 'comunidade-recebe-rodada-extra-de-avisos', 'comunicado', null, 3, false, false, true, now() - interval '10 days')
) as v(id, title, description, content, slug, category, cover_image_url, read_time_minutes, is_featured, is_hot, is_active, published_at)
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  content = excluded.content,
  slug = excluded.slug,
  category = excluded.category,
  cover_image_url = excluded.cover_image_url,
  read_time_minutes = excluded.read_time_minutes,
  is_featured = excluded.is_featured,
  is_hot = excluded.is_hot,
  is_active = excluded.is_active,
  published_at = excluded.published_at;