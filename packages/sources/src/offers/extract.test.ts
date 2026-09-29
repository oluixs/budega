import { describe, expect, it } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { mock, type Flyer } from "@budega/shared";
import type { HttpClient } from "../http";
import { cachedOffers, flyersToExtract, pruneCache, type OffersCache } from "./cache";
import { extractOffersFromFlyer } from "./extract";

const flyer = {
  id: "cometa-encarte-512",
  market_id: "cometa",
  branch_id: "cometa-loja-47",
  title: "Ofertas Exclusivas Montese",
  file_url: "https://adminx.cometasupermercados.com.br/uploads/encarte.pdf",
  file_type: "pdf",
  valid_from: "2026-09-29T03:00:00.000Z",
  valid_until: "2026-10-06T02:59:59.000Z",
  is_active: true,
  status: "active",
  created_at: "2026-09-28T19:38:41.229Z",
  updated_at: "2026-09-29T03:00:00.109Z",
} as Flyer;

const http: HttpClient = {
  getJson: async () => {
    throw new Error("não usado");
  },
  getText: async () => {
    throw new Error("não usado");
  },
  getBuffer: async () => new TextEncoder().encode("%PDF-1.4 falso").buffer as ArrayBuffer,
};

/** Cliente falso: devolve a resposta dada e guarda o pedido para inspeção. */
function fakeClient(response: object) {
  const requests: Record<string, unknown>[] = [];
  const client = {
    beta: {
      messages: {
        create: async (params: Record<string, unknown>) => {
          requests.push(params);
          return response;
        },
      },
    },
  } as unknown as Anthropic;
  return { client, requests };
}

const reply = (offers: unknown[]) => ({
  stop_reason: "end_turn",
  stop_details: null,
  content: [{ type: "text", text: JSON.stringify({ offers }) }],
  usage: { input_tokens: 2100, output_tokens: 1800 },
});

const categories = mock.mockCategories;
const alimentos = categories.find((category) => category.slug === "alimentos")!;

describe("extractOffersFromFlyer", () => {
  it("transforma a leitura em ofertas do encarte, marcadas como lidas do encarte", async () => {
    const { client, requests } = fakeClient(
      reply([
        { name: "Arroz branco", brand: "Célia", size: "1kg", promotional_price: 4.05, regular_price: 4.39, unit: "un", category_slug: "alimentos", conditions: "branco ou parboilizado" },
        // Preço anterior menor que o da oferta = leitura inconsistente → sem preço anterior.
        { name: "Feijão de corda", brand: "Fibra", size: "1kg", promotional_price: 5.49, regular_price: 5.0, unit: "un", category_slug: "alimentos", conditions: null },
        // Categoria fora da lista e alimento a R$ 279 ("2,79" sem vírgula) → descartadas.
        { name: "Produto X", brand: null, size: null, promotional_price: 3.0, regular_price: null, unit: "un", category_slug: "eletronicos", conditions: null },
        { name: "Açúcar", brand: "Samuka", size: "1kg", promotional_price: 279, regular_price: null, unit: "un", category_slug: "alimentos", conditions: null },
        // Eletro caro é plausível (Cometa Presentes) → mantido.
        { name: "Ventilador de coluna", brand: "Mondial", size: null, promotional_price: 279, regular_price: 329, unit: "un", category_slug: "higiene-e-limpeza", conditions: null },
      ]),
    );

    const result = await extractOffersFromFlyer({ client, http, flyer, categories });

    expect(result.discarded).toBe(2);
    expect(result.usage).toEqual({ input_tokens: 2100, output_tokens: 1800 });
    expect(result.offers.map((offer) => offer.name)).toEqual(["Arroz branco Célia", "Feijão de corda Fibra", "Ventilador de coluna Mondial"]);
    expect(result.offers[0]).toMatchObject({
      id: "cometa-encarte-512-oferta-1",
      market_id: "cometa",
      branch_id: "cometa-loja-47",
      flyer_id: "cometa-encarte-512",
      origin: "encarte",
      category_id: alimentos.id,
      name: "Arroz branco Célia",
      description: "1kg",
      promotional_price: 4.05,
      regular_price: 4.39,
      valid_until: flyer.valid_until,
    });
    expect(result.offers[1]!.regular_price).toBeNull();

    // O PDF vai como documento base64, com saída estruturada e fallback de recusa.
    const request = requests[0]!;
    expect(request.model).toBe("claude-opus-5-5");
    expect(request.fallbacks).toBe("default");
    const content = (request.messages as { content: { type: string; source?: { media_type: string } }[] }[])[0]!.content;
    expect(content[0]).toMatchObject({ type: "document", source: { media_type: "application/pdf" } });
    expect((request.output_config as { format: { type: string } }).format.type).toBe("json_schema");
  });

  it("recusa e resposta cortada viram erro (nada é publicado)", async () => {
    const refused = fakeClient({ ...reply([]), stop_reason: "refusal", stop_details: { category: "cyber" } });
    await expect(extractOffersFromFlyer({ client: refused.client, http, flyer, categories })).rejects.toThrow(/recusada/);

    const truncated = fakeClient({ ...reply([]), stop_reason: "max_tokens" });
    await expect(extractOffersFromFlyer({ client: truncated.client, http, flyer, categories })).rejects.toThrow(/cortada/);
  });
});

describe("cache de ofertas", () => {
  const offer = { id: "o1", flyer_id: flyer.id, valid_until: "antiga" } as never;
  const cache: OffersCache = {
    [flyer.id]: { file_url: flyer.file_url, extracted_at: "", model: "m", offers: [offer] },
    "encarte-que-saiu": { file_url: "x", extracted_at: "", model: "m", offers: [] },
  };

  it("reusa a leitura do mesmo arquivo com a validade atual do encarte", () => {
    expect(cachedOffers(cache, flyer)?.[0]).toMatchObject({ id: "o1", valid_until: flyer.valid_until });
  });

  it("arquivo trocado pelo mercado = ler de novo", () => {
    const changed = { ...flyer, file_url: "https://adminx.cometasupermercados.com.br/uploads/novo.pdf" };
    expect(cachedOffers(cache, changed)).toBeNull();
    expect(flyersToExtract(cache, [changed])).toEqual([changed]);
  });

  it("encarte que saiu do ar sai do cache", () => {
    expect(Object.keys(pruneCache(cache, [flyer]))).toEqual([flyer.id]);
  });
});
