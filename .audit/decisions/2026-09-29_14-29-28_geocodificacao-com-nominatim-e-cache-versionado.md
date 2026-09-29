# Decisão — geocodificação com Nominatim e cache versionado

- Data e hora: 2026-09-29 14:29:28 -03:00
- Agente/responsável: Claude Code
- Status: adotada

## Contexto

O site da Frangolândia publica endereço, telefone e horário das lojas, mas não coordenadas
(o "Como chegar" é uma busca no Google). Sem coordenadas, as lojas não entram no mapa nem
na distância.

## Decisão

Geocodificar os endereços com o **Nominatim** (OpenStreetMap), só no `pnpm importar`, com
cache versionado em `packages/sources/src/data/geocode-cache.json`. O site e o app usam
apenas o cache (nunca consultam o Nominatim).

## Por que é permitido

- O `robots.txt` do Nominatim proíbe `/search` para robôs de **rastreamento**. O uso da API é
  regido pela política https://operations.osmfoundation.org/policies/nominatim/, que o
  permite com regras, todas atendidas: no máximo 1 requisição/s e uma por vez
  (`createNominatimGeocoder`), app identificado (User-Agent BudegaBot), **cache
  obrigatório** (cada endereço é consultado uma única vez, inclusive os não encontrados),
  volume pequeno (~25 endereços), nada de autocompletar no cliente, atribuição
  "© OpenStreetMap" exibida no mapa.
- Por isso o geocodificador usa `fetch` direto, e não o cliente que aplica o robots.txt —
  essa exceção vale só para esta API documentada.

## Consequências

- Coordenadas podem ficar a algumas centenas de metros: lojas geocodificadas levam
  `coordinates_approximate: true` e a rota ("Como chegar") usa o endereço em texto
  (`buildPlaceRouteUrl`).
- Endereço não encontrado → loja fica fora (aviso no log). Hoje: Frangolândia Trairi.
- Erros de digitação conhecidos da fonte são corrigidos antes (`ADDRESS_FIXES`).

## Alternativas descartadas

- Google Geocoding API: exige chave e cobrança (o usuário não tem chave do Google).
- Seguir os links curtos do Google Maps do site: seria raspar o Google.
