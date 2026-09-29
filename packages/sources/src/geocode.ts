import type { Coordinates } from "@budega/shared";
import { USER_AGENT, type FetchLike } from "./http";
import { normalize } from "./parse";

/**
 * Endereço → coordenadas, para redes que publicam endereços sem latitude/longitude
 * (ex.: Frangolândia). Usa o Nominatim (OpenStreetMap) seguindo a política de uso
 * (https://operations.osmfoundation.org/policies/nominatim/): 1 requisição por vez, no
 * máximo 1 por segundo, app identificado, resultados em CACHE (data/geocode-cache.json,
 * versionado) — cada endereço é consultado uma única vez na vida do projeto.
 *
 * O site nunca geocodifica em tempo de execução: lá só o cache é usado
 * (`cacheOnlyGeocoder`). Endereços novos são resolvidos por `pnpm importar`.
 *
 * Nota: o robots.txt do Nominatim proíbe /search para robôs de rastreamento; o uso da API
 * é regido pela política acima, que o permite (ver .audit/decisions/).
 */

export type GeocodeCache = Record<string, Coordinates | null>;

export interface Geocoder {
  lookup(query: string): Promise<Coordinates | null>;
}

export const cacheKey = (query: string) => normalize(query);

/** Retângulo que contém o Ceará: resultado fora dele é descartado (endereço homônimo). */
const CEARA_VIEWBOX = { west: -41.5, north: -2.7, east: -37.2, south: -7.9 };

function insideCeara({ latitude, longitude }: Coordinates): boolean {
  return (
    latitude <= CEARA_VIEWBOX.north &&
    latitude >= CEARA_VIEWBOX.south &&
    longitude >= CEARA_VIEWBOX.west &&
    longitude <= CEARA_VIEWBOX.east
  );
}

export function cacheOnlyGeocoder(cache: GeocodeCache): Geocoder {
  return {
    async lookup(query) {
      return cache[cacheKey(query)] ?? null;
    },
  };
}

export interface NominatimOptions {
  cache: GeocodeCache;
  fetch?: FetchLike;
  delayMs?: number;
  log?: (message: string) => void;
}

/** Geocodificador com cache que consulta o Nominatim só para endereços novos. */
export function createNominatimGeocoder({ cache, fetch = globalThis.fetch, delayMs = 1100, log = () => {} }: NominatimOptions): Geocoder {
  let queue: Promise<unknown> = Promise.resolve();
  let lastRequest = 0;

  async function query(text: string): Promise<Coordinates | null> {
    const wait = lastRequest + delayMs - Date.now();
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRequest = Date.now();

    const params = new URLSearchParams({
      q: text,
      format: "jsonv2",
      limit: "1",
      countrycodes: "br",
      viewbox: `${CEARA_VIEWBOX.west},${CEARA_VIEWBOX.north},${CEARA_VIEWBOX.east},${CEARA_VIEWBOX.south}`,
      bounded: "1",
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "pt-BR" },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`Nominatim HTTP ${response.status}`);
    const [first] = (await response.json()) as { lat: string; lon: string }[];
    if (!first) return null;
    const result = { latitude: Number(first.lat), longitude: Number(first.lon) };
    return insideCeara(result) ? result : null;
  }

  return {
    lookup(text) {
      const key = cacheKey(text);
      if (key in cache) return Promise.resolve(cache[key] ?? null);
      // Uma consulta por vez (política do Nominatim: sem paralelismo).
      const pending = queue.then(async () => {
        if (key in cache) return cache[key] ?? null;
        const result = await query(text);
        cache[key] = result;
        log(result ? `geocodificado: ${text}` : `endereço não encontrado: ${text}`);
        return result;
      });
      queue = pending.catch(() => undefined);
      return pending;
    },
  };
}
