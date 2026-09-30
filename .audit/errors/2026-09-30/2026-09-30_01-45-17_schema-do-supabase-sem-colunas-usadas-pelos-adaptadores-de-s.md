# Erro — Schema do Supabase sem colunas usadas pelos adaptadores de sources

- Data e hora: 2026-09-30 01:45:17 -03:00
- Agente/responsável: Claude Code
- Ambiente: Supabase
- Comando ou ação que gerou o erro: revisão manual antes de escrever
  `packages/supabase/scripts/sync-regional.ts` (nenhum comando falhou — o erro foi
  descoberto por inspeção, não por uma exception em runtime)
- Status: corrigido
- Severidade: média

## Mensagem completa do erro

Não houve mensagem de erro — nenhum comando chegou a falhar. O problema foi descoberto
por inspeção: `packages/shared/src/types/index.ts` define `Market.website_url`,
`Market.coordinates_approximate`, `Branch.coordinates_approximate`,
`Flyer.description`, `Flyer.cover_url` e `Flyer.source_url`, mas nenhuma migration em
`packages/supabase/migrations/` cria essas colunas nas tabelas `markets`/`branches`/
`flyers`. Se eu tivesse rodado `sync-regional.ts` sem notar isso, o
`supabase.from("markets").upsert(...)` teria falhado em runtime com
"column ... does not exist" assim que o primeiro projeto Supabase real fosse usado.

## Sintoma

Nenhum sintoma visível ainda — o projeto nunca teve um Supabase real conectado até
esta sessão (29-30/09/2026), então essa gravação nunca tinha sido exercitada de
verdade. `packages/supabase/tests/migrations.test.ts` também não pegou isso porque só
testa com `buildSeedRows()` (dados de demonstração do mock), e o mock nunca preenche
esses campos opcionais.

## Motivo provável ou causa raiz

Os campos foram adicionados ao tipo `Market`/`Branch`/`Flyer` (em `packages/shared`)
durante o trabalho dos adaptadores de `packages/sources` (Cometa, depois Frangolândia
com geocodificação, depois Super Lagoa) para guardar metadados só de dados
**importados de fontes reais** (site oficial, se a coordenada é aproximada, encarte com
descrição/capa/URL de origem). Como o app sempre rodou em modo mock ou com o retrato
local (`regional.json`) até agora — nunca contra um Supabase de verdade — ninguém
precisou gravar esses campos numa tabela real, e a migration correspondente nunca foi
criada. Deriva de schema silenciosa: o tipo TypeScript e o schema SQL do Postgres
andaram desalinhados sem nenhum teste que cobrisse os dois ao mesmo tempo com dados
reais.

## Correção aplicada

Nova migration `packages/supabase/migrations/0004_source_metadata.sql`: adiciona
`markets.website_url` (text, nullable), `markets.coordinates_approximate` (boolean,
default false), `branches.coordinates_approximate` (boolean, default false),
`flyers.description`/`flyers.cover_url`/`flyers.source_url` (text, nullable). Todas as
colunas são opcionais ou têm default, então não quebram nenhuma política de RLS
existente nem exigem backfill.

## Como foi validado

Novo teste em `packages/supabase/tests/migrations.test.ts`
("metadados de importação (0004)") insere linhas reais em `markets`/`branches`/
`flyers` usando esses campos e confirma que o valor volta certo na leitura —
`pnpm --filter @budega/supabase test` (20/20, antes eram 19). Migration também aplicada
de verdade contra o projeto Supabase real do usuário
(`pnpm --filter @budega/supabase migrate`, com `DATABASE_URL` configurada) antes de
rodar qualquer sincronização de dados reais.

## Como evitar a repetição

Regra para qualquer campo novo em `Market`/`Branch`/`Flyer`/`Offer` (packages/shared):
se o campo pode ser gravado num Supabase real (não só lido do mock/regional.json),
precisa de uma migration correspondente **no mesmo ciclo** em que o campo é adicionado
ao tipo, com um teste que insira uma linha real usando esse campo — não basta o teste
de RLS com `buildSeedRows()`, que só cobre os campos que o mock preenche.

## Aprendizado reutilizável

Um tipo TypeScript compartilhado (`packages/shared`) e o schema SQL que ele deveria
espelhar (`packages/supabase/migrations`) podem divergir silenciosamente enquanto nunca
houver um teste ou execução real que grave TODOS os campos do tipo no banco. Antes de
escrever qualquer script que grave dados de um tipo do `packages/shared` num Supabase
real pela primeira vez, comparar campo a campo o tipo TypeScript contra o `create table`
da migration mais recente daquela tabela.
