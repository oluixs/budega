import type { Branch, Flyer, Market } from "@budega/shared";
import {
  findRestrictedBranch,
  normalizePhone,
  parseAddress,
  parseCoordinates,
  parseOpeningHours,
  parseValidity,
} from "../parse";
import { titleCase } from "../text";
import type { SourceAdapter, SourceContext, SourceResult } from "../types";

/**
 * Cometa Supermercados (Fortaleza e Região Metropolitana).
 * Usa os mesmos endpoints públicos que as páginas https://cometasupermercados.com.br/encartes
 * e /onde-estamos chamam no navegador de qualquer visitante. A API do CMS
 * (adminx.cometasupermercados.com.br/api/*) exige autenticação e NÃO é usada.
 */

const SITE = "https://cometasupermercados.com.br";
const FILES = "https://adminx.cometasupermercados.com.br";
const MARKET_ID = "cometa";

interface StrapiMedia {
  url: string;
  mime?: string;
  formats?: Record<string, { url: string } | undefined> | null;
}

interface CometaStore {
  id: number;
  name: string;
  address: string;
  phonenumber: string | null;
  time: string | null;
  coordinates: string | null;
  store_number: number | null;
  createdAt: string;
  updatedAt: string;
}

interface CometaFlyer {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  pdf: StrapiMedia | null;
  cover: StrapiMedia | null;
}

interface StrapiList<T> {
  data: T[];
}

const fileUrl = (path: string) => (path.startsWith("http") ? path : `${FILES}${path}`);

export function mapStores(stores: CometaStore[], warnings: string[]): Branch[] {
  const branches: Branch[] = [];
  for (const store of stores) {
    const coordinates = parseCoordinates(store.coordinates);
    if (!coordinates) {
      warnings.push(`Loja "${store.name}" sem coordenadas válidas — ignorada.`);
      continue;
    }
    const { address, neighborhood, city } = parseAddress(store.address, "Fortaleza");
    branches.push({
      id: `${MARKET_ID}-loja-${store.store_number ?? store.id}`,
      market_id: MARKET_ID,
      name: `Cometa ${store.name.replace(/^loja\s+/i, "").trim()}`,
      address,
      neighborhood,
      city,
      state: "CE",
      postal_code: "",
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      phone: normalizePhone(store.phonenumber),
      opening_hours: parseOpeningHours(store.time ?? ""),
      created_at: store.createdAt,
      updated_at: store.updatedAt,
    });
  }
  return branches;
}

export function mapFlyers(flyers: CometaFlyer[], branches: Branch[], warnings: string[]): Flyer[] {
  const result: Flyer[] = [];
  for (const flyer of flyers) {
    const description = (flyer.description ?? "").trim();
    const file = flyer.pdf ?? flyer.cover;
    if (!file) {
      warnings.push(`Encarte "${flyer.name}" sem arquivo — ignorado.`);
      continue;
    }
    const validity = parseValidity(description, flyer.publishedAt);
    if (!validity) {
      // Sem período não publicamos (regra de negócio: oferta/encarte sem validade não vai ao ar).
      warnings.push(`Encarte "${flyer.name}" sem período de validade reconhecível ("${description}") — ignorado.`);
      continue;
    }
    const cover = flyer.cover?.formats?.large?.url ?? flyer.cover?.formats?.medium?.url ?? flyer.cover?.url;
    result.push({
      id: `${MARKET_ID}-encarte-${flyer.id}`,
      market_id: MARKET_ID,
      branch_id: findRestrictedBranch(description, branches),
      title: titleCase(flyer.name),
      description: description || null,
      file_url: fileUrl(file.url),
      file_type: file.mime === "application/pdf" || file.url.endsWith(".pdf") ? "pdf" : "image",
      cover_url: cover ? fileUrl(cover) : null,
      source_url: `${SITE}/encartes`,
      valid_from: validity.valid_from,
      valid_until: validity.valid_until,
      is_active: true,
      status: "active",
      created_at: flyer.createdAt,
      updated_at: flyer.updatedAt,
    });
  }
  return result;
}

function buildMarket(branches: Branch[], flyers: Flyer[], fetchedAt: string): Market {
  // Endereço principal = loja nº 1 (a primeira da lista oficial).
  const main = branches[0]!;
  // "Atualizado" = mudança mais recente em lojas OU encartes (encarte novo é atualização).
  const dates = [...branches, ...flyers].map((item) => item.updated_at).sort();
  return {
    id: MARKET_ID,
    name: "Cometa Supermercados",
    slug: "cometa-supermercados",
    description: `Rede de supermercados de Fortaleza e Região Metropolitana, com ${branches.length} lojas.`,
    logo_url: `${SITE}/logo.png`,
    phone: main.phone,
    whatsapp: null,
    address: main.address,
    neighborhood: main.neighborhood,
    city: main.city,
    state: "CE",
    postal_code: "",
    latitude: main.latitude,
    longitude: main.longitude,
    opening_hours: main.opening_hours,
    // Verificação é feita pela equipe do Budega com o mercado — importar não verifica.
    is_verified: false,
    is_featured: false,
    is_suspended: false,
    created_at: branches.map((branch) => branch.created_at).sort()[0] ?? fetchedAt,
    updated_at: dates[dates.length - 1] ?? fetchedAt,
    owner_id: null,
    website_url: SITE,
  };
}

export const cometaAdapter: SourceAdapter = {
  id: MARKET_ID,
  name: "Cometa Supermercados",
  websiteUrl: SITE,
  async fetch({ http, now }: SourceContext): Promise<SourceResult> {
    const warnings: string[] = [];
    const [stores, flyers] = await Promise.all([
      http.getJson<StrapiList<CometaStore>>(`${SITE}/api/onde-estamos`),
      http.getJson<StrapiList<CometaFlyer>>(`${SITE}/api/encartes`),
    ]);
    const ordered = [...stores.data].sort((a, b) => (a.store_number ?? 999) - (b.store_number ?? 999));
    const branches = mapStores(ordered, warnings);
    if (branches.length === 0) throw new Error("Nenhuma loja com coordenadas retornada pelo site.");
    const fetchedAt = now.toISOString();
    const mappedFlyers = mapFlyers(flyers.data, branches, warnings);

    return {
      source: { market_id: MARKET_ID, name: "Cometa Supermercados", website_url: SITE, fetched_at: fetchedAt, error: null },
      market: buildMarket(branches, mappedFlyers, fetchedAt),
      branches,
      flyers: mappedFlyers,
      warnings,
    };
  },
};
