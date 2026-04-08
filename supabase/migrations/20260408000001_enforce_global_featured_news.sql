with ranked_featured_news as (
  select
    id,
    row_number() over (
      order by published_at desc, created_at desc, id desc
    ) as row_number
  from public.news
  where is_active = true
    and is_featured = true
)
update public.news
set is_featured = false
where id in (
  select id
  from ranked_featured_news
  where row_number > 1
);

create unique index news_single_active_featured_idx
  on public.news (is_featured)
  where is_active = true and is_featured = true;