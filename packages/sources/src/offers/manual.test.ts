import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { mock, type Flyer } from "@budega/shared";
import type { OffersCache } from "./cache";
import { applyManualReadings, ManualReadingSchema, type ManualReading } from "./manual";

const flyer = {
  id: "cometa-encarte-512",
  market_id: "cometa",
  branch_id: null,
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

const reading: ManualReading = {
  flyer_id: flyer.id,
  file_url: flyer.file_url,
  read_at: "2026-09-29",
  reader: "leitura manual do encarte (Claude Code)",
  offers: [
    { name: "Açúcar cristal", brand: "Samuka", size: "1kg", promotional_price: 2.79, regular_price: 3.35, unit: "un", category_slug: "alimentos", conditions: null },
    // Vírgula perdida: descartada pela mesma validação da leitura automática.
    { name: "Arroz", brand: "Célia", size: "1kg", promotional_price: 405, regular_price: null, unit: "un", category_slug: "alimentos", conditions: null },
  ],
};

describe("applyManualReadings", () => {
  it("grava as ofertas lidas no cache, validadas como as da API", () => {
    const cache: OffersCache = {};
    const result = applyManualReadings(cache, [reading], [flyer], mock.mockCategories);

    expect(result.applied).toEqual([{ flyer, offers: 1, discarded: 1 }]);
    expect(cache[flyer.id]).toMatchObject({ file_url: flyer.file_url, extracted_at: "2026-09-29", model: reading.reader });
    expect(cache[flyer.id]!.offers[0]).toMatchObject({
      id: "cometa-encarte-512-oferta-1",
      name: "Açúcar cristal Samuka",
      origin: "encarte",
      category_id: "cat-alimentos",
      promotional_price: 2.79,
      regular_price: 3.35,
    });
  });

  it("encarte exclusivo de uma loja: a restrição vai nas condições de cada oferta", () => {
    const cache: OffersCache = {};
    const montese = { ...flyer, description: "Ofertas válidas de 29/09 a 05/10 somente para a loja Montese." };
    const exceto = { ...reading.offers[0]!, conditions: "exceto zero lactose" };
    applyManualReadings(cache, [{ ...reading, offers: [reading.offers[0]!, exceto] }], [montese], mock.mockCategories);
    expect(cache[flyer.id]!.offers.map((offer) => offer.conditions)).toEqual([
      "Somente na loja Montese",
      "exceto zero lactose; Somente na loja Montese",
    ]);
  });

  it("ignora leitura de encarte que trocou de arquivo ou saiu do ar", () => {
    const cache: OffersCache = {};
    const trocado = { ...flyer, file_url: "https://adminx.cometasupermercados.com.br/uploads/novo.pdf" };
    expect(applyManualReadings(cache, [reading], [trocado], mock.mockCategories).stale).toEqual([reading]);
    expect(applyManualReadings(cache, [reading], [], mock.mockCategories).stale).toEqual([reading]);
    expect(cache).toEqual({});
  });
});

describe("leituras versionadas (src/data/leituras)", () => {
  const dir = path.resolve(__dirname, "../data/leituras");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((file) => file.endsWith(".json")) : [];
  const slugs = new Set(mock.mockCategories.map((category) => category.slug));

  it.each(files)("%s está no formato certo e sem preço implausível", (file) => {
    const parsed = ManualReadingSchema.parse(JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")));
    expect(file).toBe(`${parsed.flyer_id}.json`);
    for (const offer of parsed.offers) {
      expect(slugs.has(offer.category_slug), `${offer.name}: categoria ${offer.category_slug}`).toBe(true);
      if (offer.regular_price !== null) expect(offer.regular_price, offer.name).toBeGreaterThan(offer.promotional_price);
    }
    const { applied } = applyManualReadings({}, [parsed], [{ ...flyer, id: parsed.flyer_id, file_url: parsed.file_url }], mock.mockCategories);
    expect(applied[0]!.discarded).toBe(0);
  });
});
