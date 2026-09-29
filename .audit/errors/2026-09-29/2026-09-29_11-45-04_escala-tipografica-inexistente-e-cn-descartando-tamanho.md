# Erro — escala tipografica inexistente e cn descartando tamanho

- Data e hora: 2026-09-29 11:45:04 -03:00
- Agente/responsável: Claude Code
- Ambiente: web
- Comando ou ação que gerou o erro: revisão visual das screenshots do Playwright (`test-results/screens/`)
- Status: corrigido
- Severidade: média (design)

## Mensagem completa do erro

Sem mensagem. Visualmente: o título da home ("Os melhores mercados…") e os títulos de
seção saíam do mesmo tamanho do texto comum. Depois de corrigir o CSS,
`cn("text-body text-neutral-500")` retornava `"text-neutral-500"`.

## Sintoma

Página sem hierarquia visual — o oposto do DESIGN.md (display 36–44px, h1 28–32px, h2
22–24px…).

## Motivo provável ou causa raiz

Confirmadas duas causas:

1. `globals.css` nunca definiu `--text-display`, `--text-h1` … `--text-caption` no
   `@theme`. No Tailwind v4 essas classes então não geram CSS — ~130 usos eram no-op.
2. O `cn` (merge de classes) não conhecia esses tamanhos e os tratava como **cor**:
   ao combinar com `text-neutral-500`, descartava o tamanho.

## Correção aplicada

- `globals.css`: escala do DESIGN.md como `--text-*` (com `--line-height`), usando
  `clamp()` para display/h1/h2.
- `lib/utils.ts`: `cn = createCn({ extend: { classGroups: { "font-size": [...] } } })`.

## Como foi validado

- `src/lib/cn.test.ts` (tamanho + cor convivem; dois tamanhos → o último vence).
- Screenshots novas mostram a hierarquia esperada.

## Como evitar a repetição

Todo token novo de tipografia precisa ser adicionado nos dois lugares (`@theme` e `cn`);
comentário nos dois arquivos aponta para o outro.

## Aprendizado reutilizável

Tailwind v4 não avisa sobre classe desconhecida — confira na tela (ou no CSS gerado)
que um token customizado realmente existe.
