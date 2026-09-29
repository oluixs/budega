import "server-only";
import { cache } from "react";
import {
  mock,
  regionalSnapshot,
  type Branch,
  type Category,
  type Flyer,
  type Market,
  type Offer,
  type RegionalData,
} from "@budega/shared";
import { createHttpClient, importRegional } from "@budega/sources";

/**
 * Dados usados quando não há Supabase configurado.
 *
 * - "regional" (padrão): mercados, lojas e encartes REAIS da região, importados dos sites
 *   oficiais das redes (packages/sources). O servidor atualiza sozinho — as respostas dos
 *   sites ficam em cache por 1 hora — e, se um site falhar, usa o último retrato salvo
 *   (packages/shared/src/data/regional.json, gerado por `pnpm importar`).
 * - "demo": os dados fictícios de packages/shared/src/mock (usados pelos testes e2e,
 *   que não podem depender de sites externos). Ative com BUDEGA_DADOS=demo.
 */

export interface LocalData {
  mode: "regional" | "demo";
  markets: Market[];
  branches: Branch[];
  flyers: Flyer[];
  offers: Offer[];
  categories: Category[];
  sources: RegionalData["sources"];
  generatedAt: string | null;
}

export const dataMode: LocalData["mode"] = process.env.BUDEGA_DADOS === "demo" ? "demo" : "regional";

const REFRESH_SECONDS = 60 * 60;

async function loadRegional(): Promise<RegionalData> {
  try {
    return await importRegional({
      http: createHttpClient({ requestInit: { next: { revalidate: REFRESH_SECONDS } } }),
      previous: regionalSnapshot,
    });
  } catch {
    return regionalSnapshot;
  }
}

/** Uma vez por request (React `cache`); os sites em si ficam no cache de fetch do Next. */
export const getLocalData = cache(async (): Promise<LocalData> => {
  if (dataMode === "demo") {
    return {
      mode: "demo",
      markets: mock.mockMarkets,
      branches: mock.mockBranches,
      flyers: mock.mockFlyers,
      offers: mock.mockOffers,
      categories: mock.mockCategories,
      sources: [],
      generatedAt: null,
    };
  }

  const regional = await loadRegional();
  return {
    mode: "regional",
    markets: regional.markets,
    branches: regional.branches,
    flyers: regional.flyers,
    offers: regional.offers,
    // As categorias são fixas do Budega (não vêm dos mercados).
    categories: mock.mockCategories,
    sources: regional.sources,
    generatedAt: regional.generated_at,
  };
});
