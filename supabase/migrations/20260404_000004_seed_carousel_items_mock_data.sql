insert into
  public.carousel_items (
    title,
    description,
    desktop_image_url,
    mobile_image_url,
    action_text,
    link_url,
    is_active,
    sort_order
  )
select
  v.title,
  v.description,
  v.desktop_image_url,
  v.mobile_image_url,
  v.action_text,
  v.link_url,
  v.is_active,
  v.sort_order
from
  (
    values
      (
        'Torneio Deep Stack de Abril',
        'Inscricoes abertas com vagas limitadas para a etapa principal do mes.',
        'https://placehold.co/1200x630/0F0F13/32E035?text=Evento+Abril',
        'https://placehold.co/800x1000/0F0F13/32E035?text=Evento+Abril',
        'Ver evento',
        '/eventos',
        true,
        1
      ),
      (
        'Promocao de Recarga da Carteira',
        'Aproveite os creditos extras para assinantes nas recargas via PIX.',
        'https://placehold.co/1200x630/101418/32E035?text=Promocao+Carteira',
        'https://placehold.co/800x1000/101418/32E035?text=Promocao+Carteira',
        'Conferir promocao',
        '/promocoes',
        true,
        2
      ),
      (
        'Ranking Atualizado da Semana',
        'Veja quem subiu no Elo apos os ultimos resultados registrados.',
        'https://placehold.co/1200x630/141414/32E035?text=Ranking+da+Semana',
        'https://placehold.co/800x1000/141414/32E035?text=Ranking+da+Semana',
        'Ler noticia',
        '/noticias',
        true,
        3
      ),
      (
        'Especial de Boas-vindas',
        'Campanha temporariamente pausada para revisao de regras internas.',
        'https://placehold.co/1200x630/0F0F13/4B5563?text=Campanha+Pausada',
        'https://placehold.co/800x1000/0F0F13/4B5563?text=Campanha+Pausada',
        'Saiba mais',
        '/promocoes/especial-boas-vindas',
        false,
        4
      )
  ) as v(
    title,
    description,
    desktop_image_url,
    mobile_image_url,
    action_text,
    link_url,
    is_active,
    sort_order
  )
where
  not exists (
    select
      1
    from
      public.carousel_items c
    where
      c.link_url = v.link_url
  );
