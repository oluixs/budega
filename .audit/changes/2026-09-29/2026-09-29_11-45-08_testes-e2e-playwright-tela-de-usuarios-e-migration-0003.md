# Registro de mudança — testes e2e playwright tela de usuarios e migration 0003

- Data e hora: 2026-09-29 11:45:08 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: 50c6b91 (base)
- Tipo: test | feature | database | design | bugfix
- Status: concluída

## O que foi alterado

**Testes em navegador real (primeira vez no projeto)**

- `apps/web`: `@playwright/test` (devDependency) + Chromium local;
  `playwright.config.ts` (build de produção em modo mock, projetos "desktop" e
  "celular" = Pixel 7); `e2e/fixtures.ts` (falha em qualquer erro de console,
  checa rolagem horizontal, salva screenshots em `test-results/screens/`);
  `e2e/public.spec.ts` e `e2e/admin.spec.ts` — 22 cenários × 2 viewports = 44 testes.
  Script `pnpm --filter @budega/web test:e2e`.
- Bugs encontrados por eles/pelas screenshots e corrigidos (registros em
  `.audit/errors/2026-09-29/`): hidratação em favoritos, labels desconectados,
  escala tipográfica inexistente + `cn`, data/validade do encarte, botão "Denunciar"
  ausente, home estática com ofertas vencidas.
- Ajustes visuais: distância só aparece quando existe (web e mobile), mercados em
  destaque em 4 colunas no desktop (como as ofertas), botão "Duplicar" com texto.

**Gestão de usuários**

- `packages/supabase/migrations/0003_admin_user_management.sql`: função
  `admin_list_users()` (perfil + e-mail de `auth.users`, só para admin; EXECUTE
  revogado de anon). 3 testes novos em `tests/migrations.test.ts`.
- `/admin/usuarios` (`app/admin/usuarios/page.tsx`, `components/admin/users-table.tsx`):
  mudar permissão (Cliente / Responsável por mercado / Administrador; a própria conta
  fica travada) e atribuir/remover mercados de um responsável.
- `setUserRole` e `assignMarketOwner` em `admin-actions.ts` (allowlist, só admin, não
  atribui mercado a quem é "Cliente").
- Shared: tipo `AdminUser`, `owner_id` em `Market`, `mock.mockUsers`.

## Motivo

Pedido do usuário: deixar o sistema funcional. Nunca houve verificação num navegador
real, e promover responsáveis dependia de SQL.

## Impacto

- Supabase real: rodar `pnpm supabase:migrate` para aplicar a 0003.
- Nenhuma dependência nova em produção (Playwright é só de desenvolvimento; Chromium
  fica em `%LOCALAPPDATA%\ms-playwright`, fora do repositório).

## Validação executada

- `pnpm typecheck` 4/4, `pnpm lint` 4/4.
- `pnpm test`: 48 shared + 19 supabase + 47 web = 114.
- `test:e2e`: 44/44 (desktop + celular), sem erros de console, sem rolagem horizontal.
- `expo export --platform android`: bundle gerado (3670 módulos).

## Pendências e riscos

- E2E roda só em modo mock; o fluxo com Supabase real (login, gravação) continua sem
  verificação ponta a ponta por falta de um projeto de teste.
- O app mobile continua sem verificação visual em aparelho/emulador.
