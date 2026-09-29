# Erro — rota do google maps com nome no lugar do place id

- Data e hora: 2026-09-29 14:08:56 -03:00
- Agente/responsável: Claude Code
- Ambiente: web | Android | iPhone
- Comando ou ação que gerou o erro: leitura de `packages/shared/src/business/links.ts`
- Status: corrigido
- Severidade: média

## Mensagem completa do erro

Sem mensagem. `buildExternalRouteUrl` gerava
`https://www.google.com/maps/dir/?api=1&destination=-3.74,-38.51&destination_place_id=Cometa+Ildefonso+Albano`.

## Sintoma

Todo botão "Rota"/"Como chegar" (web e app) mandava o nome da loja em
`destination_place_id`, parâmetro que o Google Maps só aceita com um **Place ID** (código
do Google). Com texto livre, o Maps pode ignorar o parâmetro ou errar o destino.

## Motivo provável ou causa raiz

Confirmada: uso incorreto do parâmetro da API de URLs do Google Maps.

## Correção aplicada

`buildExternalRouteUrl(latitude, longitude)` — só as coordenadas; parâmetro do nome
removido e as 11 chamadas ajustadas (web e mobile).

## Como foi validado

`packages/shared/src/business/links.test.ts` (sem `destination_place_id`; destino =
coordenadas). `pnpm typecheck` nos 5 pacotes.

## Como evitar a repetição

Teste de regressão acima. Parâmetro de API externa: conferir o formato esperado na
documentação antes de preencher.

## Aprendizado reutilizável

"place_id" é um identificador, não um rótulo — nomes de parâmetros parecidos com o que
queremos exibir enganam.
