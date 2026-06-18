-- WDSJL's Gifts - Initial Schema

create extension if not exists "pgcrypto";

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null default '未命名空间',
  background_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  title text not null default '',
  description text not null default '',
  thumbnail_url text,
  position_x numeric not null default 50 check (position_x >= 0 and position_x <= 100),
  position_y numeric not null default 50 check (position_y >= 0 and position_y <= 100),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index items_space_id_idx on public.items(space_id);
create index spaces_slug_idx on public.spaces(slug);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger spaces_updated_at
  before update on public.spaces
  for each row execute function public.set_updated_at();

create trigger items_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

alter table public.spaces enable row level security;
alter table public.items enable row level security;

create policy "Anyone can read published spaces"
  on public.spaces for select
  using (is_published = true);

create policy "Anyone can read items of published spaces"
  on public.items for select
  using (
    exists (
      select 1 from public.spaces
      where spaces.id = items.space_id and spaces.is_published = true
    )
  );

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "Public read access for images"
  on storage.objects for select
  using (bucket_id = 'images');

create policy "Anyone can upload images"
  on storage.objects for insert
  with check (bucket_id = 'images');

create policy "Anyone can update images"
  on storage.objects for update
  using (bucket_id = 'images');

create policy "Anyone can delete images"
  on storage.objects for delete
  using (bucket_id = 'images');
