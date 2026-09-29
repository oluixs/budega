# Registro de mudança — packages-supabase migration 0002 de seguranca e testes de rls com pglite

- Data e hora: 2026-09-29 11:02:20 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: 1696e1f (base)
- Tipo: database | test
- Status: concluída

## O que foi alterado

- `migrations/0002_security_hardening.sql`: correções de RLS (ver
  `.audit/errors/2026-09-29/..._rls-permitia-usuario-se-promover-a-admin...`) e
  **mercado suspenso passa a ser invisível ao público**, junto com suas filiais, ofertas
  e encartes (nova função `is_market_public`); gerente/admin continuam vendo tudo.
- `tests/supabase-stub.sql`: stub do schema `auth` (tabela `auth.users`, `auth.uid()`
  lendo `request.jwt.claim.sub`), roles `anon`/`authenticated` e default privileges como
  no Supabase.
- `tests/migrations.test.ts`: 16 testes rodando todas as migrations num PGlite e
  exercitando as políticas como anon/authenticated/admin, mais a carga completa dos
  dados de demonstração.
- `scripts/seed-rows.ts`: mapeamento mock → linhas do banco extraído de
  `run-seed.ts` (agora compartilhado pelo seed e pelos testes). O seed não força mais
  `is_suspended: false` — os mocks já vêm com `false`.
- `package.json`: scripts `test` (vitest) e `lint` incluindo `tests`; devDependencies
  `@electric-sql/pglite`, `vitest`, `@types/node`. `tsconfig.json` passa a checar
  `scripts/**/*.ts` e `tests`.

## Motivo

A 0001 nunca tinha rodado contra um Postgres. PGlite permite validar SQL e RLS em
processo, sem credenciais, rede nem Docker.

## Impacto

- Banco: **quem já aplicou a 0001 num projeto Supabase precisa rodar
  `pnpm supabase:migrate`** para aplicar a 0002 (o runner pula a 0001 já aplicada).
- Promover o primeiro admin continua sendo pelo SQL Editor do Supabase:
  `update profiles set role = 'admin' where id = '<uuid do usuário>';`.
- Web/mobile: nenhuma mudança de código nesta etapa.

## Validação executada

- `pnpm --filter @budega/supabase test` → 16/16; sem a 0002 → 10 falhas.
- `tsc --noEmit` e `eslint src scripts tests` no pacote → limpos.

## Pendências e riscos

- PGlite é Postgres de verdade, mas o stub de `auth` não é o GoTrue do Supabase —
  a primeira aplicação num projeto Supabase real ainda deve ser feita e conferida.
- Storage (buckets de encartes/imagens) não tem políticas nesta migration; o upload
  hoje é por URL.
