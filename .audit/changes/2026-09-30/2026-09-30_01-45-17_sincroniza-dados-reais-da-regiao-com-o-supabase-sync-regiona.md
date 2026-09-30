# Registro de mudança — Sincroniza dados reais da regiao com o Supabase (sync:regional)

- Data e hora: 2026-09-30 01:45:17 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: 58cfff5
- Tipo: feature
- Status: parcial (script pronto e testado; ainda não executado contra o banco real —
  falta a service_role key, que só o usuário pode obter no painel do Supabase)

## O que foi alterado

Primeiro projeto Supabase real do Budega configurado: `apps/web/.env.local` e
`apps/mobile/.env` criados com `NEXT_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_URL`
(`https://husiugnjpmzdtavivaij.supabase.co`) e a respectiva `anon key` (projeto já
existia, criado pelo usuário via integração com o GitHub). As 4 migrations
(`0001`–`0004`, incluindo a nova `0004_source_metadata.sql` desta sessão) foram
aplicadas de verdade contra esse projeto com `pnpm --filter @budega/supabase migrate`.
`pnpm importar` rodado de novo para atualizar `packages/shared/src/data/regional.json`
com as 3 redes reais (Cometa, Frangolândia, Super Lagoa — 3 mercados, 72 lojas, 9
encartes, 0 ofertas por falta de credencial da Anthropic).

Novo script `packages/supabase/scripts/sync-regional.ts` (`pnpm --filter
@budega/supabase sync:regional`): lê `regionalSnapshot` (o retrato real gerado por
`pnpm importar`) e faz upsert em `categories` (fixas do app, do mock), `markets`,
`branches`, `flyers` e `offers` no Supabase real, convertendo os ids de string
(`"superlagoa-1"` etc.) em UUID determinístico com `toUuid()` (reaproveitado de
`scripts/seed-rows.ts`, mesmo padrão do seed de demonstração). Usa a
`SUPABASE_SERVICE_ROLE_KEY` (ignora RLS), pelo mesmo motivo de `run-seed.ts`: é uma
carga em lote feita por um processo de confiança, não por um usuário autenticado
comum.

## Motivo

Pedido do usuário: "configure o supabase. implemente." Sem isso, mesmo com Supabase
configurado, as páginas públicas ficariam vazias — `apps/web/src/lib/data.ts` só lê do
retrato local (scraping ao vivo/regional.json) quando `isMock` é verdadeiro; com
credenciais reais configuradas, ele passa a consultar as tabelas do Supabase
diretamente, que estavam vazias (só o schema existia, sem nenhuma linha).

## Impacto

Depois de rodar `sync:regional` com a service_role key, o site/app deixam de estar em
modo mock e passam a servir os dados reais das 3 redes a partir do Postgres do
Supabase, com RLS de verdade em vigor (não mais os filtros client-side que
`local-data.ts` reproduz para o modo mock). Sem impacto em segurança além do já
existente: a service_role key nunca é passada para o cliente/frontend, só usada aqui
neste script, rodado manualmente.

## Validação executada

`pnpm --filter @budega/supabase exec tsc --noEmit` e `lint` (limpos). Migrations
aplicadas de verdade contra o projeto real (`pnpm --filter @budega/supabase migrate`,
saída confirmando `0004_source_metadata.sql` aplicada). `pnpm importar` rodado contra
os 3 sites reais com sucesso. O próprio `sync-regional.ts` **ainda não foi executado**
(falta a service_role key — ver pendências).

## Pendências e riscos

Preciso da `SUPABASE_SERVICE_ROLE_KEY` do usuário (painel: Project Settings > API) para
rodar `pnpm --filter @budega/supabase sync:regional` pela primeira vez — não posso
buscar essa chave programaticamente (o classificador de segurança do Claude Code
bloqueia comandos que materializam credenciais no meu contexto; já aconteceu com a
`anon key` também). Depois de rodar, conferir manualmente no site (`/explorar`) que as
3 redes aparecem com as lojas certas. `pnpm importar --ofertas` ainda não foi rodado
(falta `ANTHROPIC_API_KEY`), então a tabela `offers` fica vazia nesta primeira
sincronização — rodar de novo depois de configurar essa credencial.
