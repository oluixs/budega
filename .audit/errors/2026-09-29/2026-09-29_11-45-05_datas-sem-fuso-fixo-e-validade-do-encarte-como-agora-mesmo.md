# Erro — datas sem fuso fixo e validade do encarte como agora mesmo

- Data e hora: 2026-09-29 11:45:05 -03:00
- Agente/responsável: Claude Code
- Ambiente: web | Android | iPhone
- Comando ou ação que gerou o erro: revisão visual da screenshot de `/mercados/bom-preco-pinheiros` no celular
- Status: corrigido
- Severidade: média

## Mensagem completa do erro

Texto na tela: "Ofertas da Semana - Bom Preço Pinheiros — **Válido até agora mesmo**"
(encarte ativo, com validade futura).

## Sintoma

1. A validade do encarte atual aparecia como "agora mesmo".
2. (Latente) `formatDateBR` formatava no fuso de quem renderiza: num servidor UTC
   (Vercel), uma validade às 23h de Brasília apareceria como o dia seguinte, e o
   navegador mostraria outro dia — texto errado + erro de hidratação.

## Motivo provável ou causa raiz

1. A página do mercado usava `formatRelativeUpdate()` (feito para "atualizado há X",
   datas passadas) numa data futura; diferença negativa → "agora mesmo".
2. `Intl.DateTimeFormat` sem `timeZone`.

## Correção aplicada

- `mercados/[slug]/page.tsx`: validade com `formatDateBR`.
- `packages/shared/src/business/format.ts`: `APP_TIME_ZONE = "America/Sao_Paulo"` fixo em
  `formatDateBR`.

## Como foi validado

`format.test.ts`: `2026-10-10T02:00Z` → `09/10/2026` em qualquer fuso de máquina.

## Como evitar a repetição

Datas exibidas usam sempre `formatDateBR` (fuso fixo); `formatRelativeUpdate` é só para
"atualizado há".

## Aprendizado reutilizável

Formatação de data sem fuso explícito é bug esperando o deploy num servidor em UTC.
