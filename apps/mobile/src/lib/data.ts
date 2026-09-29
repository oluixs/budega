import {
  filterActiveFlyers,
  filterActiveOffers,
  filterByPublicMarkets,
  filterPublicMarkets,
  mock,
  regionalSnapshot,
  type Branch,
  type Category,
  type Flyer,
  type Market,
  type Offer,
  type RegionalData,
} from "@budega/shared";
import { isMock, supabase } from "./supabase";

/**
 * Camada de dados do app mobile — mesma lógica de apps/web/src/lib/data.ts (não dá para
 * compartilhar o arquivo literal porque a web marca o dela com `import "server-only"`).
 *
 * Sem Supabase:
 * - "regional" (padrão): mercados, lojas e encartes reais da região. Se
 *   EXPO_PUBLIC_API_URL apontar para a web publicada, busca lá (dados sempre atuais);
 *   senão — ou se a web não responder — usa o retrato embutido no app
 *   (packages/shared/src/data/regional.json, atualizado por `pnpm importar`).
 * - "demo": dados fictícios (EXPO_PUBLIC_BUDEGA_DADOS=demo).
 *
 * Mercado suspenso some do público com tudo que é dele: no Supabase o RLS já filtra;
 * nos dados locais, os filtros abaixo reproduzem a mesma regra.
 */

const DATA_MODE = process.env.EXPO_PUBLIC_BUDEGA_DADOS === "demo" ? "demo" : "regional";
const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

interface LocalData {
  markets: Market[];
  branches: Branch[];
  flyers: Flyer[];
  offers: Offer[];
  categories: Category[];
}

async function fetchRegional(): Promise<RegionalData> {
  if (!API_URL) return regionalSnapshot;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`${API_URL}/api/regional`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as RegionalData;
  } catch {
    return regionalSnapshot;
  }
}

async function loadLocal(): Promise<LocalData> {
  const source =
    DATA_MODE === "demo"
      ? { markets: mock.mockMarkets, branches: mock.mockBranches, flyers: mock.mockFlyers, offers: mock.mockOffers }
      : await fetchRegional();
  const onlyPublic = <T extends { market_id: string }>(items: T[]) => filterByPublicMarkets(items, source.markets);
  return {
    markets: filterPublicMarkets(source.markets),
    branches: onlyPublic(source.branches),
    flyers: onlyPublic(source.flyers),
    offers: onlyPublic(source.offers),
    // As categorias são fixas do Budega (não vêm dos mercados).
    categories: mock.mockCategories,
  };
}

// Uma carga por abertura do app (as telas chamam várias funções abaixo).
let pending: Promise<LocalData> | null = null;
function local(): Promise<LocalData> {
  pending ??= loadLocal();
  return pending;
}

export async function getMarkets(): Promise<Market[]> {
  if (isMock) return (await local()).markets;
  const { data, error } = await supabase!.from("markets").select("*");
  if (error) throw new Error(error.message);
  return data as Market[];
}

export async function getMarketBySlug(slug: string): Promise<Market | null> {
  if (isMock) return (await local()).markets.find((market) => market.slug === slug) ?? null;
  const { data, error } = await supabase!.from("markets").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Market | null) ?? null;
}

/** Destaques editoriais; sem nenhum destaque definido, mostra os mercados da região. */
export async function getFeaturedMarkets(limit = 6): Promise<Market[]> {
  const markets = await getMarkets();
  const featured = markets.filter((market) => market.is_featured);
  return (featured.length ? featured : markets).slice(0, limit);
}

export async function getBranchesByMarket(marketId: string): Promise<Branch[]> {
  if (isMock) return (await local()).branches.filter((branch) => branch.market_id === marketId);
  const { data, error } = await supabase!.from("branches").select("*").eq("market_id", marketId);
  if (error) throw new Error(error.message);
  return data as Branch[];
}

/** Todas as lojas (mapa e distância até a loja mais próxima de cada rede). */
export async function getAllBranches(): Promise<Branch[]> {
  if (isMock) return (await local()).branches;
  const { data, error } = await supabase!.from("branches").select("*");
  if (error) throw new Error(error.message);
  return data as Branch[];
}

export async function getCategories(): Promise<Category[]> {
  if (isMock) return (await local()).categories;
  const { data, error } = await supabase!.from("categories").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data as Category[];
}

export interface OfferFilters {
  marketId?: string;
  categoryId?: string;
  featuredOnly?: boolean;
}

export async function getActiveOffers(filters: OfferFilters = {}): Promise<Offer[]> {
  let offers: Offer[];
  if (isMock) {
    offers = filterActiveOffers((await local()).offers);
  } else {
    let query = supabase!.from("offers").select("*");
    if (filters.marketId) query = query.eq("market_id", filters.marketId);
    if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    offers = filterActiveOffers(data as Offer[]);
  }

  if (filters.marketId) offers = offers.filter((offer) => offer.market_id === filters.marketId);
  if (filters.categoryId) offers = offers.filter((offer) => offer.category_id === filters.categoryId);
  if (filters.featuredOnly) offers = offers.filter((offer) => offer.is_featured);
  return offers;
}

export async function getOfferById(id: string): Promise<Offer | null> {
  const offers = isMock ? (await local()).offers : await getActiveOffers();
  const offer = offers.find((item) => item.id === id) ?? null;
  if (!offer) return null;
  return filterActiveOffers([offer])[0] ?? null;
}

export async function getActiveFlyers(marketId?: string): Promise<Flyer[]> {
  let flyers: Flyer[];
  if (isMock) {
    flyers = filterActiveFlyers((await local()).flyers);
  } else {
    let query = supabase!.from("flyers").select("*");
    if (marketId) query = query.eq("market_id", marketId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    flyers = filterActiveFlyers(data as Flyer[]);
  }
  return marketId ? flyers.filter((flyer) => flyer.market_id === marketId) : flyers;
}

export async function getFlyerById(id: string): Promise<Flyer | null> {
  const flyers = isMock ? (await local()).flyers : await getActiveFlyers();
  const flyer = flyers.find((item) => item.id === id) ?? null;
  if (!flyer) return null;
  return filterActiveFlyers([flyer])[0] ?? null;
}

export async function getMarketById(id: string): Promise<Market | null> {
  const markets = await getMarkets();
  return markets.find((market) => market.id === id) ?? null;
}
