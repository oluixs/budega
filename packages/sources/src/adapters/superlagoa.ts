import { parse } from "node-html-parser";
import type { Branch, Market } from "@budega/shared";
import { normalizePhone, parseCoordinates, parseOpeningHours } from "../parse";
import type { SourceAdapter, SourceContext, SourceResult } from "../types";

/**
 * Super Lagoa (Grupo Lagoa) — Fortaleza, Região Metropolitana, Sobral e Juazeiro do
 * Norte. Site em PHP simples: /lojas.php lista as unidades (nome + link para o
 * detalhe), e /loja.php?id=N tem endereço, telefone, CEP e as coordenadas exatas da
 * loja (campos ocultos `localizacao_latitude`/`localizacao_longitude` usados pelo mapa
 * do próprio site) — não precisa de geocodificação. robots.txt só proíbe caminhos
 * administrativos/WordPress (/wp-admin/, /cgi-bin/ etc.), então as páginas de loja são
 * permitidas.
 *
 * Sem encartes: a "Revista de Ofertas" do site (/ofertas.php?categoria=2) não é
 * atualizada desde agosto de 2023 no momento da importação — mostrar esse "encarte"
 * violaria a regra de negócio de não publicar conteúdo sem validade atual. O mercado é
 * importado só com as lojas (endereço, telefone, horário), sem encartes/ofertas.
 */

const SITE = "https://www.superlagoa.com.br";
const MARKET_ID = "superlagoa";

interface RawStoreLink {
  id: string;
  name: string;
}

export function parseStoreList(html: string): RawStoreLink[] {
  const root = parse(html);
  const stores = new Map<string, RawStoreLink>();
  for (const link of root.querySelectorAll('a[href^="loja.php?id="]')) {
    const id = link.getAttribute("href")?.match(/id=(\d+)/)?.[1];
    const heading = link.parentNode?.querySelector("h2");
    const name = heading?.text.replace(/\s+/g, " ").trim();
    if (id && name) stores.set(id, { id, name });
  }
  return [...stores.values()];
}

export interface RawStoreDetail {
  address: string;
  city: string;
  postalCode: string;
  phone: string | null;
  hoursText: string;
  latitude: number | null;
  longitude: number | null;
}

/** "Fortaleza - CE" → "Fortaleza" (o estado é sempre CE nesta rede). */
function cityOnly(raw: string): string {
  return raw.replace(/\s*-\s*CE\s*$/i, "").trim();
}

/**
 * O site separa dia e horário com uma quebra de linha, não ":" nem "das"
 * ("SÁBADO<br>07h00 às 22h00") — o parser genérico de horário espera um separador
 * explícito, então inserimos ": " antes de cada horário para reaproveitá-lo.
 */
function fixHoursSeparator(text: string): string {
  return text
    .replace(/ /g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n(?=\d)/g, ": ");
}

export function parseStoreDetail(html: string): RawStoreDetail {
  const root = parse(html);
  const latitude = root.querySelector("#localizacao_latitude")?.getAttribute("value");
  const longitude = root.querySelector("#localizacao_longitude")?.getAttribute("value");
  const address = root.querySelector(".endereco-container strong")?.text.replace(/\s+/g, " ").trim() ?? "";
  const infoText = root.querySelector(".info")?.text ?? "";
  const city = infoText.match(/Cidade:\s*([^\n]+)/)?.[1]?.trim() ?? "";
  const postalCode = infoText.match(/CEP:\s*([\d-]+)/)?.[1]?.trim() ?? "";
  const phone = infoText.match(/Telefone:\s*([()\d\s-]+)/)?.[1]?.trim() ?? null;
  const hoursText = fixHoursSeparator(root.querySelector(".horarios")?.text.trim() ?? "");

  return {
    address,
    city: cityOnly(city),
    postalCode,
    phone,
    hoursText,
    latitude: latitude ? Number(latitude) : null,
    longitude: longitude ? Number(longitude) : null,
  };
}

export const superlagoaAdapter: SourceAdapter = {
  id: MARKET_ID,
  name: "Super Lagoa",
  websiteUrl: SITE,
  async fetch({ http, now }: SourceContext): Promise<SourceResult> {
    const warnings: string[] = [
      "Encartes não importados: a Revista de Ofertas do site não é atualizada desde 08/2023.",
    ];
    const listHtml = await http.getText(`${SITE}/lojas.php`);
    const links = parseStoreList(listHtml);
    if (links.length === 0) throw new Error("Nenhuma loja encontrada em /lojas.php.");

    const fetchedAt = now.toISOString();
    const branches: Branch[] = [];
    for (const link of links) {
      const detailHtml = await http.getText(`${SITE}/loja.php?id=${link.id}`);
      const detail = parseStoreDetail(detailHtml);
      const coordinates = parseCoordinates(
        detail.latitude !== null && detail.longitude !== null ? `${detail.latitude}, ${detail.longitude}` : null,
      );
      if (!coordinates) {
        warnings.push(`"${link.name}" sem coordenadas válidas — ignorada.`);
        continue;
      }
      if (!detail.address) {
        warnings.push(`"${link.name}" sem endereço — ignorada.`);
        continue;
      }
      branches.push({
        id: `${MARKET_ID}-${link.id}`,
        market_id: MARKET_ID,
        name: `Super Lagoa ${link.name.replace(/^loja\s+/i, "").trim()}`,
        address: detail.address,
        neighborhood: "",
        city: detail.city || "Fortaleza",
        state: "CE",
        postal_code: detail.postalCode,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        phone: normalizePhone(detail.phone),
        opening_hours: parseOpeningHours(detail.hoursText),
        created_at: fetchedAt,
        updated_at: fetchedAt,
      });
    }
    if (branches.length === 0) throw new Error("Nenhuma loja com endereço e coordenadas válidas.");

    const main = branches[0]!;
    const cities = [...new Set(branches.map((branch) => branch.city))];
    const market: Market = {
      id: MARKET_ID,
      name: "Super Lagoa",
      slug: "super-lagoa",
      description: `Rede de supermercados cearense, com ${branches.length} lojas em ${cities.join(", ")}.`,
      logo_url: `${SITE}/img/logo-lagoa.png`,
      phone: main.phone,
      whatsapp: "5585834772300",
      address: main.address,
      neighborhood: main.neighborhood,
      city: main.city,
      state: "CE",
      postal_code: main.postal_code,
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
    };

    return {
      source: { market_id: MARKET_ID, name: market.name, website_url: SITE, fetched_at: fetchedAt, error: null },
      market,
      branches,
      flyers: [],
      warnings,
    };
  },
};
