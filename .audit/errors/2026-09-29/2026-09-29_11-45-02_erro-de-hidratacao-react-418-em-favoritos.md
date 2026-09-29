# Erro — erro de hidratacao react 418 em favoritos

- Data e hora: 2026-09-29 11:45:02 -03:00
- Agente/responsável: Claude Code
- Ambiente: web
- Comando ou ação que gerou o erro: `pnpm --filter @budega/web test:e2e` (Playwright, primeira execução num navegador real)
- Status: corrigido
- Severidade: média

## Mensagem completa do erro

```
Minified React error #418; visit https://react.dev/errors/418?args[]=HTML&args[]= for the full message
```

(em `/favoritos` e em toda página com botão de favoritar)

## Sintoma

O HTML do servidor e o 1º render do cliente divergiam; o React descartava o HTML do
servidor e renderizava tudo de novo no navegador (piscada de conteúdo e trabalho extra).

## Motivo provável ou causa raiz

Confirmada: `useFavorites()` definia `hydrated = typeof window !== "undefined"`. No
servidor era `false` (skeleton / "Adicionar aos favoritos"); no 1º render do cliente já
era `true` (lista ou estado vazio / rótulo diferente), antes da hidratação terminar.

## Correção aplicada

`apps/web/src/hooks/use-favorites.ts`: `hydrated` vem de
`useSyncExternalStore(noopSubscribe, () => true, () => false)` — o React usa o valor do
servidor durante a hidratação e só depois troca para `true`.

## Como foi validado

`e2e/fixtures.ts` falha qualquer teste que registre erro de console; `/favoritos` e o
fluxo de favoritar passam em desktop e celular.

## Como evitar a repetição

Os testes e2e agora reprovam qualquer erro de console (inclui hidratação). Nunca use
`typeof window` para decidir o que renderizar em componente que também roda no servidor.

## Aprendizado reutilizável

Build, typecheck e testes em jsdom não detectam erro de hidratação — só um navegador de
verdade renderizando o HTML do servidor detecta.
