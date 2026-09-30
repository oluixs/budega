import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { HttpClient } from "../http";
import type { Geocoder } from "../geocode";
import { brandName, detectCity, parseAssociates, splitAddressPhone, uniforcaAdapter } from "./uniforca";

// Fixture = HTML real de https://www.redeuniforca.com.br/associados/ (30/09/2026).
const fixture = fs.readFileSync(path.join(__dirname, "__fixtures__", "uniforca-associados.html"), "utf8");

const http: HttpClient = {
  async getText(url) {
    if (url.endsWith("/associados/")) return fixture;
    throw new Error(`URL inesperada: ${url}`);
  },
  async getJson() {
    throw new Error("não usado");
  },
  async getBuffer() {
    throw new Error("não usado");
  },
};

// Geocodificador falso: só reconhece os endereços da Região Metropolitana realmente
// usados nos testes abaixo (evita 121 chamadas reais); qualquer outro "não encontrado",
// como o Nominatim faria para um endereço mal formatado.
const KNOWN = new Map<string, { latitude: number; longitude: number }>([
  ["Av. Contorno Sul, 333 - Conj. Esperança, Fortaleza - CE, Fortaleza, CE, Brasil", { latitude: -3.75, longitude: -38.5 }],
  ["Rua Dr. Theberge, 538 - Álvaro Weyne, Fortaleza, CE, Brasil", { latitude: -3.71, longitude: -38.6 }],
]);
const queries: string[] = [];
const geocode: Geocoder = {
  async lookup(query) {
    queries.push(query);
    return KNOWN.get(query) ?? null;
  },
};

const now = new Date("2026-09-30T12:00:00Z");

describe("Rede Uniforça — leitura do HTML", () => {
  it("lê os 121 associados (marca, apelido da loja e endereço em texto livre)", () => {
    const stores = parseAssociates(fixture);
    expect(stores).toHaveLength(121);
    expect(stores[0]).toEqual({
      heading: "Baratão Supermercado - Loja Conj. Esperança",
      addressText: "Av. Contorno Sul, 333 - Conj. Esperança, Fortaleza - CE. Telefone: (85) 3298-8550",
    });
    // Alguns associados podem estar cadastrados no site sem endereço (só o nome da
    // loja) — nesta captura, todos têm algum texto de endereço.
    expect(stores.every((store) => store.addressText !== null)).toBe(true);
  });

  it("associado sem <p> de endereço entra com addressText null (não é descartado na leitura)", () => {
    const html = `<div class="associates-modal__item"><h2>Feirão do Lar - Loja Centro</h2></div>`;
    expect(parseAssociates(html)).toEqual([{ heading: "Feirão do Lar - Loja Centro", addressText: null }]);
  });

  it("extrai só a marca do título (o nome que aparece na loja)", () => {
    expect(brandName("Baratão Supermercado - Loja  Conj. Esperança")).toBe("Baratão Supermercado");
    expect(brandName("Carnaúba Supermercado  - Loja Parque Santo Antônio - Itaitinga")).toBe("Carnaúba Supermercado");
    expect(brandName("Supermercado Nova Opção")).toBe("Supermercado Nova Opção");
  });

  it("separa endereço e telefone, com 'Telefone:', 'Fone' e sem espaço no número", () => {
    expect(splitAddressPhone("Av. Contorno Sul, 333 - Conj. Esperança, Fortaleza - CE. Telefone: (85) 3298-8550")).toEqual({
      address: "Av. Contorno Sul, 333 - Conj. Esperança, Fortaleza - CE",
      phone: "(85) 3298-8550",
    });
    expect(splitAddressPhone("Rua Paulo Batista dos Santos, 1112 - Pajuçara. Telefone:  (85)8142-7240")).toEqual({
      address: "Rua Paulo Batista dos Santos, 1112 - Pajuçara",
      phone: "(85)8142-7240",
    });
    expect(splitAddressPhone("Avenida Contorno Leste S/N - Metrópole. Telefone (85) 98138-8902 ")).toEqual({
      address: "Avenida Contorno Leste S/N - Metrópole",
      phone: "(85) 98138-8902",
    });
  });

  it("detecta a cidade pelo endereço, pela Região Metropolitana ou pelo interior conhecido; nunca inventa cidade de texto vazio", () => {
    expect(detectCity("Av. Contorno Sul, 333 - Conj. Esperança, Fortaleza - CE")).toBe("Fortaleza");
    expect(detectCity("Rua Torreon, 245 - Parque Potira - Caucaia")).toBe("Caucaia");
    // Bairro só de Fortaleza, sem cidade citada: assume Fortaleza.
    expect(detectCity("Rua Dr. Theberge, 538 - Álvaro Weyne")).toBe("Fortaleza");
    // Cidade do interior conhecida: reconhecida (para a chamadora excluir), não "Fortaleza".
    expect(detectCity("Av. Ramalho, 01 - Centro, Russas")).toBe("Russas");
    expect(detectCity("R. José Muniz, 4198 - Centro, Tabuleiro do Norte - CE")).toBe("Tabuleiro do Norte");
    expect(detectCity("")).toBeNull();
  });
});

describe("uniforcaAdapter", () => {
  it("importa lojas da Região Metropolitana com marca própria, ignora o resto e nunca desperdiça geocodificação fora da RMF", async () => {
    const result = await uniforcaAdapter.fetch({ http, now, geocode });

    expect(result.market).toMatchObject({ id: "uniforca", name: "Rede Uniforça", slug: "rede-uniforca" });
    expect(result.flyers).toEqual([]);
    expect(result.branches).toHaveLength(2);
    expect(result.branches.map((b) => [b.name, b.city, b.coordinates_approximate])).toEqual([
      ["Baratão Supermercado", "Fortaleza", true],
      ["Baratão Supermercado", "Fortaleza", true],
    ]);
    expect(result.branches[0]!.phone).toBe("8532988550");

    expect(result.warnings.join(" | ")).toMatch(/\d+ loja\(s\) fora da Região Metropolitana/);
    // Nunca manda geocodificar endereço de fora da Região Metropolitana (economiza
    // consultas ao Nominatim — a rede tem lojas em quase 20 cidades do interior).
    expect(queries.some((q) => q.includes("Russas") || q.includes("Quixadá") || q.includes("Aracati"))).toBe(false);
  });

  it("erro claro quando a página de associados não tem nenhum item", async () => {
    const empty: HttpClient = { ...http, async getText() { return "<html></html>"; } };
    await expect(uniforcaAdapter.fetch({ http: empty, now, geocode })).rejects.toThrow("Nenhum associado encontrado");
  });
});
