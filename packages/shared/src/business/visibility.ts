import type { Market } from "../types/index";

/**
 * Mercado suspenso pelo admin some da experiência pública, junto com filiais, ofertas e
 * encartes. No Supabase real isso é garantido pelo RLS (migration 0002); em modo mock,
 * pelas funções abaixo — as duas fontes precisam se comportar igual.
 */
export function isMarketPublic(market: Pick<Market, "is_suspended">): boolean {
  return !market.is_suspended;
}

export function filterPublicMarkets<T extends Pick<Market, "is_suspended">>(markets: T[]): T[] {
  return markets.filter(isMarketPublic);
}

/** Mantém só os itens (ofertas, encartes, filiais) de mercados públicos. */
export function filterByPublicMarkets<T extends { market_id: string }>(
  items: T[],
  markets: Pick<Market, "id" | "is_suspended">[],
): T[] {
  const publicIds = new Set(markets.filter(isMarketPublic).map((market) => market.id));
  return items.filter((item) => publicIds.has(item.market_id));
}
