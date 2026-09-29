import type { Flyer, Offer } from "../types/index.js";

/**
 * Regra de negócio: oferta vencida não aparece na experiência pública, mesmo que
 * `is_active` esteja true no banco. `now` é injetável para tornar a função testável.
 */
export function isOfferActive(offer: Pick<Offer, "is_active" | "valid_from" | "valid_until">, now: Date = new Date()): boolean {
  if (!offer.is_active) return false;
  const from = new Date(offer.valid_from);
  const until = new Date(offer.valid_until);
  return now >= from && now <= until;
}

/** Regra de negócio: encarte vencido não aparece como vigente. */
export function isFlyerActive(flyer: Pick<Flyer, "is_active" | "valid_from" | "valid_until">, now: Date = new Date()): boolean {
  if (!flyer.is_active) return false;
  const from = new Date(flyer.valid_from);
  const until = new Date(flyer.valid_until);
  return now >= from && now <= until;
}

export function filterActiveOffers<T extends Pick<Offer, "is_active" | "valid_from" | "valid_until">>(
  offers: T[],
  now: Date = new Date(),
): T[] {
  return offers.filter((offer) => isOfferActive(offer, now));
}

export function filterActiveFlyers<T extends Pick<Flyer, "is_active" | "valid_from" | "valid_until">>(
  flyers: T[],
  now: Date = new Date(),
): T[] {
  return flyers.filter((flyer) => isFlyerActive(flyer, now));
}

/** Oferta sem validade não pode ser publicada (regra de negócio 10.1). */
export function canPublishOffer(offer: { valid_from?: string | null; valid_until?: string | null }): boolean {
  return Boolean(offer.valid_from) && Boolean(offer.valid_until);
}

export function daysUntilExpiration(validUntil: string, now: Date = new Date()): number {
  const until = new Date(validUntil);
  const diffMs = until.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/** Usado no dashboard admin para "alertas de conteúdo vencendo". */
export function isExpiringSoon(validUntil: string, now: Date = new Date(), thresholdDays = 3): boolean {
  const days = daysUntilExpiration(validUntil, now);
  return days >= 0 && days <= thresholdDays;
}
