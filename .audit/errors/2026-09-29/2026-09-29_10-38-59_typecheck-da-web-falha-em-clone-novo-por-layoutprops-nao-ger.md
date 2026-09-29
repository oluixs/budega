# Erro — typecheck da web falha em clone novo por LayoutProps nao gerado

- Data e hora: 2026-09-29 10:38:59 -03:00
- Agente/responsável: Claude Code
- Ambiente: web
- Comando ou ação que gerou o erro: `pnpm typecheck` logo após `git clone` + `pnpm install` numa máquina nova
- Status: corrigido
- Severidade: média

## Mensagem completa do erro

```
src/app/layout.tsx(31,50): error TS2304: Cannot find name 'LayoutProps'.
Failed:    @budega/web#typecheck
```

## Sintoma

Em um clone limpo do repositório, `pnpm typecheck` falhava só em `@budega/web`, embora
o registro de push anterior dizia que o typecheck passava.

## Motivo provável ou causa raiz

Confirmada: `LayoutProps`/`PageProps` são tipos globais que o Next.js 16 **gera** em
`.next/types` (e `next-env.d.ts`) durante `next dev`/`next build`. As duas coisas estão
no `.gitignore`. Na máquina original o `.next/` já existia por causa de builds
anteriores, então `tsc --noEmit` achava os tipos; num clone novo eles não existem.

## Correção aplicada

`apps/web/package.json`: script `typecheck` passou de `tsc --noEmit` para
`next typegen && tsc --noEmit`. `next typegen` gera só as definições de tipos de rotas,
sem fazer um build completo (~2s).

## Como foi validado

`rm -rf apps/web/.next && pnpm typecheck` → 4/4 pacotes passando.

## Como evitar a repetição

O script de typecheck agora é autossuficiente. Ao validar o monorepo antes de um
commit, prefira fazê-lo a partir de um estado limpo (sem `.next/`) para não mascarar
dependências de artefatos gerados.

## Aprendizado reutilizável

Nunca assuma que um comando que passa na máquina de desenvolvimento passa num clone
novo: qualquer tipo/arquivo gerado (`.next/types`, `next-env.d.ts`, `expo-env.d.ts`)
precisa ser gerado pelo próprio script que depende dele.
