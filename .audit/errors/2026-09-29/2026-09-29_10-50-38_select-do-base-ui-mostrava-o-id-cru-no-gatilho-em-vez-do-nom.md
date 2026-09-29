# Erro — select do base ui mostrava o id cru no gatilho em vez do nome

- Data e hora: 2026-09-29 10:50:38 -03:00
- Agente/responsável: Claude Code
- Ambiente: web
- Comando ou ação que gerou o erro: leitura do código de `@base-ui/react@1.8.0` (`select/value/SelectValue.js` e `internals/resolveValueLabel.js`) ao escrever o filtro de mercado da tela de filiais
- Status: corrigido
- Severidade: média

## Mensagem completa do erro

Sem mensagem de erro — defeito visual. `resolveSelectedLabel(value, items)` cai em
`stringifyAsLabel(value)` quando o `Select.Root` não recebe `items`, ou seja, o gatilho
exibe o próprio `value`.

## Sintoma

Depois de escolher uma opção, o gatilho do select mostrava o valor interno em vez do
rótulo:

- `/admin/ofertas` e `/admin/encartes`: "mkt-bompreco-pinheiros" / "cat-alimentos" (ou
  um UUID no Supabase real) no lugar do nome do mercado/categoria;
- diálogo público "Denunciar" (web): "preco_incorreto" em vez de "Preço incorreto".

## Motivo provável ou causa raiz

Confirmada: diferente do Radix (base do shadcn clássico), o `Select.Value` do Base UI
(style `base-nova`) não lê o texto do `SelectItem` selecionado; ele resolve o rótulo a
partir da prop `items` do `Select.Root` (array `{value,label}` ou mapa `valor → rótulo`).
Nenhum uso no projeto passava `items`.

## Correção aplicada

Passado `items` (mapa `id → nome`) em todos os `Select` da web:
`offer-form-dialog.tsx` (mercado e categoria), `flyer-form-dialog.tsx`,
`branch-form-dialog.tsx`, `branches-table.tsx` (filtro) e `report-dialog.tsx`
(`REASON_LABELS`).

## Como foi validado

- Teste "o filtro de mercado mostra o rótulo, não o valor cru do Select" em
  `branches-table.test.tsx`.
- HTML servido por `next start` em `/admin/filiais` contém "Todos os mercados" no gatilho.
- `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm build:web` passando.

## Como evitar a repetição

Todo `<Select>` novo na web precisa receber `items`. Regra adicionada em `CLAUDE.md` junto
com a regra da prop `render`.

## Aprendizado reutilizável

No shadcn `base-nova` (Base UI), `<Select>` sem `items` exibe o valor cru — sempre passe
`items={{ [valor]: rótulo }}` no `Select`.
