import type { Branch, Coordinates, Market, MarketWithDistance } from "../types/index";

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

/**
 * Acrescenta a distância de cada mercado até `origin`. Para redes com várias lojas,
 * vale a loja mais próxima (e ela vem em `nearest_branch`): o Cometa, com 43 lojas, está
 * a 500 m de quem mora perto de qualquer uma delas, não só do endereço da matriz.
 */
export function withDistance(
  markets: Market[],
  origin: Coordinates | null,
  branches: Branch[] = [],
): MarketWithDistance[] {
  return markets.map((market) => {
    if (!origin) return { ...market, distance_km: null, nearest_branch: null };

    let best: { distance: number | null; branch: Branch | null } = {
      distance: calculateDistanceKm(origin, market),
      branch: null,
    };
    for (const branch of branches) {
      if (branch.market_id !== market.id) continue;
      const distance = calculateDistanceKm(origin, branch);
      if (distance === null) continue;
      // Empate com o endereço principal (que costuma ser uma das lojas): a loja vence,
      // para o card dizer qual unidade é a mais próxima.
      const closer = best.distance === null || distance < best.distance;
      const tieWithMain = best.branch === null && distance === best.distance;
      if (closer || tieWithMain) best = { distance, branch };
    }
    return { ...market, distance_km: best.distance, nearest_branch: best.branch };
  });
}

/**
 * Busca por texto (nome, bairro, cidade, endereço) no mercado **e nas lojas dele**:
 * "Aldeota" encontra o Cometa porque ele tem lojas no bairro.
 */
export function matchesMarketQuery(market: Market, branches: Branch[], query: string): boolean {
  const normalized = normalizeSearch(query);
  if (!normalized) return true;
  const haystack = [market, ...branches.filter((branch) => branch.market_id === market.id)]
    .flatMap((place) => [place.name, place.neighborhood, place.city, place.address])
    .join(" ");
  return normalizeSearch(haystack).includes(normalized);
}

function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
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
