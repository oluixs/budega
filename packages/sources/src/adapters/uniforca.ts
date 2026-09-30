import { parse } from "node-html-parser";
import type { Branch, Market } from "@budega/shared";
import { normalize, normalizePhone } from "../parse";
import { titleCase } from "../text";
import type { SourceAdapter, SourceContext, SourceResult } from "../types";

/**
 * Rede Uniforça — cooperativa de supermercados independentes do Ceará (cada um com sua
 * própria marca: Baratão, Carnaúba, Nidobox, Super Cordeiro etc.). O site (WordPress)
 * lista os associados em /associados/, um `<div class="associates-modal__item">` por
 * loja com `<h2>` (marca + apelido da loja) e `<p>` (endereço e telefone em texto livre,
 * sem separação clara de bairro — formato inconsistente entre lojas, cada uma cadastrada
 * à mão pela associação). robots.txt só proíbe /wp-admin/.
 *
 * Sem coordenadas nem CEP no HTML (só um link curto do Google Maps por loja, que não
 * seguimos — decisão já registrada para a Frangolândia: seguir esses links seria raspar
 * o Google). Endereços geocodificados via Nominatim, como a Frangolândia.
 *
 * Um único "mercado" no Budega reúne todas as marcas associadas (a rede não tem uma loja
 * "principal" nem visual único): cada `Branch.name` leva a marca própria da loja, para o
 * usuário reconhecer o nome real no bairro. Sem encartes: a rede publica só um encarte
 * geral por período, sem indicar a quais lojas associadas ele vale — mostrar isso como
 * oferta de uma loja específica seria informação que a própria rede não fornece.
 */

const SITE = "https://www.redeuniforca.com.br";
const MARKET_ID = "uniforca";

// Região Metropolitana de Fortaleza (RMF) — pedido do usuário: priorizar lojas de
// Fortaleza. Marcas com filiais só no interior (Aracati, Quixadá, Baturité...) ficam de
// fora; a mesma marca pode ter lojas na RMF e no interior (ex.: Para Ty).
const METRO_CITIES = [
  "Fortaleza",
  "Caucaia",
  "Maracanaú",
  "Maranguape",
  "Pacatuba",
  "Guaiúba",
  "Itaitinga",
  "Eusébio",
  "Aquiraz",
  "Horizonte",
  "Pacajus",
  "Chorozinho",
  "São Gonçalo do Amarante",
];

interface RawStore {
  /** "{Marca} - Loja {apelido}", como aparece no site. */
  heading: string;
  /** Muitos associados estão cadastrados sem endereço no site (só o nome). */
  addressText: string | null;
}

export function parseAssociates(html: string): RawStore[] {
  const root = parse(html);
  const stores: RawStore[] = [];
  for (const item of root.querySelectorAll(".associates-modal__item")) {
    const heading = item.querySelector("h2")?.text.replace(/\s+/g, " ").trim();
    const addressText = item.querySelector("p")?.text.replace(/\s+/g, " ").trim() || null;
    if (heading) stores.push({ heading, addressText });
  }
  return stores;
}

/** "{Marca} - Loja {apelido}" → só a marca (o nome que o cliente reconhece na loja). */
export function brandName(heading: string): string {
  return titleCase(heading.split(/\s+-\s+loja\b/i)[0]!.trim());
}

/**
 * "Av. Contorno Sul, 333 - Conj. Esperança, Fortaleza - CE. Telefone: (85) 3298-8550"
 * → endereço (sem telefone) e telefone. O separador de bairro/cidade varia demais entre
 * lojas (vírgula, hífen, nada) para extrair um bairro confiável — a geocodificação usa o
 * endereço inteiro.
 */
export function splitAddressPhone(raw: string): { address: string; phone: string | null } {
  const match = raw.match(/(.*?)\s*(?:Telefone|Fone)?:?\s*(\(\d{2}\)[\d\s.-]{8,14})\s*(?:\/.*)?$/i);
  const address = (match?.[1] ?? raw).replace(/[.,;]+$/, "").trim();
  return { address, phone: match?.[2]?.trim() ?? null };
}

// Cidades do interior que aparecem nos associados (lojas fora da Região Metropolitana,
// ignoradas por esta importação). Lista fechada, como os ADDRESS_FIXES da Frangolândia:
// uma cidade nova que apareça no site e não esteja aqui cairia no padrão "Fortaleza"
// abaixo — por isso o teste confere Russas explicitamente, e novas cidades encontradas
// em `pnpm importar` (bairro/cidade estranha demais para existir em Fortaleza) devem ser
// adicionadas aqui.
const INTERIOR_CITIES = [
  "Apuiarés", "Aracati", "Banabuiú", "Baturité", "Beberibe", "Bom Jardim", "Brejo Santo",
  "Canindé", "Fortim", "Icapuí", "Ipu", "Itapajé", "Itapipoca", "Jaguaretama",
  "Jaguaruana", "Limoeiro do Norte", "Massapê", "Meruoca", "Monsenhor Tabosa", "Paracuru",
  "Pentecoste", "Pindoretama", "Quixadá", "Quixeramobim", "Russas", "Senador Pompeu",
  "Senador Sá", "Tabuleiro do Norte", "Trairi", "Umirin", "Uruburetama",
];

/**
 * Cidade citada no texto (marca ou endereço). Reconhece as da Região Metropolitana e as
 * do interior conhecidas nos dados (para excluí-las); sem nenhuma cidade citada (comum
 * quando é só bairro de Fortaleza), assume Fortaleza. Endereço vazio → null.
 */
export function detectCity(text: string): string | null {
  const normalized = normalize(text);
  const metro = METRO_CITIES.find((city) => normalized.includes(normalize(city)));
  if (metro) return metro;
  const interior = INTERIOR_CITIES.find((city) => normalized.includes(normalize(city)));
  if (interior) return interior;
  return text.trim() ? "Fortaleza" : null;
}

export const uniforcaAdapter: SourceAdapter = {
  id: MARKET_ID,
  name: "Rede Uniforça",
  websiteUrl: SITE,
  async fetch({ http, now, geocode }: SourceContext): Promise<SourceResult> {
    const warnings: string[] = [
      "Encartes não importados: a rede publica um encarte geral por período, sem indicar a quais lojas associadas ele vale.",
    ];
    const html = await http.getText(`${SITE}/associados/`);
    const raw = parseAssociates(html);
    if (raw.length === 0) throw new Error("Nenhum associado encontrado em /associados/.");

    const fetchedAt = now.toISOString();
    const branches: Branch[] = [];
    let outsideMetro = 0;
    let withoutAddress = 0;
    for (const store of raw) {
      if (!store.addressText) {
        withoutAddress += 1;
        continue;
      }
      const { address, phone } = splitAddressPhone(store.addressText);
      const city = detectCity(`${store.heading} ${address}`);
      if (!city) {
        warnings.push(`"${store.heading}" sem endereço reconhecível — ignorada.`);
        continue;
      }
      if (!METRO_CITIES.includes(city)) {
        outsideMetro += 1;
        continue;
      }
      const coordinates = await geocode.lookup([address, city, "CE", "Brasil"].join(", "));
      if (!coordinates) {
        warnings.push(`"${store.heading}" sem coordenadas (endereço não geocodificado: ${address}) — ignorada.`);
        continue;
      }
      const slug = normalize(store.heading).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      branches.push({
        id: `${MARKET_ID}-${slug}`,
        market_id: MARKET_ID,
        name: brandName(store.heading),
        address: titleCase(address),
        neighborhood: "",
        city,
        state: "CE",
        postal_code: "",
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        phone: normalizePhone(phone),
        opening_hours: [],
        created_at: fetchedAt,
        updated_at: fetchedAt,
        // Coordenadas geocodificadas do endereço (não vêm do site): a rota usa o
        // endereço em texto, não o par de coordenadas.
        coordinates_approximate: true,
      });
    }
    if (outsideMetro > 0) {
      warnings.push(`${outsideMetro} loja(s) fora da Região Metropolitana de Fortaleza ignorada(s).`);
    }
    if (withoutAddress > 0) {
      warnings.push(`${withoutAddress} associado(s) sem endereço cadastrado no site ignorado(s).`);
    }
    if (branches.length === 0) throw new Error("Nenhuma loja da Região Metropolitana com endereço geocodificado.");

    const main = branches[0]!;
    const market: Market = {
      id: MARKET_ID,
      name: "Rede Uniforça",
      slug: "rede-uniforca",
      description: `Cooperativa de ${branches.length} supermercados independentes da Grande Fortaleza (${[...new Set(branches.map((b) => b.name))].length} marcas).`,
      logo_url: null,
      phone: null,
      whatsapp: null,
      address: main.address,
      neighborhood: main.neighborhood,
      city: main.city,
      state: "CE",
      postal_code: "",
      latitude: main.latitude,
      longitude: main.longitude,
      opening_hours: [],
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
      flyers: [],
      warnings,
    };
  },
};
