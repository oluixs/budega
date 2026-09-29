const WEB_BASE_URL = "https://budega.app";
const DEEP_LINK_SCHEME = "budega://";

/** Compartilhamento deve usar URL pública ou deep link válido (regra de negócio 10.7). */
export function buildMarketShareUrl(slug: string): string {
  return `${WEB_BASE_URL}/mercados/${slug}`;
}

export function buildOfferShareUrl(offerId: string): string {
  return `${WEB_BASE_URL}/ofertas/${offerId}`;
}

export function buildFlyerShareUrl(flyerId: string): string {
  return `${WEB_BASE_URL}/encartes/${flyerId}`;
}

export function buildMarketDeepLink(slug: string): string {
  return `${DEEP_LINK_SCHEME}mercados/${slug}`;
}

export function buildOfferDeepLink(offerId: string): string {
  return `${DEEP_LINK_SCHEME}ofertas/${offerId}`;
}

export function buildExternalRouteUrl(latitude: number, longitude: number, label?: string): string {
  const destination = `${latitude},${longitude}`;
  const params = new URLSearchParams({ api: "1", destination });
  if (label) params.set("destination_place_id", label);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function buildWhatsAppUrl(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const params = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${params}`;
}
