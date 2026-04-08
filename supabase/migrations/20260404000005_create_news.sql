create type public.news_category as enum ('clube', 'eventos', 'ranking', 'assinatura', 'comunicado', 'promoção');

create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  content text not null,
  slug text not null unique,
  category public.news_category not null,
  cover_image_url text,
  read_time_minutes integer not null default 3 check (read_time_minutes > 0),
  is_featured boolean not null default false,
  is_hot boolean not null default false,
  is_active boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index news_published_at_idx on public.news (published_at desc);
create index news_category_published_at_idx on public.news (category, published_at desc);
create index news_featured_published_at_idx
  on public.news (is_featured, published_at desc)
  where is_active = true;

create trigger set_news_updated_at
before update on public.news
for each row execute function public.set_updated_at();

alter table public.news enable row level security;

create policy "News are publicly readable when active and published"
on public.news
for select
using (is_active = true and published_at <= now());
