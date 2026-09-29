# Erro — rls permitia usuario se promover a admin e forjar mercados e denuncias

- Data e hora: 2026-09-29 11:02:20 -03:00
- Agente/responsável: Claude Code
- Ambiente: Supabase (backend)
- Comando ou ação que gerou o erro: primeira execução real de `migrations/0001_init.sql` num Postgres (PGlite) com stub do `auth` do Supabase, seguida de testes como as roles `anon`/`authenticated`
- Status: corrigido (em código — a 0002 ainda precisa ser aplicada em qualquer banco real que já tenha a 0001)
- Severidade: crítica

## Mensagem completa do erro

Sem mensagem — as operações abaixo **deveriam falhar e passavam**:

```sql
-- como authenticated, usuário comum:
update profiles set role = 'admin' where id = auth.uid();   -- 1 linha alterada, role = 'admin'
insert into markets (..., owner_id, is_verified) values (..., '<outro usuário>', true);  -- aceito
update markets set is_suspended = false where id = '<meu mercado suspenso>';            -- aceito
-- como anon:
insert into reports (reason, status, user_id) values ('oferta_vencida', 'resolved', '<qualquer id>'); -- aceito
```

## Sintoma

Qualquer pessoa com conta podia virar administradora e, a partir daí, editar/apagar
qualquer mercado, oferta ou encarte. Também dava para cadastrar mercado já "verificado" e
"destacado", reativar um mercado suspenso pelo admin, e forjar denúncias "resolvidas" ou
em nome de outra pessoa.

## Motivo provável ou causa raiz

Confirmada:

1. `profiles_update_own` libera UPDATE na própria linha sem restringir colunas, e `role`
   está na mesma tabela.
2. `markets_insert_manager` só exigia `auth.uid() is not null`; não havia nada impedindo
   o dono de mexer em `is_verified`/`is_featured`/`is_suspended`/`owner_id`.
3. `reports_insert_anyone`/`analytics_insert_anyone` eram `with check (true)`.
4. Extra: a tabela `_migrations` criada pelo `run-migrations.mjs` no schema `public` não
   tinha RLS, ficando exposta pela API do Supabase.

A 0001 nunca tinha sido executada contra um Postgres (sem credenciais na sessão
original), então nenhuma política tinha sido exercitada.

## Correção aplicada

Nova `packages/supabase/migrations/0002_security_hardening.sql` (não editei a 0001
porque ela pode já ter sido aplicada em algum projeto):

- trigger `profiles_protect_changes`: `role`/`id` só mudam por admin (ou papel confiável
  — postgres/service_role — para promover o primeiro admin pelo SQL Editor);
  nova policy `profiles_update_admin`;
- `markets_insert_owner_or_admin` (`owner_id = auth.uid()`) + trigger
  `markets_protect_moderation` para as flags de moderação e troca de dono;
- inserts de `reports` exigem `status = 'pending'`, `resolved_at` nulo e
  `user_id` nulo ou do próprio usuário; `analytics_events` idem para `user_id`;
- `alter table if exists _migrations enable row level security`.

## Como foi validado

`packages/supabase/tests/migrations.test.ts` (16 testes, PGlite + `tests/supabase-stub.sql`):
com a 0002 → 16/16; removendo a 0002 → 10 falhas (os cenários acima).

## Como evitar a repetição

- `pnpm test` agora roda as migrations num Postgres real e testa as políticas; toda
  policy nova deve ganhar um teste "deveria falhar" em `tests/migrations.test.ts`.
- Regra: colunas de privilégio/moderação (role, is_verified, is_featured, is_suspended,
  owner_id, status) nunca ficam protegidas só por uma policy de linha — precisam de
  trigger ou de grant por coluna.

## Aprendizado reutilizável

RLS protege **linhas**, não **colunas**: uma policy "o usuário edita a própria linha"
libera todas as colunas dela. Teste políticas como `anon`/`authenticated` antes de
considerar uma migration pronta.
