-- WDSJL's Gifts - PostgreSQL Schema（自建数据库，无 Supabase）

create extension if not exists "pgcrypto";

create table if not exists spaces (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null default '未命名空间',
  background_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references spaces(id) on delete cascade,
  title text not null default '',
  description text not null default '',
  thumbnail_url text,
  position_x numeric not null default 50 check (position_x >= 0 and position_x <= 100),
  position_y numeric not null default 50 check (position_y >= 0 and position_y <= 100),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists items_space_id_idx on items(space_id);
create index if not exists spaces_slug_idx on spaces(slug);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists spaces_updated_at on spaces;
create trigger spaces_updated_at
  before update on spaces
  for each row execute function set_updated_at();

drop trigger if exists items_updated_at on items;
create trigger items_updated_at
  before update on items
  for each row execute function set_updated_at();

-- 图片存储在服务器本地 uploads/ 目录，数据库仅保存 URL 路径
-- 示例：/uploads/backgrounds/1718888888-a8f92c.webp
