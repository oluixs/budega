import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isFlyerActive } from "@budega/shared";
import type { HttpClient } from "../http";
import type { Geocoder } from "../geocode";
import { findPdf, frangolandiaAdapter, parseFlyerList, parseStores, splitAddress } from "./frangolandia";

// Fixtures = HTML real de https://frangolandia.com/{lojas,encartes}/ e de um encarte (29/09/2026).
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, "__fixtures__", name), "utf8");
const storesHtml = fixture("frangolandia-lojas.html");
const flyersHtml = fixture("frangolandia-encartes.html");
const detailHtml = fixture("frangolandia-encarte-detalhe.html");

const http: HttpClient = {
  async getText(url) {
    if (url.endsWith("/lojas/")) return storesHtml;
    if (url.endsWith("/encartes/")) return flyersHtml;
    if (url.includes("/encarte/")) return detailHtml;
    throw new Error(`URL inesperada: ${url}`);
  },
  async getJson() {
    throw new Error("não usado");
  },
  async getBuffer() {
    throw new Error("não usado");
  },
};

// Geocodificador falso: coordenadas fixas; Trairi "desconhecido" (como no OpenStreetMap
// real); a loja de Caucaia só é achada na 2ª tentativa, sem o bairro.
const queries: string[] = [];
const geocode: Geocoder = {
  async lookup(query) {
    queries.push(query);
    if (query.includes("Trairi") || query.includes("Curicaca")) return null;
    return { latitude: -3.73, longitude: -38.52 };
  },
};

const now = new Date("2026-09-29T15:00:00Z");

describe("Frangolândia — leitura do HTML", () => {
  it("lê as lojas com endereço, telefone e horário", () => {
    const stores = parseStores(storesHtml);
    expect(stores).toHaveLength(24);
    expect(stores[0]).toEqual({
      name: "ALDEOTA",
      address: "AV. SANTOS DUMONT, 2680 - ALDEOTA",
      phone: "85 3122-8515",
      hours: "Seg à Sab: 06:00 às 00:00 Domingos e Feriados: 06:00 às 00:00",
    });
    // Loja sem telefone no site.
    expect(stores.find((s) => s.name === "BEBERIBE")?.phone).toBeNull();
  });

  it("separa endereço, bairro e cidade", () => {
    expect(splitAddress("AV. SANTOS DUMONT, 2680 - ALDEOTA")).toEqual({
      address: "Av. Santos Dumont, 2680", neighborhood: "Aldeota", city: "Fortaleza",
    });
    expect(splitAddress("RUA DRAGÃO DO MAR, 698 - CENTRO - ARACATI-CE")).toEqual({
      address: "Rua Dragão do Mar, 698", neighborhood: "Centro", city: "Aracati",
    });
    expect(splitAddress("RUA CORONEL BIA, 89 - CENTRO, BEBERIBE-CE")).toEqual({
      address: "Rua Coronel Bia, 89", neighborhood: "Centro", city: "Beberibe",
    });
  });

  it("lê os encartes (título, validade, capa) e o PDF do encarte", () => {
    const flyers = parseFlyerList(flyersHtml);
    expect(flyers.map((f) => [f.title, f.validityText])).toEqual([
      ["Mega Ofertaço das Marcas", "De 28.09 a 04.10.2026"],
      ["Ofertas Horti 🍓🍇 | Aqui É + Barato Todo Dia", "26 a 29.09 de 2026"],
    ]);
    expect(flyers[0]!.coverUrl).toMatch(/-768x1097\.jpeg$/);
    expect(findPdf(detailHtml)).toBe("https://frangolandia.com/wp-content/uploads/2026/09/Mega-Ofertaco-das-Marcas.pdf");
  });
});

describe("frangolandiaAdapter", () => {
  it("monta mercado, lojas e encartes, ignorando o que não é loja aberta", async () => {
    const result = await frangolandiaAdapter.fetch({ http, now, geocode });

    expect(result.market).toMatchObject({ id: "frangolandia", slug: "frangolandia-supermercados", state: "CE" });
    // 24 no site − centro administrativo − loja "vem aí" − 1 endereço não geocodificado.
    expect(result.branches).toHaveLength(21);
    expect(result.branches.some((b) => /administrativo/i.test(b.name))).toBe(false);
    expect(result.branches.some((b) => /vem a/i.test(b.name))).toBe(false);
    expect(result.warnings.join("\n")).toMatch(/centro administrativo/);
    expect(result.warnings.join("\n")).toMatch(/ainda não inaugurada/);
    expect(result.warnings.join("\n")).toMatch(/sem coordenadas/);

    // Caucaia: 2ª tentativa sem o bairro deu certo.
    expect(queries).toContain("Rodovia Estruturante - CE 085, Caucaia, CE, Brasil");
    // Erro de digitação do site corrigido antes de geocodificar/exibir.
    expect(result.branches.find((b) => b.city === "Eusébio")?.address).toBe("Av. Eusébio de Queiroz, 1890");

    const aldeota = result.branches.find((b) => b.name === "Frangolândia Aldeota")!;
    expect(aldeota).toMatchObject({
      neighborhood: "Aldeota",
      city: "Fortaleza",
      phone: "8531228515",
      coordinates_approximate: true,
    });
    expect(aldeota.opening_hours[0]).toEqual({ day: 0, opens_at: "06:00", closes_at: "23:59", closed: false });

    expect(result.flyers).toHaveLength(2);
    expect(result.flyers[0]).toMatchObject({
      id: "frangolandia-encarte-mega-ofertaco-das-marcas-2",
      file_type: "pdf",
      valid_from: "2026-09-28T03:00:00.000Z",
      valid_until: "2026-10-05T02:59:59.000Z",
      source_url: "https://frangolandia.com/encarte/mega-ofertaco-das-marcas-2/",
    });
    expect(result.flyers.filter((f) => isFlyerActive(f, now))).toHaveLength(2);
  });
});
