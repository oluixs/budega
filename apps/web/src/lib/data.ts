import "server-only";
import {
  filterActiveFlyers,
  filterActiveOffers,
  mock,
  type Branch,
  type Category,
  type Flyer,
  type Market,
  type Offer,
} from "@budega/shared";
import { isMock, supabase } from "@/lib/supabase";

/**
 * Camada de dados do app web. Em modo mock (sem credenciais Supabase), lê direto de
 * packages/shared/src/mock. Com credenciais configuradas, consulta o Supabase real.
 * As duas versões devolvem exatamente os mesmos tipos de packages/shared, então o
 * restante do app (páginas/componentes) não precisa saber qual fonte está ativa.
 */

export async function getMarkets(): Promise<Market[]> {
  if (isMock) return mock.mockMarkets;
  const { data, error } = await supabase!.from("markets").select("*");
  if (error) throw new Error(`Falha ao carregar mercados: ${error.message}`);
  return data as Market[];
}

export async function getMarketBySlug(slug: string): Promise<Market | null> {
  if (isMock) return mock.mockMarkets.find((market) => market.slug === slug) ?? null;
  const { data, error } = await supabase!.from("markets").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Falha ao carregar mercado "${slug}": ${error.message}`);
  return (data as Market | null) ?? null;
}

export async function getFeaturedMarkets(limit = 4): Promise<Market[]> {
  const markets = await getMarkets();
  return markets.filter((market) => market.is_featured).slice(0, limit);
}

export async function getBranchesByMarket(marketId: string): Promise<Branch[]> {
  if (isMock) return mock.mockBranches.filter((branch) => branch.market_id === marketId);
  const { data, error } = await supabase!.from("branches").select("*").eq("market_id", marketId);
  if (error) throw new Error(`Falha ao carregar filiais: ${error.message}`);
  return data as Branch[];
}

export async function getCategories(): Promise<Category[]> {
  if (isMock) return mock.mockCategories;
  const { data, error } = await supabase!.from("categories").select("*").order("sort_order");
  if (error) throw new Error(`Falha ao carregar categorias: ${error.message}`);
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
    offers = filterActiveOffers(mock.mockOffers);
  } else {
    let query = supabase!.from("offers").select("*");
    if (filters.marketId) query = query.eq("market_id", filters.marketId);
    if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
    const { data, error } = await query;
    if (error) throw new Error(`Falha ao carregar ofertas: ${error.message}`);
    offers = filterActiveOffers(data as Offer[]);
  }

  if (filters.marketId) offers = offers.filter((offer) => offer.market_id === filters.marketId);
  if (filters.categoryId) offers = offers.filter((offer) => offer.category_id === filters.categoryId);
  if (filters.featuredOnly) offers = offers.filter((offer) => offer.is_featured);
  return offers;
}

export async function getOfferById(id: string): Promise<Offer | null> {
  const offers = isMock ? mock.mockOffers : await getActiveOffers();
  const offer = offers.find((item) => item.id === id) ?? null;
  if (!offer) return null;
  return filterActiveOffers([offer])[0] ?? null;
}

export async function getActiveFlyers(marketId?: string): Promise<Flyer[]> {
  let flyers: Flyer[];
  if (isMock) {
    flyers = filterActiveFlyers(mock.mockFlyers);
  } else {
    let query = supabase!.from("flyers").select("*");
    if (marketId) query = query.eq("market_id", marketId);
    const { data, error } = await query;
    if (error) throw new Error(`Falha ao carregar encartes: ${error.message}`);
    flyers = filterActiveFlyers(data as Flyer[]);
  }
  return marketId ? flyers.filter((flyer) => flyer.market_id === marketId) : flyers;
}

export async function getFlyerById(id: string): Promise<Flyer | null> {
  const flyers = isMock ? mock.mockFlyers : await getActiveFlyers();
  const flyer = flyers.find((item) => item.id === id) ?? null;
  if (!flyer) return null;
  return filterActiveFlyers([flyer])[0] ?? null;
}

export async function getMarketById(id: string): Promise<Market | null> {
  const markets = await getMarkets();
  return markets.find((market) => market.id === id) ?? null;
}
