import type { Offer } from "../types/index";

/** Desconto relativo (0–1) quando o encarte imprime o preço anterior; senão 0. */
export function discountRatio(offer: Pick<Offer, "promotional_price" | "regular_price">): number {
  const regular = offer.regular_price;
  return regular && regular > offer.promotional_price ? (regular - offer.promotional_price) / regular : 0;
}

/**
 * Ofertas para a vitrine da página inicial: as marcadas como destaque pelo admin; sem
 * destaque, alterna entre os mercados (um encarte grande não ocupa a vitrine inteira) e,
 * dentro de cada mercado, mostra primeiro os maiores descontos.
 */
export function pickHighlightOffers(offers: Offer[], limit: number): Offer[] {
  const featured = offers.filter((offer) => offer.is_featured);
  if (featured.length) return featured.slice(0, limit);

  const byMarket = new Map<string, Offer[]>();
  for (const offer of offers) byMarket.set(offer.market_id, [...(byMarket.get(offer.market_id) ?? []), offer]);
  const queues = [...byMarket.values()].map((list) => [...list].sort((a, b) => discountRatio(b) - discountRatio(a)));

  const picked: Offer[] = [];
  while (picked.length < limit && queues.some((queue) => queue.length)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && picked.length < limit) picked.push(next);
    }
  }
  return picked;
}
