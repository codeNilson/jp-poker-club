-- Inserindo dados falsos do Carrossel
insert into public.carousel_items (title, description, desktop_image_url, mobile_image_url, action_text, link_url, is_active, sort_order)
select v.title, v.description, v.desktop_image_url, v.mobile_image_url, v.action_text, v.link_url, v.is_active, v.sort_order
from (
  values
    ('Torneio Deep Stack de Abril', 'Inscricoes abertas com vagas limitadas para a etapa principal do mes.', 'https://placehold.co/1200x630/0F0F13/32E035?text=Evento+Abril', 'https://placehold.co/800x1000/0F0F13/32E035?text=Evento+Abril', 'Ver evento', '/eventos', true, 1),
    ('Promocao de Recarga da Carteira', 'Aproveite os creditos extras para assinantes nas recargas via PIX.', 'https://placehold.co/1200x630/101418/32E035?text=Promocao+Carteira', 'https://placehold.co/800x1000/101418/32E035?text=Promocao+Carteira', 'Conferir promocao', '/promocoes', true, 2),
    ('Ranking Atualizado da Semana', 'Veja quem subiu no Elo apos os ultimos resultados registrados.', 'https://placehold.co/1200x630/141414/32E035?text=Ranking+da+Semana', 'https://placehold.co/800x1000/141414/32E035?text=Ranking+da+Semana', 'Ler noticia', '/noticias', true, 3),
    ('Especial de Boas-vindas', 'Campanha temporariamente pausada para revisao de regras internas.', 'https://placehold.co/1200x630/0F0F13/4B5563?text=Campanha+Pausada', 'https://placehold.co/800x1000/0F0F13/4B5563?text=Campanha+Pausada', 'Saiba mais', '/promocoes/especial-boas-vindas', false, 4)
) as v(title, description, desktop_image_url, mobile_image_url, action_text, link_url, is_active, sort_order)
where not exists (select 1 from public.carousel_items c where c.link_url = v.link_url);

-- Inserindo dados falsos de Notícias
insert into public.news (title, description, content, slug, category, cover_image_url, read_time_minutes, is_featured, is_hot, is_active, published_at)
select v.title, v.description, v.content, v.slug, v.category::public.news_category, v.cover_image_url, v.read_time_minutes, v.is_featured, v.is_hot, v.is_active, v.published_at
from (
  values
    ('Ranking de abril vai premiar os 8 melhores com stack inicial turbo', 'A nova etapa do ranking chega com premiacao estendida...', 'O clube inicia abril com uma etapa especial...', 'ranking-abril-stack-inicial-turbo', 'ranking', 'https://placehold.co/1200x630/0F0F13/32E035?text=Ranking+Abril', 4, true, true, true, now() - interval '1 day'),
    ('Agenda oficial de torneios de abril foi atualizada', 'Confira as datas, horarios e limites de jogadores...', 'A agenda de abril ja esta disponivel com formatos variados...', 'agenda-torneios-abril-atualizada', 'eventos', 'https://placehold.co/1200x630/101418/32E035?text=Agenda+Abril', 3, false, false, true, now() - interval '2 day'),
    ('Como funciona o bonus de 20 por cento para assinantes na carteira', 'Entenda quando o credito extra e aplicado...', 'Sempre que um deposito via PIX e confirmado...', 'bonus-assinante-carteira-como-funciona', 'assinatura', 'https://placehold.co/1200x630/141414/32E035?text=Bonus+Assinante', 5, false, false, true, now() - interval '3 day'),
    ('Regras de buy-in presencial seguem em validacao final', 'A equipe esta avaliando o fluxo ideal entre debito...', 'Nosso objetivo e manter um processo simples...', 'buy-in-presencial-validacao-final', 'comunicado', 'https://placehold.co/1200x630/0F0F13/32E035?text=Buy-in+Presencial', 2, false, false, true, now() - interval '5 day')
) as v(title, description, content, slug, category, cover_image_url, read_time_minutes, is_featured, is_hot, is_active, published_at)
where not exists (select 1 from public.news n where n.slug = v.slug);

-- Inserindo dados falsos de Eventos
insert into public.events (title, description, event_date, buy_in, max_players, status)
select v.title, v.description, v.event_date, v.buy_in, v.max_players, v.status::public.event_status
from (
  values
    ('Turbo Knockout presencial', 'Evento rapido com estrutura dinamica para sabado a noite.', now() + interval '2 day', 60.00, 32, 'upcoming'),
    ('Main Event da semana', 'Torneio principal com pontuacao integral para o ranking.', now() + interval '3 day', 100.00, 40, 'upcoming'),
    ('Sit and Go de aquecimento', 'Mesa rapida para preparacao antes do evento principal.', now() + interval '1 day', 30.00, 10, 'upcoming')
) as v(title, description, event_date, buy_in, max_players, status)
where not exists (select 1 from public.events e where e.title = v.title and e.event_date::date = v.event_date::date);