# Registro de mudança — apps-web autenticacao por cookie proxy do admin e cadastro edicao de mercados

- Data e hora: 2026-09-29 11:18:43 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: 15c24c0 (base)
- Tipo: feature | bugfix
- Status: concluída

## O que foi alterado

**Autenticação e acesso ao painel** (detalhes da causa em
`.audit/errors/2026-09-29/..._admin-da-web-nao-funcionaria-com-supabase-real...`):

- Dependências da web: `@supabase/ssr` e `@supabase/supabase-js` diretos.
- Novos: `src/proxy.ts`, `lib/supabase-server.ts`, `lib/auth.ts`,
  `app/auth/callback/route.ts`, `app/acesso-negado/page.tsx`,
  `components/auth/sign-out-button.tsx`, `components/layout/header-account.tsx`,
  `hooks/use-session-user.ts`.
- Alterados: `lib/supabase.ts`, `lib/data.ts`, `lib/actions.ts` (denúncia com `user_id`
  da sessão, nunca do cliente), `lib/admin-data.ts`, `lib/admin-actions.ts`,
  `components/auth/auth-form.tsx` (`?next=`, `emailRedirectTo`), `app/entrar/page.tsx`,
  `app/admin/layout.tsx` (nome/role/sair; "Denúncias" só para admin),
  `site-header.tsx`/`mobile-nav.tsx` ("Painel"/"Sair" quando logado).
- `lib/utils.ts`: `safeNextPath()`.

**Mercados e filiais no admin** (requisito do brief §7 que faltava):

- `components/admin/market-form-dialog.tsx`: cadastrar e editar mercado.
  `createMarket`/`updateMarket` em `admin-actions.ts` (slug automático e único; slug não
  muda na edição; responsável vira dono do que cadastra).
- `components/admin/opening-hours-editor.tsx`: horário por dia da semana, usado por
  mercado e filial.
- Filiais: agora também dá para **editar** (`updateBranch`), e o horário é por dia.
- Tabela de mercados: botão "Novo mercado", "Editar" por linha; verificar/destacar/
  suspender só aparece para admin. Texto da página sem jargão técnico.

**Shared**: `slugify`, `visibility.ts`, `marketFormSchema` sem flags de moderação e com
coordenadas/horários validados (abertura antes do fechamento, formato HH:MM).

**Mobile**: `src/lib/data.ts` esconde mercado suspenso em modo mock (mesma regra do RLS).

**Testes**: `proxy.test.ts` (3), `utils.test.ts` (3), 6 novos em
`admin-actions.test.ts`, 2 em `markets-table.test.tsx`, `slug.test.ts` (2),
`visibility.test.ts` (2). `vitest.config.ts` aponta `server-only` para um stub.

## Motivo

Deixar o sistema funcional com Supabase real (pedido do usuário) e cumprir o brief
("Mercados: listar; buscar; criar; editar; ...").

## Impacto

- Público: páginas continuam estáticas/cacheadas (header lê a sessão no cliente).
- Supabase real: é preciso adicionar `<domínio>/auth/callback` nas Redirect URLs do
  projeto (Authentication > URL Configuration) para o link de confirmação de cadastro.
- Primeiro admin: promover pelo SQL Editor
  (`update profiles set role = 'admin' where id = '<uuid>';`).

## Validação executada

- `pnpm typecheck` (4/4), `pnpm lint` (4/4), `pnpm test`: 46 shared + 16 supabase + 40 web.
- `next build` OK; `/admin/*`, `/entrar`, `/auth/callback` dinâmicos; home, cadastro,
  favoritos, termos e privacidade estáticos.
- `next start` em modo mock: 17 rotas com o status esperado (200; 307 do callback sem
  código; 404 de mercado inexistente) e sem erros no log.

## Pendências e riscos

- Fluxo real de login/cadastro/confirmação não foi exercitado contra um projeto Supabase
  (não há credenciais). A lógica do proxy foi testada com o cliente simulado.
- Não há tela para o admin promover usuários a "responsável" e atribuir um mercado a
  ele — hoje é pelo SQL Editor.
- Mercado criado por admin fica sem dono (`owner_id` nulo) até essa atribuição.
