import type { Coordinates, Market, MarketWithDistance } from "../types/index";

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Distância em quilômetros entre duas coordenadas, usando a fórmula de Haversine.
 * Retorna `null` se qualquer coordenada estiver ausente.
 */
export function calculateDistanceKm(
  from: Coordinates | null | undefined,
  to: Coordinates | null | undefined,
): number | null {
  if (!from || !to) return null;
  if (
    Number.isNaN(from.latitude) ||
    Number.isNaN(from.longitude) ||
    Number.isNaN(to.latitude) ||
    Number.isNaN(to.longitude)
  ) {
    return null;
  }

  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export function formatDistance(distanceKm: number | null): string {
  if (distanceKm === null) return "Distância indisponível";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1).replace(".", ",")} km`;
}

export function withDistance(
  markets: Market[],
  origin: Coordinates | null,
): MarketWithDistance[] {
  return markets.map((market) => ({
    ...market,
    distance_km: origin
      ? calculateDistanceKm(origin, {
          latitude: market.latitude,
          longitude: market.longitude,
        })
      : null,
  }));
}

export type MarketSortOrder = "distance" | "relevance";

/**
 * Ordena mercados por distância (mais perto primeiro, nulos por último) ou por
 * relevância (destaque + verificado primeiro, com distância como desempate).
 */
export function sortMarkets(
  markets: MarketWithDistance[],
  order: MarketSortOrder,
): MarketWithDistance[] {
  const list = [...markets];

  if (order === "distance") {
    return list.sort((a, b) => {
      if (a.distance_km === null && b.distance_km === null) return 0;
      if (a.distance_km === null) return 1;
      if (b.distance_km === null) return -1;
      return a.distance_km - b.distance_km;
    });
  }

  return list.sort((a, b) => {
    const scoreA = (a.is_featured ? 2 : 0) + (a.is_verified ? 1 : 0);
    const scoreB = (b.is_featured ? 2 : 0) + (b.is_verified ? 1 : 0);
    if (scoreA !== scoreB) return scoreB - scoreA;
    if (a.distance_km === null && b.distance_km === null) return 0;
    if (a.distance_km === null) return 1;
    if (b.distance_km === null) return -1;
    return a.distance_km - b.distance_km;
  });
}
