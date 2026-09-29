-- Stub mínimo do que o Supabase fornece e as migrations usam, para testá-las num
-- Postgres local (PGlite) sem credenciais: schema/tabela auth.users, auth.uid() lendo
-- o claim do JWT como o PostgREST faz, e as roles anon/authenticated.
create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end
$$;

grant usage on schema public, auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
-- No Supabase, tabelas novas do schema public recebem grants amplos por padrão e a
-- segurança fica toda no RLS — reproduzimos isso aqui.
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;
