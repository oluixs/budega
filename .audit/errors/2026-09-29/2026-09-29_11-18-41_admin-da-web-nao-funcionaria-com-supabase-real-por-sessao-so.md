# Erro — admin da web nao funcionaria com supabase real por sessao so no localStorage

- Data e hora: 2026-09-29 11:18:41 -03:00
- Agente/responsável: Claude Code
- Ambiente: web | Supabase
- Comando ou ação que gerou o erro: revisão de `apps/web/src/lib/supabase.ts`, `admin-actions.ts` e `admin-data.ts` ao planejar a proteção do `/admin`
- Status: corrigido (em código; não há projeto Supabase real para testar ponta a ponta)
- Severidade: alta

## Mensagem completa do erro

Nenhuma — o modo real nunca foi executado. Pela análise do código: toda mutação do admin
chegaria ao banco sem usuário (`auth.uid()` nulo), e o RLS responderia
`new row violates row-level security policy` nos inserts ou alteraria 0 linhas nos
updates (que o código reportava como sucesso).

## Sintoma

Com `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` configuradas, o painel `/admin`:

- não exigia login (qualquer pessoa abria);
- não conseguiria gravar nada, mesmo com o usuário logado como admin;
- mostraria "Mercado atualizado." mesmo quando o banco não alterava nenhuma linha;
- listaria só o conteúdo público (ofertas pausadas/vencidas ficavam invisíveis ao admin).

## Motivo provável ou causa raiz

Confirmada por leitura: a web criava **um único** cliente `supabase-js` no nível do
módulo, com a sessão persistida no `localStorage` do navegador. As Server Actions e
Server Components rodam no servidor, onde esse cliente não tem sessão nenhuma — então
todas as consultas do admin iam como `anon`. Além disso, `setMarketFlag` etc. faziam
`update({ [flag]: value })` com `flag` vindo do cliente sem validação (Server Actions são
endpoints públicos: dava para mandar `"owner_id"`).

## Correção aplicada

- `@supabase/ssr`: sessão em cookie, lida pelo servidor.
  - `lib/supabase.ts`: `getBrowserSupabase()` (login/cadastro/sair).
  - `lib/supabase-server.ts`: `createServerSupabase()` por request (admin, denúncias) e
    `publicSupabase` sem cookies (páginas públicas continuam estáticas).
- `src/proxy.ts`: renova a sessão e manda `/admin` sem sessão para `/entrar?next=...`.
- `lib/auth.ts`: `getAdminAccess()`/`requireAdminAccess()` checam sessão **e role no
  banco**; usado pelo layout, por cada página/função de dados do admin (renderizam em
  paralelo) e por cada Server Action. Sem role de painel → `/acesso-negado`.
- `admin-actions.ts`: allowlist de colunas/status, `.select("id")` para detectar 0
  linhas alteradas, mensagem amigável para erro 42501, moderação só para admin,
  `revalidatePath("/", "layout")` para o site público refletir as mudanças.
- Responsável por mercado vê no painel só os mercados dele (`marketIds`).
- `/auth/callback` para o link de confirmação de cadastro; `safeNextPath` evita
  redirecionamento aberto no `?next=`.

## Como foi validado

- `src/proxy.test.ts` (modo real simulado): sem sessão → 307 para `/entrar?next=/admin/ofertas`;
  com sessão → segue; páginas públicas não exigem login.
- `admin-actions.test.ts`: argumentos forjados (`"owner_id"`, status inválido) → "Ação inválida.".
- `utils.test.ts`: `safeNextPath` recusa `https://`, `//` e `/\`.
- `pnpm typecheck`, `pnpm test`, `pnpm lint`, `next build` e smoke test HTTP em modo mock.

## Como evitar a repetição

- No Next.js, sessão de usuário que o servidor precisa enxergar **tem** de estar em
  cookie (`@supabase/ssr`), nunca só no `localStorage`.
- Toda Server Action nova do admin deve chamar `authorize()` e validar argumentos com
  allowlist — ela é um endpoint público.
- Updates devem usar `.select("id")` e tratar 0 linhas como falha.

## Aprendizado reutilizável

"Funciona em modo mock" não prova nada sobre autenticação: sempre siga o caminho da
sessão do navegador até a query no servidor antes de considerar um fluxo autenticado pronto.
