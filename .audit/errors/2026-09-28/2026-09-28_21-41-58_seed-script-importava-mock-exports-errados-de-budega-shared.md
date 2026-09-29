# Erro — seed script importava mock exports errados de budega-shared

- Data e hora: 2026-09-28 21:41:58 -03:00
- Agente/responsável: Claude Code
- Ambiente: Supabase (script local `packages/supabase/scripts/run-seed.ts`)
- Comando ou ação que gerou o erro: `pnpm --filter @budega/supabase seed`
- Status: corrigido
- Severidade: baixa

## Mensagem completa do erro

```
SyntaxError: The requested module '@budega/shared' does not provide an export named 'mockBranches'
    at #asyncInstantiate (node:internal/modules/esm/module_job:327:21)
```

## Sintoma

Rodar `pnpm --filter @budega/supabase seed` falhava imediatamente ao importar
`mockBranches`, `mockCategories`, etc. diretamente de `"@budega/shared"`.

## Motivo provável ou causa raiz

`packages/shared/src/index.ts` reexporta o módulo de mock como um namespace:
`export * as mock from "./mock/index.js"` — de propósito, para não poluir o barrel
principal com dezenas de nomes de dados de demonstração. O script de seed foi escrito
assumindo (incorretamente) que `mockBranches` etc. eram exports de nível superior do
pacote, em vez de propriedades do objeto `mock`.

## Correção aplicada

Alterado `packages/supabase/scripts/run-seed.ts` para importar `{ mock }` e depois
desestruturar `const { mockBranches, mockCategories, mockFlyers, mockMarkets,
mockOffers } = mock;`.

## Como foi validado

`pnpm --filter @budega/supabase seed` (sem `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`
configuradas) agora executa até o fim e imprime as instruções de configuração, saindo
com código 0 em vez de lançar `SyntaxError`.

## Como evitar a repetição

Ao escrever um novo script/consumidor de `@budega/shared`, verificar a forma real do
barrel (`packages/shared/src/index.ts`) antes de assumir quais nomes são exports diretos
— os dados de mock especificamente vivem sob o namespace `mock`, não no nível superior.

## Aprendizado reutilizável

Dados de demonstração de `@budega/shared` sempre se importam como
`import { mock } from "@budega/shared"` e depois `mock.mockMarkets`,
`mock.mockOffers`, etc. — nunca como export nomeado direto do pacote.
