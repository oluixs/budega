-- Budega — migration inicial
-- Cria enums, tabelas, índices e políticas RLS para o MVP.
-- Convenção: toda tabela pública tem RLS habilitado; escrita sempre exige autenticação
-- e role apropriada (regra de negócio 10.11 do brief).

create extension if not exists "pgcrypto";

-- =========================================================================
-- ENUMS
-- =========================================================================
create type user_role as enum ('user', 'market_manager', 'admin');
create type flyer_file_type as enum ('pdf', 'image');
create type flyer_status as enum ('active', 'paused', 'archived');
create type report_reason as enum (
  'preco_incorreto',
  'oferta_vencida',
  'mercado_incorreto',
  'conteudo_inadequado',
  'encarte_ilegivel'
);
create type report_status as enum ('pending', 'reviewing', 'resolved', 'dismissed');
create type analytics_event_name as enum (
  'market_view',
  'offer_view',
  'flyer_view',
  'route_click',
  'phone_click',
  'whatsapp_click',
  'share',
  'favorite_add',
  'favorite_remove'
);

-- =========================================================================
-- TABELAS
-- =========================================================================

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table markets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  phone text,
  whatsapp text,
  address text not null,
  neighborhood text not null,
  city text not null,
  state char(2) not null,
  postal_code text not null,
  latitude double precision not null,
  longitude double precision not null,
  opening_hours jsonb not null default '[]'::jsonb,
  is_verified boolean not null default false,
  is_featured boolean not null default false,
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint markets_latitude_range check (latitude between -90 and 90),
  constraint markets_longitude_range check (longitude between -180 and 180)
);

create table branches (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,
  name text not null,
  address text not null,
  neighborhood text not null,
  city text not null,
  state char(2) not null,
  postal_code text not null,
  latitude double precision not null,
  longitude double precision not null,
  phone text,
  opening_hours jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint branches_latitude_range check (latitude between -90 and 90),
  constraint branches_longitude_range check (longitude between -180 and 180)
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table flyers (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,
  branch_id uuid references branches (id) on delete set null,
  title text not null,
  file_url text not null,
  file_type flyer_file_type not null,
  valid_from timestamptz not null,
  valid_until timestamptz not null,
  is_active boolean not null default true,
  status flyer_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint flyers_valid_range check (valid_until > valid_from)
);

create table offers (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets (id) on delete cascade,
  branch_id uuid references branches (id) on delete set null,
  category_id uuid not null references categories (id) on delete restrict,
  name text not null,
  description text,
  image_url text,
  promotional_price numeric(10, 2) not null check (promotional_price > 0),
  regular_price numeric(10, 2) check (regular_price is null or regular_price > promotional_price),
  unit text not null,
  conditions text,
  -- Regra de negócio 10.1: oferta sem validade não pode ser publicada.
  valid_from timestamptz not null,
  valid_until timestamptz not null,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint offers_valid_range check (valid_until > valid_from)
);

create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade,
  device_id text,
  market_id uuid references markets (id) on delete cascade,
  offer_id uuid references offers (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_target_check check (
    (market_id is not null and offer_id is null) or (market_id is null and offer_id is not null)
  ),
  constraint favorites_owner_check check (user_id is not null or device_id is not null)
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete set null,
  market_id uuid references markets (id) on delete cascade,
  flyer_id uuid references flyers (id) on delete cascade,
  offer_id uuid references offers (id) on delete cascade,
  reason report_reason not null,
  description text,
  status report_status not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name analytics_event_name not null,
  user_id uuid references profiles (id) on delete set null,
  market_id uuid references markets (id) on delete cascade,
  offer_id uuid references offers (id) on delete cascade,
  flyer_id uuid references flyers (id) on delete cascade,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- ÍNDICES
-- =========================================================================
create index markets_slug_idx on markets (slug);
create index markets_city_idx on markets (city);
create index markets_is_featured_idx on markets (is_featured) where is_featured = true;
create index markets_location_idx on markets (latitude, longitude);

create index branches_market_id_idx on branches (market_id);
create index branches_location_idx on branches (latitude, longitude);

create index flyers_market_id_idx on flyers (market_id);
create index flyers_active_validity_idx on flyers (is_active, valid_from, valid_until);

create index offers_market_id_idx on offers (market_id);
create index offers_category_id_idx on offers (category_id);
create index offers_active_validity_idx on offers (is_active, valid_from, valid_until);
create index offers_is_featured_idx on offers (is_featured) where is_featured = true;

create index favorites_user_id_idx on favorites (user_id);
create index favorites_device_id_idx on favorites (device_id);

create index reports_status_idx on reports (status);
create index analytics_events_event_name_idx on analytics_events (event_name);
create index analytics_events_created_at_idx on analytics_events (created_at);

-- =========================================================================
-- FUNÇÕES AUXILIARES (para políticas RLS)
-- =========================================================================
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function is_market_manager_of(target_market_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from markets
    where id = target_market_id
      and owner_id = auth.uid()
  ) or is_admin();
$$;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.email), 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================
alter table profiles enable row level security;
alter table markets enable row level security;
alter table branches enable row level security;
alter table categories enable row level security;
alter table flyers enable row level security;
alter table offers enable row level security;
alter table favorites enable row level security;
alter table reports enable row level security;
alter table analytics_events enable row level security;

-- profiles: cada usuário vê/edita o próprio perfil; admin vê todos.
create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or is_admin());
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- markets: leitura pública (dados públicos de mercados); escrita exige dono/admin.
create policy "markets_select_public" on markets
  for select using (true);
create policy "markets_insert_manager" on markets
  for insert with check (auth.uid() is not null);
create policy "markets_update_owner_or_admin" on markets
  for update using (is_market_manager_of(id)) with check (is_market_manager_of(id));
create policy "markets_delete_admin_only" on markets
  for delete using (is_admin());

-- branches: leitura pública; escrita exige gerente do mercado ou admin.
create policy "branches_select_public" on branches
  for select using (true);
create policy "branches_write_manager" on branches
  for all using (is_market_manager_of(market_id)) with check (is_market_manager_of(market_id));

-- categories: leitura pública; escrita só admin.
create policy "categories_select_public" on categories
  for select using (true);
create policy "categories_write_admin" on categories
  for all using (is_admin()) with check (is_admin());

-- flyers: público vê só os vigentes/ativos; gerente/admin vê e gerencia tudo do seu mercado.
create policy "flyers_select_public_active" on flyers
  for select using (
    (status = 'active' and now() between valid_from and valid_until)
    or is_market_manager_of(market_id)
  );
create policy "flyers_write_manager" on flyers
  for all using (is_market_manager_of(market_id)) with check (is_market_manager_of(market_id));

-- offers: mesma regra dos encartes — vencida/inativa não aparece publicamente.
create policy "offers_select_public_active" on offers
  for select using (
    (is_active = true and now() between valid_from and valid_until)
    or is_market_manager_of(market_id)
  );
create policy "offers_write_manager" on offers
  for all using (is_market_manager_of(market_id)) with check (is_market_manager_of(market_id));

-- favorites: só o dono autenticado enxerga/gerencia os próprios favoritos.
-- Favoritos anônimos (regra de negócio 10.6) ficam em armazenamento local no
-- cliente (ver packages/shared/src/business/favorites.ts) e só chegam a esta tabela
-- depois de um login, quando são mesclados via mergeFavorites().
create policy "favorites_owner_only" on favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- reports: qualquer pessoa pode denunciar, mesmo sem cadastro (o app público permite
-- denunciar preço incorreto/oferta vencida/encarte ilegível sem exigir login); só
-- admin revisa e atualiza o status.
create policy "reports_insert_anyone" on reports
  for insert with check (true);
create policy "reports_select_own_or_admin" on reports
  for select using (user_id = auth.uid() or is_admin());
create policy "reports_update_admin_only" on reports
  for update using (is_admin()) with check (is_admin());

-- analytics_events: qualquer cliente pode registrar eventos; só admin lê.
create policy "analytics_insert_anyone" on analytics_events
  for insert with check (true);
create policy "analytics_select_admin_only" on analytics_events
  for select using (is_admin());
