# Erro — loja mais proxima ignorada em empate com o endereco principal

- Data e hora: 2026-09-29 14:08:57 -03:00
- Agente/responsável: Claude Code
- Ambiente: web | Android | iPhone
- Comando ou ação que gerou o erro: screenshot da busca do app com localização ao lado da loja Ildefonso Albano
- Status: corrigido
- Severidade: baixa

## Mensagem completa do erro

Card mostrava "Aldeota, Fortaleza — 6 m" em vez de "Mais perto: Cometa Ildefonso Albano".

## Sintoma

Quando a loja mais próxima era a própria loja usada como endereço principal do mercado, o
card não dizia qual loja era.

## Motivo provável ou causa raiz

Confirmada: `withDistance` só trocava para a filial se ela fosse **estritamente** mais
próxima que o endereço do mercado; como o endereço principal do Cometa é a loja nº 1,
havia empate e `nearest_branch` ficava `null`.

## Correção aplicada

Em empate com o endereço principal, a filial vence (`packages/shared/src/business/distance.ts`).

## Como foi validado

Teste "em empate com o endereço principal, informa a loja" (`distance.test.ts`); screenshot
do app mostra "Mais perto: Cometa Ildefonso Albano — 6 m".

## Como evitar a repetição

Teste de regressão acima.

## Aprendizado reutilizável

Ao escolher "o melhor" entre candidatos, pense no empate — é o caso comum quando um dado é
cópia de outro.
