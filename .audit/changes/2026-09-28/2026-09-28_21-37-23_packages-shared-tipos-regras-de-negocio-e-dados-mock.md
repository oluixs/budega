# Registro de mudança — packages-shared tipos regras de negocio e dados mock

- Data e hora: 2026-09-28 21:37:22 -03:00
- Agente/responsável: Claude Code
- Branch: master
- Commit: 3b40807
- Tipo: feature
- Status: concluída

## O que foi alterado

Criado o pacote `packages/shared` (`@budega/shared`), consumido por `apps/web` e
`apps/mobile`:
- `src/types/index.ts`: tipos TS de `Profile`, `Market`, `Branch`, `Category`, `Flyer`,
  `Offer`, `Favorite`, `Report`, `AnalyticsEvent`, `MarketWithDistance`, `Coordinates`,
  espelhando o modelo de dados da seção 8 do brief.
- `src/schemas/index.ts`: schemas Zod para formulários (mercado, filial, encarte,
  oferta, denúncia, busca por localização, login/cadastro) e `validateUpload` (tipo e
  tamanho de arquivo).
- `src/business/distance.ts`: `calculateDistanceKm` (Haversine), `formatDistance`,
  `withDistance`, `sortMarkets` (por distância ou relevância).
- `src/business/validity.ts`: `isOfferActive`, `isFlyerActive`, `filterActiveOffers`,
  `filterActiveFlyers`, `canPublishOffer`, `isExpiringSoon`.
- `src/business/favorites.ts`: favoritos locais/anônimos (`addLocalFavorite`,
  `removeLocalFavorite`, `toggleLocalFavorite`, `mergeFavorites`).
- `src/business/links.ts`: `buildMarketShareUrl`/`buildOfferShareUrl` (compartilhamento),
  `buildMarketDeepLink`/`buildOfferDeepLink`, `buildExternalRouteUrl` (Google Maps),
  `buildWhatsAppUrl`.
- `src/business/format.ts`: formatação de preço em BRL, percentual de desconto, datas
  relativas em pt-BR.
- `src/mock/*`: dados de demonstração (8 mercados, 10 filiais, 6 categorias, 30 ofertas
  — 4 delas vencidas de propósito —, 8 encartes — 4 vigentes, 2 arquivados, 2 pausados).
  Datas geradas relativas a "agora" (`daysFromNow`) para nunca ficarem obsoletas.
- 29 testes automatizados (Vitest) cobrindo distância, ordenação, validade de
  ofertas/encartes, favoritos locais/merge e validação de formulários (oferta/encarte).

## Motivo

`packages/shared` é a peça central da arquitetura pedida pelo brief: tipos, validações e
regras de negócio compartilhadas entre web e mobile, para que as duas plataformas nunca
divirjam sobre o que é "oferta vencida" ou "distância", por exemplo.

## Impacto

- Nenhum impacto em produção ainda (pacote ainda não consumido por nenhum app).
- Define o contrato de dados que `apps/web`, `apps/mobile` e as migrations do Supabase
  (`packages/supabase`, próxima etapa) vão seguir.

## Validação executada

- `pnpm --filter @budega/shared test` → 29/29 testes passando.
- `pnpm --filter @budega/shared exec tsc --noEmit` → sem erros (após corrigir o erro
  TS2304 registrado em `.audit/errors/2026-09-28/..._tsc-ts2304-urlsearchparams...md`).

## Pendências e riscos

- Nenhum consumidor real ainda — o risco de tipos "errados" só será confirmado quando
  `apps/web` e `packages/supabase` (migrations) forem implementados e tiverem que bater
  exatamente com estes tipos.
- ESLint ainda não configurado no monorepo (script `lint` existe mas não há config
  ainda) — pendente para a Fase 5.
