import "server-only";
import {
  filterActiveFlyers,
  filterActiveOffers,
  filterByPublicMarkets,
  filterPublicMarkets,
  type Branch,
  type Category,
  type Flyer,
  type Market,
  type Offer,
} from "@budega/shared";
import { isMock } from "@/lib/supabase";
import { publicSupabase as supabase } from "@/lib/supabase-server";
import { getLocalData } from "@/lib/local-data";

/**
 * Camada de dados do app web. Sem credenciais Supabase, lê os dados locais
 * (lib/local-data.ts: mercados reais da região importados dos sites oficiais, ou os
 * dados fictícios com BUDEGA_DADOS=demo). Com Supabase, consulta o banco. As duas
 * versões devolvem os mesmos tipos de packages/shared, então páginas e componentes não
 * precisam saber qual fonte está ativa.
 *
 * Mercado suspenso some do público com tudo que é dele: no Supabase o RLS já filtra; nos
 * dados locais, os filtros abaixo reproduzem a mesma regra.
 */

async function local() {
  const data = await getLocalData();
  const onlyPublic = <T extends { market_id: string }>(items: T[]) => filterByPublicMarkets(items, data.markets);
  return {
    markets: filterPublicMarkets(data.markets),
    branches: onlyPublic(data.branches),
    flyers: onlyPublic(data.flyers),
    offers: onlyPublic(data.offers),
    categories: data.categories,
  };
}

export async function getMarkets(): Promise<Market[]> {
  if (isMock) return (await local()).markets;
  const { data, error } = await supabase!.from("markets").select("*");
  if (error) throw new Error(`Falha ao carregar mercados: ${error.message}`);
  return data as Market[];
}

export async function getMarketBySlug(slug: string): Promise<Market | null> {
  if (isMock) return (await local()).markets.find((market) => market.slug === slug) ?? null;
  const { data, error } = await supabase!.from("markets").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Falha ao carregar mercado "${slug}": ${error.message}`);
  return (data as Market | null) ?? null;
}

/** Destaques editoriais; sem nenhum destaque definido, mostra os mercados da região. */
export async function getFeaturedMarkets(limit = 4): Promise<Market[]> {
  const markets = await getMarkets();
  const featured = markets.filter((market) => market.is_featured);
  return (featured.length ? featured : markets).slice(0, limit);
}

export async function getBranchesByMarket(marketId: string): Promise<Branch[]> {
  if (isMock) return (await local()).branches.filter((branch) => branch.market_id === marketId);
  const { data, error } = await supabase!.from("branches").select("*").eq("market_id", marketId);
  if (error) throw new Error(`Falha ao carregar filiais: ${error.message}`);
  return data as Branch[];
}

/** Todas as lojas (para o mapa e para a distância até a loja mais próxima de cada rede). */
export async function getAllBranches(): Promise<Branch[]> {
  if (isMock) return (await local()).branches;
  const { data, error } = await supabase!.from("branches").select("*");
  if (error) throw new Error(`Falha ao carregar filiais: ${error.message}`);
  return data as Branch[];
}

export async function getCategories(): Promise<Category[]> {
  if (isMock) return (await local()).categories;
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
    offers = filterActiveOffers((await local()).offers);
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
    if (error) throw new Error(`Falha ao carregar encartes: ${error.message}`);
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
