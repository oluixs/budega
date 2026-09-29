import { createHash } from "node:crypto";
import { mock } from "@budega/shared";

/**
 * Os IDs do mock (ex.: "mkt-bompreco-pinheiros") são legíveis, mas a coluna `id` do
 * Postgres é `uuid`. Convertemos cada slug para um UUID determinístico (mesmo slug ⇒
 * sempre o mesmo UUID), preservando as relações de chave estrangeira entre as tabelas.
 */
export function toUuid(slug: string): string {
  const hash = createHash("md5").update(slug).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

/**
 * Linhas do seed, já no formato das tabelas. Compartilhado entre scripts/run-seed.ts e
 * tests/migrations.test.ts (que garante que os dados de demonstração cabem no schema).
 */
export function buildSeedRows() {
  const { mockBranches, mockCategories, mockFlyers, mockMarkets, mockOffers } = mock;

  return {
    categories: mockCategories.map(({ id, name, slug, icon, sort_order, created_at }) => ({
      id: toUuid(id),
      name,
      slug,
      icon,
      sort_order,
      created_at,
    })),
    markets: mockMarkets.map((market) => ({
      ...market,
      id: toUuid(market.id),
      owner_id: null,
    })),
    branches: mockBranches.map((branch) => ({
      ...branch,
      id: toUuid(branch.id),
      market_id: toUuid(branch.market_id),
    })),
    flyers: mockFlyers.map((flyer) => ({
      ...flyer,
      id: toUuid(flyer.id),
      market_id: toUuid(flyer.market_id),
      branch_id: flyer.branch_id ? toUuid(flyer.branch_id) : null,
    })),
    offers: mockOffers.map((offer) => ({
      ...offer,
      id: toUuid(offer.id),
      market_id: toUuid(offer.market_id),
      branch_id: offer.branch_id ? toUuid(offer.branch_id) : null,
      category_id: toUuid(offer.category_id),
    })),
  };
}
