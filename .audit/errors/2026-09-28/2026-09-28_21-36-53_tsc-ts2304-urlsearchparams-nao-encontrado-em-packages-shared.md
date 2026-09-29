# Erro — tsc TS2304 URLSearchParams nao encontrado em packages/shared

- Data e hora: 2026-09-28 21:36:53 -03:00
- Agente/responsável: Claude Code
- Ambiente: backend (na verdade: `packages/shared`, consumido por web/Android/iPhone)
- Comando ou ação que gerou o erro: `pnpm --filter @budega/shared exec tsc --noEmit`
- Status: corrigido
- Severidade: baixa

## Mensagem completa do erro

```
src/business/links.ts(27,22): error TS2304: Cannot find name 'URLSearchParams'.
```

## Sintoma

O typecheck do pacote `@budega/shared` falhava ao compilar `buildExternalRouteUrl` em
`src/business/links.ts`, que usa `new URLSearchParams(...)` para montar a URL de rota do
Google Maps.

## Motivo provável ou causa raiz

O `tsconfig.json` de `packages/shared` tinha `"lib": ["ES2022"]` apenas, sem `"DOM"`.
`URLSearchParams` é um global de ambiente (browser/Node/React Native com polyfill), não
faz parte da lib `ES2022` pura do TypeScript, então o compilador não reconhecia o tipo
mesmo o runtime tendo o objeto disponível.

## Correção aplicada

Adicionado `"DOM"` à lista `lib` em `packages/shared/tsconfig.json`
(`"lib": ["ES2022", "DOM"]`). Como `packages/shared` é consumido tanto pela web quanto
pelo app mobile (que também tem `URLSearchParams` disponível via runtime/polyfill do
Hermes/JSC), isso é seguro — o pacote não deve importar APIs de DOM que não existem fora
do browser (ex.: `document`, `window`), apenas usar tipos de globais amplamente
disponíveis como `URLSearchParams`, `fetch`, `Intl`.

## Como foi validado

`pnpm --filter @budega/shared exec tsc --noEmit` passou sem erros após a mudança.
`pnpm --filter @budega/shared test` continuou com os 29 testes passando.

## Como evitar a repetição

Ao criar código em `packages/shared` que usa uma API global (não específica de
Node/browser/RN), sempre rodar `tsc --noEmit` localmente antes de considerar a função
pronta — não assumir que um global "óbvio" está coberto só por `ES2022`. Se algum dia o
pacote precisar rodar em um ambiente sem `URLSearchParams` (não é o caso hoje), isolar
essa função com um import de polyfill explícito em vez de depender do global.

## Aprendizado reutilizável

Em `packages/shared`, sempre incluir `"DOM"` na lib do `tsconfig.json` (além de
`ES2022`) porque o pacote é consumido por ambientes com WHATWG globals (browser e React
Native), mesmo sendo um pacote "isomórfico" sem imports de DOM propriamente ditos.
