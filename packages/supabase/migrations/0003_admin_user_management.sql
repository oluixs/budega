-- Budega — gestão de usuários pelo painel (tela /admin/usuarios).
-- O e-mail fica em auth.users, que não é exposto pela API. Esta função devolve a lista
-- de usuários com e-mail e role **apenas para admin**; para qualquer outro papel,
-- levanta erro de permissão.
--
-- Promover/rebaixar usa a policy profiles_update_admin + trigger
-- profiles_protect_changes (0002). Atribuir mercado a um responsável é um UPDATE em
-- markets.owner_id, que o trigger markets_protect_moderation (0002) só permite a admin.

create or replace function admin_list_users()
returns table (id uuid, name text, email text, role user_role, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'Somente administradores podem listar usuários' using errcode = '42501';
  end if;

  return query
    select p.id, p.name, u.email::text, p.role, p.created_at
    from profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

-- No Supabase, funções novas do schema public recebem EXECUTE para anon por padrão.
revoke execute on function admin_list_users() from public, anon;
grant execute on function admin_list_users() to authenticated;
