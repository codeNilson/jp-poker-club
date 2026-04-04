insert into
  public.news (
    title,
    description,
    content,
    slug,
    category,
    cover_image_url,
    read_time_minutes,
    is_featured,
    is_hot,
    is_active,
    published_at
  )
select
  v.title,
  v.description,
  v.content,
  v.slug,
  v.category::public.news_category,
  v.cover_image_url,
  v.read_time_minutes,
  v.is_featured,
  v.is_hot,
  v.is_active,
  v.published_at
from
  (
    values
      (
        'Ranking de abril vai premiar os 8 melhores com stack inicial turbo',
        'A nova etapa do ranking chega com premiacao estendida, pontos dobrados no evento principal e bonus extra para assinantes ativos.',
        'O clube inicia abril com uma etapa especial de ranking. Os 8 melhores colocados entram com stack inicial turbo no proximo evento principal, incentivando participacao continua.',
        'ranking-abril-stack-inicial-turbo',
        'ranking',
        'https://placehold.co/1200x630/0F0F13/32E035?text=Ranking+Abril',
        4,
        true,
        true,
        true,
        now() - interval '1 day'
      ),
      (
        'Agenda oficial de torneios de abril foi atualizada',
        'Confira as datas, horarios e limites de jogadores dos proximos eventos presenciais do clube.',
        'A agenda de abril ja esta disponivel com formatos variados e vagas limitadas. Recomendamos confirmar presenca com antecedencia para garantir assento no horario desejado.',
        'agenda-torneios-abril-atualizada',
        'eventos',
        'https://placehold.co/1200x630/101418/32E035?text=Agenda+Abril',
        3,
        false,
        false,
        true,
        now() - interval '2 day'
      ),
      (
        'Como funciona o bonus de 20 por cento para assinantes na carteira',
        'Entenda quando o credito extra e aplicado e como acompanhar no historico da sua carteira.',
        'Sempre que um deposito via PIX e confirmado e o assinante esta ativo, o sistema credita automaticamente mais 20 por cento no saldo.',
        'bonus-assinante-carteira-como-funciona',
        'assinatura',
        'https://placehold.co/1200x630/141414/32E035?text=Bonus+Assinante',
        5,
        false,
        false,
        true,
        now() - interval '3 day'
      ),
      (
        'Regras de buy-in presencial seguem em validacao final',
        'A equipe esta avaliando o fluxo ideal entre debito de carteira e registro de pagamento externo.',
        'Nosso objetivo e manter um processo simples para jogador e seguro para auditoria. Publicaremos a regra final assim que validarmos os cenarios operacionais.',
        'buy-in-presencial-validacao-final',
        'comunicado',
        'https://placehold.co/1200x630/0F0F13/32E035?text=Buy-in+Presencial',
        2,
        false,
        false,
        true,
        now() - interval '5 day'
      )
  ) as v(
    title,
    description,
    content,
    slug,
    category,
    cover_image_url,
    read_time_minutes,
    is_featured,
    is_hot,
    is_active,
    published_at
  )
where
  not exists (
    select
      1
    from
      public.news n
    where
      n.slug = v.slug
  );

insert into
  public.events (
    title,
    description,
    event_date,
    buy_in,
    max_players,
    status
  )
select
  v.title,
  v.description,
  v.event_date,
  v.buy_in,
  v.max_players,
  v.status::public.event_status
from
  (
    values
      (
        'Turbo Knockout presencial',
        'Evento rapido com estrutura dinamica para sabado a noite.',
        now() + interval '2 day',
        60.00,
        32,
        'upcoming'
      ),
      (
        'Main Event da semana',
        'Torneio principal com pontuacao integral para o ranking.',
        now() + interval '3 day',
        100.00,
        40,
        'upcoming'
      ),
      (
        'Sit and Go de aquecimento',
        'Mesa rapida para preparacao antes do evento principal.',
        now() + interval '1 day',
        30.00,
        10,
        'upcoming'
      )
  ) as v(title, description, event_date, buy_in, max_players, status)
where
  not exists (
    select
      1
    from
      public.events e
    where
      e.title = v.title
      and e.event_date::date = v.event_date::date
  );
