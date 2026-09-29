import { describe, expect, it } from "vitest";
import { isFlyerActive } from "@budega/shared";
import type { HttpClient } from "../http";
import { cometaAdapter } from "./cometa";
import stores from "./__fixtures__/cometa-onde-estamos.json";
import flyers from "./__fixtures__/cometa-encartes.json";

// Fixtures = respostas reais de https://cometasupermercados.com.br/api/{onde-estamos,encartes}
// em 29/09/2026, reduzidas aos campos usados.
const http: HttpClient = {
  async getJson<T>(url: string) {
    if (url.endsWith("/api/onde-estamos")) return stores as T;
    if (url.endsWith("/api/encartes")) return flyers as T;
    throw new Error(`URL inesperada: ${url}`);
  },
  async getBuffer() {
    throw new Error("não usado");
  },
};

const now = new Date("2026-09-29T15:00:00Z");

describe("cometaAdapter", () => {
  it("monta o mercado com as 43 lojas geolocalizadas", async () => {
    const result = await cometaAdapter.fetch(http, now);
    expect(result.market).toMatchObject({
      id: "cometa",
      slug: "cometa-supermercados",
      name: "Cometa Supermercados",
      city: "Fortaleza",
      state: "CE",
      website_url: "https://cometasupermercados.com.br",
      is_verified: false,
    });
    expect(result.branches).toHaveLength(43);
    expect(result.branches[0]).toMatchObject({
      id: "cometa-loja-1",
      name: "Cometa Ildefonso Albano",
      address: "Rua Ildefonso Albano, 2260",
      neighborhood: "Aldeota",
      phone: "8532317740",
    });
    expect(result.branches.find((b) => b.name === "Cometa Maracanaú")?.city).toBe("Maracanaú");
    // Toda loja do Cometa publica horário legível.
    expect(result.branches.every((b) => b.opening_hours.length === 7)).toBe(true);
  });

  it("importa os 7 encartes com validade, PDF, capa e crédito à fonte", async () => {
    const result = await cometaAdapter.fetch(http, now);
    expect(result.warnings).toEqual([]);
    expect(result.flyers).toHaveLength(7);

    const montese = result.flyers.find((f) => f.id === "cometa-encarte-512")!;
    expect(montese).toMatchObject({
      title: "Ofertas Exclusivas Montese",
      file_type: "pdf",
      file_url: "https://adminx.cometasupermercados.com.br/uploads/10_de_2026_FINAL_83f81efdf3.pdf",
      source_url: "https://cometasupermercados.com.br/encartes",
      valid_from: "2026-09-29T03:00:00.000Z",
      valid_until: "2026-10-06T02:59:59.000Z",
      branch_id: "cometa-loja-47", // Gomes de Matos, bairro Montese
    });
    expect(montese.cover_url).toMatch(/^https:\/\/adminx\.cometasupermercados\.com\.br\/uploads\/large_/);

    // Vale para todas as lojas → sem filial específica.
    expect(result.flyers.find((f) => f.id === "cometa-encarte-510")!.branch_id).toBeNull();
    expect(result.flyers.find((f) => f.title.startsWith("Festival de Massas"))!.title).toBe(
      "Festival de Massas M Dias e JSB",
    );
    expect(result.flyers.filter((f) => isFlyerActive(f, now))).toHaveLength(7);
  });

  it("não publica encarte sem período de validade", async () => {
    const broken: HttpClient = {
      ...http,
      async getJson<T>(url: string) {
        if (url.endsWith("/api/encartes")) {
          return { data: [{ ...flyers.data[0], description: "Ofertas imperdíveis!" }] } as T;
        }
        return http.getJson<T>(url);
      },
    };
    const result = await cometaAdapter.fetch(broken, now);
    expect(result.flyers).toEqual([]);
    expect(result.warnings[0]).toMatch(/sem período de validade/);
  });
});
