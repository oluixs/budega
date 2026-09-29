import { parse, type HTMLElement } from "node-html-parser";
import type { Branch, Flyer, Market } from "@budega/shared";
import { normalize, normalizePhone, parseOpeningHours, parseValidity } from "../parse";
import { titleCase } from "../text";
import type { SourceAdapter, SourceContext, SourceResult } from "../types";

/**
 * Frangolândia Supermercados (Fortaleza, Região Metropolitana e interior do Ceará).
 * Site em WordPress: lê as páginas públicas /encartes/ (título, validade e capa de cada
 * encarte), a página de cada encarte (link do PDF) e /lojas/ (endereço, telefone e
 * horário). O robots.txt só proíbe /wp-admin/. As lojas não têm coordenadas no site —
 * vêm do cache de geocodificação (geocode.ts).
 */

const SITE = "https://frangolandia.com";
const MARKET_ID = "frangolandia";

/**
 * Erros de digitação no site que impedem a geocodificação (o endereço exibido também é
 * corrigido). Ex.: "EUZEBIO DE QUEIROZ" → "Eusébio de Queiroz", "JOAQUIN TÁVORA" → "Joaquim".
 */
const ADDRESS_FIXES: [RegExp, string][] = [
  [/\beuzebio\b/gi, "Eusébio"],
  [/\bjoaquin\b/gi, "Joaquim"],
];

const fixAddress = (text: string) => ADDRESS_FIXES.reduce((value, [pattern, fix]) => value.replace(pattern, fix), text);

/** Unidades que não atendem o público ou ainda não abriram. */
function isNotAStore(name: string): string | null {
  const text = normalize(name);
  if (text.includes("administrativo") || text.includes("distribuicao")) return "centro administrativo";
  if (text.includes("vem ai") || text.includes("em breve")) return "loja ainda não inaugurada";
  return null;
}

const clean = (value: string | undefined) => (value ?? "").replace(/\s+/g, " ").trim();

interface RawStore {
  name: string;
  address: string;
  phone: string | null;
  hours: string;
}

export function parseStores(html: string): RawStore[] {
  const root = parse(html);
  const stores: RawStore[] = [];
  for (const heading of root.querySelectorAll("h3.jet-listing-dynamic-field__content")) {
    const item = heading.closest(".jet-listing-grid__item") as HTMLElement | null;
    if (!item) continue;
    const fields = item
      .querySelectorAll("span.jet-listing-dynamic-field__content")
      .map((field) => clean(field.text))
      .filter(Boolean);
    // Campos sem rótulo no HTML: identificados pelo formato.
    const phone = fields.find((field) => /^\(?\d{2}\)?\s?\d{4,5}[\s.-]?\d{4}$/.test(field)) ?? null;
    const hours = fields.find((field) => /\d{1,2}:\d{2}|fechad/i.test(field)) ?? "";
    const address = fields.find((field) => field !== phone && field !== hours) ?? "";
    stores.push({ name: clean(heading.text), address, phone, hours });
  }
  return stores;
}

/**
 * "RUA DRAGÃO DO MAR, 698 - CENTRO - ARACATI-CE" → endereço, bairro e cidade.
 * Sem cidade no texto → Fortaleza.
 */
export function splitAddress(raw: string): { address: string; neighborhood: string; city: string } {
  const parts = raw.split(/\s+[–-]\s+/).map((part) => part.trim()).filter(Boolean);
  let city = "Fortaleza";
  const last = parts[parts.length - 1] ?? "";
  const withCity = last.match(/^(?:(.*),\s*)?(.+?)\s*-\s*CE$/i);
  if (withCity) {
    city = titleCase(withCity[2]!);
    parts.pop();
    if (withCity[1]) parts.push(withCity[1]);
  }
  const neighborhood = parts.length > 1 ? titleCase(parts.pop()!) : "";
  return { address: titleCase(parts.join(" - ")), neighborhood, city };
}

interface RawFlyer {
  url: string;
  slug: string;
  title: string;
  validityText: string;
  coverUrl: string | null;
}

export function parseFlyerList(html: string): RawFlyer[] {
  const root = parse(html);
  const flyers = new Map<string, RawFlyer>();
  for (const item of root.querySelectorAll(".jet-listing-grid__item")) {
    const imageLink = item.querySelector("a.jet-listing-dynamic-image__link");
    const url = imageLink?.getAttribute("href");
    if (!url || !url.includes("/encarte/")) continue;
    const image = imageLink?.querySelector("img");
    // Capa em tamanho médio (768 px) quando o WordPress gerou; senão a original.
    const srcset = image?.getAttribute("srcset") ?? "";
    const medium = srcset.split(",").map((entry) => entry.trim().split(" ")[0]).find((src) => /-768x\d+\./.test(src ?? ""));
    const validityText = clean(item.querySelector(".elementor-button-text")?.text);
    const title = clean(
      item.querySelectorAll("a").find((link) => link.getAttribute("href") === url && clean(link.text) && !link.classNames.includes("elementor-button"))?.text,
    );
    const slug = url.replace(/\/$/, "").split("/").pop() ?? url;
    flyers.set(url, { url, slug, title, validityText, coverUrl: medium ?? image?.getAttribute("src") ?? null });
  }
  return [...flyers.values()];
}

export function findPdf(html: string): string | null {
  const link = parse(html)
    .querySelectorAll("a")
    .map((anchor) => anchor.getAttribute("href") ?? "")
    .find((href) => /^https:\/\/frangolandia\.com\/wp-content\/uploads\/.+\.pdf$/i.test(href));
  return link ?? null;
}

export const frangolandiaAdapter: SourceAdapter = {
  id: MARKET_ID,
  name: "Frangolândia Supermercados",
  websiteUrl: SITE,
  async fetch({ http, now, geocode }: SourceContext): Promise<SourceResult> {
    const warnings: string[] = [];
    const [storesHtml, flyersHtml] = await Promise.all([
      http.getText(`${SITE}/lojas/`),
      http.getText(`${SITE}/encartes/`),
    ]);
    const fetchedAt = now.toISOString();

    const branches: Branch[] = [];
    for (const store of parseStores(storesHtml)) {
      const skip = isNotAStore(store.name);
      if (skip) {
        warnings.push(`"${store.name}" ignorada (${skip}).`);
        continue;
      }
      const place = splitAddress(fixAddress(store.address));
      // 1ª tentativa com bairro; se o OpenStreetMap não conhecer o bairro, sem ele.
      const coordinates =
        (await geocode.lookup([place.address, place.neighborhood, place.city, "CE", "Brasil"].filter(Boolean).join(", "))) ??
        (place.neighborhood ? await geocode.lookup([place.address, place.city, "CE", "Brasil"].join(", ")) : null);
      if (!coordinates) {
        warnings.push(`Loja "${store.name}" sem coordenadas (endereço não geocodificado: ${store.address}) — ignorada.`);
        continue;
      }
      branches.push({
        id: `${MARKET_ID}-${normalize(store.name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
        market_id: MARKET_ID,
        name: `Frangolândia ${titleCase(store.name)}`,
        ...place,
        state: "CE",
        postal_code: "",
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        phone: normalizePhone(store.phone),
        opening_hours: parseOpeningHours(store.hours),
        created_at: fetchedAt,
        updated_at: fetchedAt,
        // Coordenadas geocodificadas do endereço: a rota usa o endereço em texto.
        coordinates_approximate: true,
      });
    }
    if (branches.length === 0) throw new Error("Nenhuma loja com endereço geocodificado.");

    const flyers: Flyer[] = [];
    for (const raw of parseFlyerList(flyersHtml)) {
      const validity = parseValidity(raw.validityText, fetchedAt);
      if (!validity) {
        warnings.push(`Encarte "${raw.title}" sem período de validade reconhecível ("${raw.validityText}") — ignorado.`);
        continue;
      }
      const pdf = findPdf(await http.getText(raw.url));
      const file = pdf ?? raw.coverUrl;
      if (!file) {
        warnings.push(`Encarte "${raw.title}" sem arquivo — ignorado.`);
        continue;
      }
      flyers.push({
        id: `${MARKET_ID}-encarte-${raw.slug}`,
        market_id: MARKET_ID,
        branch_id: null,
        title: raw.title || "Encarte Frangolândia",
        // O único texto do site é a própria validade, já exibida formatada.
        description: null,
        file_url: file,
        file_type: pdf ? "pdf" : "image",
        cover_url: raw.coverUrl,
        source_url: raw.url,
        valid_from: validity.valid_from,
        valid_until: validity.valid_until,
        is_active: true,
        status: "active",
        created_at: fetchedAt,
        updated_at: fetchedAt,
      });
    }

    const main = branches[0]!;
    const market: Market = {
      id: MARKET_ID,
      name: "Frangolândia Supermercados",
      slug: "frangolandia-supermercados",
      description: `Rede de supermercados do Ceará, com ${branches.length} lojas.`,
      logo_url: `${SITE}/wp-content/uploads/2022/03/Logo-Site-.png`,
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
      is_verified: false,
      is_featured: false,
      is_suspended: false,
      created_at: fetchedAt,
      updated_at: fetchedAt,
      owner_id: null,
      website_url: SITE,
      coordinates_approximate: true,
    };

    return {
      source: { market_id: MARKET_ID, name: market.name, website_url: SITE, fetched_at: fetchedAt, error: null },
      market,
      branches,
      flyers,
      warnings,
    };
  },
};
