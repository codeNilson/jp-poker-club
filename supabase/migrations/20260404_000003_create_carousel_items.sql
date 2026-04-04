create extension if not exists "pgcrypto";

create table public.carousel_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  desktop_image_url text not null,
  mobile_image_url text not null,
  action_text text not null default 'Saiba mais',
  link_url text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.carousel_items enable row level security;

create policy "Carousel items are publicly readable"
on public.carousel_items
for select
using (true);