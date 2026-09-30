# Erro — sync-regional upsert em lote gravava null em coluna NOT NULL

- Data e hora: 2026-09-30 01:53:34 -03:00
- Agente/responsável: Claude Code
- Ambiente: Supabase
- Comando ou ação que gerou o erro: `pnpm --filter @budega/supabase sync:regional`
  (primeira execução real, contra o projeto Supabase do usuário)
- Status: corrigido
- Severidade: média

## Mensagem completa do erro

```
Erro ao sincronizar dados reais: Falha ao popular "markets": null value in column
"coordinates_approximate" of relation "markets" violates not-null constraint
```

## Sintoma

`categories` foi populada com sucesso (6 linhas), mas o upsert de `markets` falhou
inteiro na primeira execução real do script novo `sync-regional.ts` — nenhuma rede foi
gravada.

## Motivo provável ou causa raiz

`markets.coordinates_approximate` é `boolean not null default false` (migration 0004,
desta mesma sessão). O script fazia `{ ...market, id: toUuid(...), owner_id: null }` —
quando o objeto `market` (tipo `Market` de `packages/shared`) não tem essa propriedade
opcional definida, a chave simplesmente não existe no objeto JS. Cometa e Frangolândia
(geocodificados) definem `coordinates_approximate` nalguns mercados; Super Lagoa
(coordenadas exatas do próprio site) nunca define essa chave. O PostgREST, ao montar um
`upsert` em lote (array de objetos), normaliza as colunas pelo **conjunto de chaves de
todas as linhas do lote** — uma linha que não tem a chave recebe `null` explícito para
essa coluna, e não o `default` da tabela. Isso só aparece com múltiplas linhas
heterogêneas no mesmo lote; um `insert` de uma linha só, sem a chave, teria aplicado o
default normalmente — por isso o comportamento é fácil de não prever lendo só a doc do
Postgres.

## Correção aplicada

`packages/supabase/scripts/sync-regional.ts`: todo campo opcional que vai para uma
coluna `not null`/com default (`markets.coordinates_approximate`,
`branches.coordinates_approximate`) ou nullable (`markets.website_url`,
`flyers.description/cover_url/source_url`) agora é setado explicitamente com `?? false`
ou `?? null` em vez de deixar a chave ausente quando o valor de origem é `undefined`.

## Como foi validado

Rodado de novo contra o projeto real depois da correção:
`categories: 6, markets: 3, branches: 72, flyers: 9` — sucesso completo. Conferido por
consulta direta ao Postgres (`select count(*) from <tabela>`) e pelo site rodando em
produção local (`pnpm --filter @budega/web build && pnpm --filter @budega/web start`)
servindo `/explorar` e `/mercados/super-lagoa` com as 3 redes e as lojas certas via
`Invoke-WebRequest`.

## Como evitar a repetição

Regra para `packages/supabase/scripts/sync-regional.ts` (e qualquer script futuro que
faça upsert em lote via supabase-js/PostgREST com objetos de origens heterogêneas):
nunca depender do spread (`...objeto`) sozinho para colunas opcionais quando as linhas
do lote podem vir de fontes diferentes (adaptadores diferentes) — sempre normalizar
explicitamente com `?? valorPadrão` antes de montar o array que vai para `.upsert()`.

## Aprendizado reutilizável

PostgREST/Supabase, ao fazer upsert em lote de um array de objetos JS com formatos
diferentes entre si, não aplica o `DEFAULT` da coluna do Postgres para uma linha que
simplesmente não tem aquela chave — ele grava `null`. Isso é diferente de um insert de
uma linha só sem a chave (que aplicaria o default normalmente). Qualquer código que
monte um array heterogêneo para upsert em lote precisa normalizar todas as colunas
opcionais explicitamente antes de enviar, e não confiar no default da tabela.
