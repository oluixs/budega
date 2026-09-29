import type { Flyer, Offer } from "@budega/shared";

/**
 * Ofertas já lidas de cada encarte (data/offers-cache.json, versionado). A chave é o id do
 * encarte e a entrada guarda o arquivo lido: se o mercado trocar o arquivo, a leitura
 * antiga deixa de valer e o encarte é lido de novo na próxima `pnpm importar --ofertas`.
 */
export interface OffersCacheEntry {
  file_url: string;
  extracted_at: string;
  model: string;
  offers: Offer[];
}

export type OffersCache = Record<string, OffersCacheEntry>;

export function cachedOffers(cache: OffersCache, flyer: Flyer): Offer[] | null {
  const entry = cache[flyer.id];
  if (!entry || entry.file_url !== flyer.file_url) return null;
  // Validade e loja vêm do encarte atual (o mercado pode prorrogar/corrigir).
  return entry.offers.map((offer) => ({
    ...offer,
    branch_id: flyer.branch_id,
    valid_from: flyer.valid_from,
    valid_until: flyer.valid_until,
  }));
}

/** Encartes vigentes que ainda não têm leitura válida no cache. */
export function flyersToExtract(cache: OffersCache, flyers: Flyer[]): Flyer[] {
  return flyers.filter((flyer) => cachedOffers(cache, flyer) === null);
}

/** Remove do cache encartes que saíram do ar (mantém o arquivo pequeno). */
export function pruneCache(cache: OffersCache, flyers: Flyer[]): OffersCache {
  const ids = new Set(flyers.map((flyer) => flyer.id));
  return Object.fromEntries(Object.entries(cache).filter(([id]) => ids.has(id)));
}
