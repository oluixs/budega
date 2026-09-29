const WEB_BASE_URL = "https://budega.app";
const DEEP_LINK_SCHEME = "budega://";

/** Compartilhamento deve usar URL pública ou deep link válido (regra de negócio 10.7). */
export function buildMarketShareUrl(slug: string): string {
  return `${WEB_BASE_URL}/mercados/${slug}`;
}

export function buildOfferShareUrl(offerId: string): string {
  return `${WEB_BASE_URL}/ofertas/${offerId}`;
}

/** Página do site (ex.: "/privacidade") — o app linka as páginas legais, como as lojas exigem. */
export function buildWebUrl(path: string): string {
  return `${WEB_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
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

/**
 * Rota no Google Maps até as coordenadas. `destination_place_id` NÃO recebe nome: ele
 * espera um Place ID do Google (código), e um nome ali fazia o Maps ignorar/errar o
 * destino. As coordenadas bastam.
 */
export function buildExternalRouteUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({ api: "1", destination: `${latitude},${longitude}` });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function buildWhatsAppUrl(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const params = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${params}`;
}
