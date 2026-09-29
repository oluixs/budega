# Registro de mudança — mapa interativo com leaflet e openstreetmap

- Data e hora: 2026-09-29 12:49:52 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: ba9d109 (base)
- Tipo: feature
- Status: concluída na web; mobile pendente

## O que foi alterado

- Dependências da web: `leaflet`, `react-leaflet` (v5, React 19), `@types/leaflet`.
- `components/map/markets-map.tsx` (carrega com `ssr: false` e skeleton) e
  `markets-map-inner.tsx`: tiles do OpenStreetMap com atribuição visível, marcadores em
  HTML/CSS com as cores da marca, popup com "Ver mercado" e "Como chegar", marcador da
  posição do usuário e ajuste automático do zoom aos pontos.
- `/explorar?view=mapa`: um ponto por **loja** dos mercados filtrados + lista acessível
  abaixo (`MapFallback`, texto atualizado — antes dizia que faltava chave do Google).
- Página do mercado: `BranchesSection` com mapa das lojas e lista recolhível.
- Variáveis opcionais: `NEXT_PUBLIC_MAP_TILE_URL` e `NEXT_PUBLIC_MAP_ATTRIBUTION`.

## Motivo

O usuário não tem chave do Google Maps; pediu um jeito de ter o mapa interativo.

## Impacto

- Sem custo e sem chave. A política de uso dos tiles do OpenStreetMap pede atribuição e
  uso moderado; com tráfego alto, trocar por um provedor (MapTiler, Stadia, etc.) pelas
  variáveis acima.
- O IP do visitante é enviado aos servidores de tiles — informado na Política de Privacidade.

## Validação executada

- Screenshots em modo regional: 43 lojas no mapa (Fortaleza, Maracanaú, Eusébio).
- e2e "mapa interativo mostra os mercados com a lista acessível abaixo".

## Pendências e riscos

- App mobile ainda sem mapa (próxima etapa).
