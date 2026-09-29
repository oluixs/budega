# Erro — filtro de preco implausivel deixava passar virgula perdida

- Data e hora: 2026-09-29 14:29:27 -03:00
- Agente/responsável: Claude Code
- Ambiente: backend (packages/sources — leitura de ofertas dos encartes)
- Comando ou ação que gerou o erro: `npx vitest run` em `packages/sources` (teste de `extractOffersFromFlyer`)
- Status: corrigido (antes de ir ao ar)
- Severidade: média

## Mensagem completa do erro

```
extractOffersFromFlyer > transforma a leitura em ofertas do encarte...
→ expected 1 to be 2 // Object.is equality   (descartadas)
```

## Sintoma

Um açúcar de "2,79" lido como **279** passava pela validação e seria publicado a R$ 279.

## Motivo provável ou causa raiz

Confirmada: a primeira versão só descartava preço acima de R$ 5.000 — frouxo demais para
mercearia. (Na primeira correção eu ainda troquei o valor do teste para 2790, o que deixava o
caso real sem cobertura; percebido e desfeito na revisão.)

## Correção aplicada

`packages/sources/src/offers/extract.ts`: em alimentos, bebidas, hortifrúti, carnes e padaria,
preço acima de R$ 500 **ou** inteiro a partir de R$ 100 (sem centavos) é descartado; demais
categorias (ex.: eletro do Cometa Presentes) só acima de R$ 10.000.

## Como foi validado

Teste com o valor real (279 em "alimentos" → descartado; ventilador a 279 em outra categoria
→ mantido). 37/37 em `packages/sources`.

## Como evitar a repetição

Teste de validação usa o erro **real** que se quer pegar; nunca ajustar o dado do teste para
o código passar.

## Aprendizado reutilizável

Se um teste falha, primeiro pergunte se o código está errado — mudar o teste para caber no
código esconde exatamente o bug que o teste existia para pegar.
