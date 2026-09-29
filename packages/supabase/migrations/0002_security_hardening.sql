-- Budega — endurecimento de segurança das políticas da 0001.
-- Problemas encontrados ao testar a 0001 num Postgres real (PGlite, ver
-- packages/supabase/tests/) — detalhes em .audit/errors/2026-09-29/:
--   1. qualquer usuário autenticado podia se promover a admin (profiles_update_own);
--   2. qualquer usuário podia cadastrar mercado em nome de outro dono e já
--      verificado/destacado, e o dono podia se auto-verificar ou reativar um mercado
--      suspenso;
--   3. denúncias/eventos anônimos podiam forjar user_id e status;
--   4. mercado suspenso continuava público (com ofertas e encartes);
--   5. a tabela de controle _migrations ficava exposta pela API sem RLS.
--
-- "Papéis confiáveis" abaixo = conexões que não passam pelo PostgREST como usuário
-- final (postgres no SQL Editor, service_role no seed). Só anon/authenticated são
-- restringidos pelos triggers, para que o admin inicial possa ser promovido via SQL.

-- =========================================================================
-- 1. profiles: role só muda por admin
-- =========================================================================
-- security invoker de propósito: current_user precisa ser a role de quem fez o UPDATE.
create or replace function protect_profile_changes()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated') and not is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Somente administradores podem alterar a role de um perfil'
        using errcode = '42501';
    end if;
    if new.id is distinct from old.id then
      raise exception 'O id do perfil não pode ser alterado' using errcode = '42501';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_protect_changes
  before update on profiles
  for each row execute function protect_profile_changes();

-- Admin precisa conseguir gerenciar roles de outros usuários pelo painel.
create policy "profiles_update_admin" on profiles
  for update using (is_admin()) with check (is_admin());

-- =========================================================================
-- 2. markets: dono = quem cadastra; flags de moderação só por admin
-- =========================================================================
drop policy "markets_insert_manager" on markets;
create policy "markets_insert_owner_or_admin" on markets
  for insert with check (is_admin() or (auth.uid() is not null and owner_id = auth.uid()));

create or replace function protect_market_moderation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated') and not is_admin() then
    if tg_op = 'INSERT' then
      if new.is_verified or new.is_featured or new.is_suspended then
        raise exception 'Somente administradores podem verificar, destacar ou suspender mercados'
          using errcode = '42501';
      end if;
    elsif new.is_verified is distinct from old.is_verified
       or new.is_featured is distinct from old.is_featured
       or new.is_suspended is distinct from old.is_suspended then
      raise exception 'Somente administradores podem verificar, destacar ou suspender mercados'
        using errcode = '42501';
    elsif new.owner_id is distinct from old.owner_id then
      raise exception 'Somente administradores podem transferir um mercado' using errcode = '42501';
    end if;
  end if;
  if tg_op = 'UPDATE' then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

create trigger markets_protect_moderation
  before insert or update on markets
  for each row execute function protect_market_moderation();

-- =========================================================================
-- 3. reports / analytics_events: sem forjar autor nem status
-- =========================================================================
drop policy "reports_insert_anyone" on reports;
create policy "reports_insert_anyone" on reports
  for insert with check (
    status = 'pending'
    and resolved_at is null
    and (user_id is null or user_id = auth.uid())
  );

drop policy "analytics_insert_anyone" on analytics_events;
create policy "analytics_insert_anyone" on analytics_events
  for insert with check (user_id is null or user_id = auth.uid());

-- =========================================================================
-- 4. mercado suspenso some da experiência pública (com ofertas e encartes)
-- =========================================================================
create or replace function is_market_public(target_market_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from markets where id = target_market_id and not is_suspended);
$$;

drop policy "markets_select_public" on markets;
create policy "markets_select_public" on markets
  for select using (not is_suspended or is_market_manager_of(id));

drop policy "branches_select_public" on branches;
create policy "branches_select_public" on branches
  for select using (is_market_public(market_id) or is_market_manager_of(market_id));

drop policy "flyers_select_public_active" on flyers;
create policy "flyers_select_public_active" on flyers
  for select using (
    (status = 'active' and now() between valid_from and valid_until and is_market_public(market_id))
    or is_market_manager_of(market_id)
  );

drop policy "offers_select_public_active" on offers;
create policy "offers_select_public_active" on offers
  for select using (
    (is_active = true and now() between valid_from and valid_until and is_market_public(market_id))
    or is_market_manager_of(market_id)
  );

-- =========================================================================
-- 5. tabela de controle do script de migrations
-- =========================================================================
-- Criada por scripts/run-migrations.mjs no schema public; sem RLS ficaria legível e
-- editável por anon via API. Sem policies = só papéis confiáveis acessam.
alter table if exists public._migrations enable row level security;
