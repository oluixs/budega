# Erro — Turbopack nao resolve imports relativos com extensao .js apontando para .ts em pacotes do workspace

- Data e hora: 2026-09-28 22:04:18 -03:00
- Agente/responsável: Claude Code
- Ambiente: web (apps/web, Next.js 16.3.6 com Turbopack), afeta packages/shared e packages/supabase
- Comando ou ação que gerou o erro: `pnpm --filter @budega/web build` (primeira vez que um app realmente importou `@budega/shared`/`@budega/supabase` via bundler, em vez de só `tsc`/`vitest`)
- Status: corrigido
- Severidade: alta (bloqueava completamente o build/execução da web; teria bloqueado o mobile também, que consome o mesmo pacote)

## Mensagem completa do erro

Resumo das mensagens (várias, uma por export ausente — texto completo nos logs desta
sessão, omitido aqui por repetição):

```
Error: Export isFavorited doesn't exist in target module
The export isFavorited was not found in module [project]/packages/shared/src/index.ts [app-client] (ecmascript).
Did you mean to import mock?
...
Error: Module not found: Can't resolve './schemas/index.js'
...
Error: Export createSupabaseConnection doesn't exist in target module
The module has no exports at all.
```

## Sintoma

`pnpm --filter @budega/shared exec tsc --noEmit` e `pnpm --filter @budega/shared test`
(Vitest) sempre passaram limpos. Mas assim que `apps/web` importou `@budega/shared` e
`@budega/supabase` de verdade (via `next build`, Turbopack), vários exports "sumiam" —
primeiro pareceu ser só `isFavorited`/`toggleLocalFavorite`; ao tentar "corrigir" isso
trocando `export *` por um export nomeado explícito só para favorites, o erro só migrou
para outros exports (`formatDistance`, `formatPriceBRL`, etc.). Isso indicava que o
diagnóstico inicial ("bug específico de `export *` com favorites") estava errado — era
um sintoma parcial de um problema maior, mascarado porque o log completo excedia o
`Select-Object -Last N` usado para capturar a saída do build.

## Motivo provável ou causa raiz

Causa raiz real: todos os imports relativos dentro de `packages/shared/src` e
`packages/supabase/src` usavam extensão `.js` apontando para arquivos `.ts` (ex.:
`import type { Market } from "../types/index.js"`), seguindo a convenção de Node ESM
"moduleResolution: Bundler" do TypeScript — que o `tsc` resolve perfeitamente (é
literalmente o propósito do modo "Bundler"). Só que o **Turbopack do Next.js 16, ao
processar esses pacotes via `transpilePackages`, não remapeia `.js` → `.ts`** nesses
imports relativos: ele tenta resolver `./schemas/index.js` como arquivo literal, não
encontra (só existe `index.ts`), e o módulo de origem acaba sem nenhum export — o que faz
qualquer nome importado dele parecer "ausente" no módulo consumidor (`@budega/shared`
barrel). Como `vitest`/`tsc` nunca passam pelo Turbopack, o problema só aparecia no build
real da web (e apareceria também no mobile/Metro, com sintoma parecido, se não corrigido
na origem).

## Correção aplicada

Removida a extensão `.js` de **todos** os imports/exports relativos dentro de
`packages/shared/src/**` e `packages/supabase/src/**` (script utilitário de uma execução
em `scripts/strip-js-ext.mjs`, escrito e rodado na pasta scratchpad, não commitado — a
mudança em si está nos arquivos do pacote). Também aproveitado para trocar
`packages/shared/src/index.ts` de `export * from "..."` para reexports nomeados
explícitos por módulo — não porque `export *` fosse a causa raiz (não era: a causa raiz
era a extensão `.js`), mas porque exports explícitos deixam erros de resolução futuros
muito mais fáceis de localizar (apontam o nome exato, não "não sei quais exports esse
`*` deveria trazer").

## Como foi validado

- `pnpm --filter @budega/shared test` → 29/29 passando.
- `pnpm --filter @budega/shared exec tsc --noEmit` e `pnpm --filter @budega/supabase exec tsc --noEmit` → sem erros.
- `pnpm --filter @budega/web build` → build de produção completo com sucesso
  (`✓ Compiled successfully`, `✓ Generating static pages`), rota `/` prerenderizada.

## Como evitar a repetição

- **Nunca** usar extensão `.js` em imports/exports relativos dentro de
  `packages/shared` e `packages/supabase` (nem em novos arquivos `.ts` desses pacotes) —
  usar sempre especificador sem extensão (`from "../types/index"`, não
  `from "../types/index.js"`).
- Ao investigar um "export ausente" vindo de um pacote do workspace, **sempre** rodar
  `next build` (não só `tsc`/`vitest`) antes de concluir a causa raiz — o `tsc` sozinho
  não detecta esse tipo de problema porque resolve os arquivos de um jeito
  fundamentalmente diferente do bundler real.
- Ao capturar saída de comandos longos com `Select-Object -Last N`, ter em mente que
  erros importantes podem estar ANTES do corte — se o diagnóstico não fizer sentido
  (ex.: "corrigi X mas agora Y quebrou do mesmo jeito"), suspeitar de truncamento antes de
  formular uma nova hipótese.

## Aprendizado reutilizável

Em `packages/shared` e `packages/supabase`, todo import/export relativo é **sem**
extensão de arquivo (`from "./algo"`), nunca `from "./algo.js"` — mesmo que o `tsc`
aceite `.js` sem reclamar. O `tsc` com `moduleResolution: "Bundler"` remapeia `.js`→`.ts`
para checagem de tipos, mas o **Turbopack do Next.js (usado no build/dev de apps/web)
não faz esse remapeamento** ao transpilar pacotes do workspace via `transpilePackages`,
e silenciosamente trata o módulo de origem como vazio.
