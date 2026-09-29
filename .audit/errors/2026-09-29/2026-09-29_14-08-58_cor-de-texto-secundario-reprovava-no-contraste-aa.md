# Erro — cor de texto secundario reprovava no contraste aa

- Data e hora: 2026-09-29 14:08:58 -03:00
- Agente/responsável: Claude Code
- Ambiente: web | Android | iPhone
- Comando ou ação que gerou o erro: cálculo de contraste (fórmula WCAG) ao revisar a cor das abas do app
- Status: corrigido
- Severidade: média (acessibilidade — o DESIGN.md exige AA)

## Mensagem completa do erro

```
neutral-500 x branco: 3.76 | warning x branco: 3.22   (mínimo AA para texto normal: 4.5)
```

## Sintoma

O token `neutral-500` (#8A8375), definido no DESIGN.md como "texto secundário" e usado em
centenas de textos (descrições, datas, endereços) na web e no app, não atingia o contraste
mínimo que o próprio DESIGN.md exige. A mensagem de erro de localização da home usava
`text-warning` (3,2:1).

## Motivo provável ou causa raiz

Confirmada: a paleta foi definida sem medir o contraste do token de texto secundário.

## Correção aplicada

- Token trocado para `#706A5F` (mesmo matiz, mais escuro): 5,36:1 no branco, 5,06:1 no
  `neutral-50`, 4,56:1 no `neutral-100` — em `apps/web/src/app/globals.css`,
  `apps/mobile/tailwind.config.js`, cores literais do app e DESIGN.md.
- Abas inativas do app em `neutral-700` (9,4:1).
- Mensagem da home em `neutral-900`; DESIGN.md avisa que `warning` não serve para texto.

## Como foi validado

Cálculo de contraste; `pnpm typecheck`/`lint`/`test` e e2e 52/52.

## Como evitar a repetição

Regra no DESIGN.md: calcular o contraste de qualquer cor nova antes de usá-la em texto.

## Aprendizado reutilizável

Token de design reprovado contamina a interface inteira — corrija no token, não em cada uso.
