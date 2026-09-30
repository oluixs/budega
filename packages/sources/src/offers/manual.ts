import { z } from "zod";
import type { Category, Flyer } from "@budega/shared";
import type { OffersCache } from "./cache";
import { ExtractedOfferSchema, toFlyerOffers } from "./extract";

/**
 * Leituras manuais de encartes (src/data/leituras/*.json): produtos e preços transcritos
 * olhando o encarte publicado no site do mercado, sem chamar a API. Passam pela mesma
 * validação da leitura automática (toFlyerOffers) e entram no cache de ofertas.
 *
 * Cada leitura vale só para o arquivo lido (`file_url`): se o mercado trocar o encarte, a
 * leitura fica velha e é ignorada — é preciso ler o encarte novo.
 */
export const ManualReadingSchema = z.object({
  flyer_id: z.string().min(1),
  file_url: z.string().url(),
  /** Dia da leitura (AAAA-MM-DD). */
  read_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Quem leu (aparece no campo `model` do cache). */
  reader: z.string().min(1),
  note: z.string().optional(),
  offers: z.array(ExtractedOfferSchema).min(1),
});
export type ManualReading = z.infer<typeof ManualReadingSchema>;

export interface ManualReadingsResult {
  /** Encartes cujas ofertas vieram de leitura manual. */
  applied: { flyer: Flyer; offers: number; discarded: number }[];
  /** Leituras de encartes que saíram do ar ou trocaram de arquivo. */
  stale: ManualReading[];
}

export function applyManualReadings(
  cache: OffersCache,
  readings: ManualReading[],
  flyers: Flyer[],
  categories: Category[],
): ManualReadingsResult {
  const result: ManualReadingsResult = { applied: [], stale: [] };
  for (const reading of readings) {
    const flyer = flyers.find((candidate) => candidate.id === reading.flyer_id);
    if (!flyer || flyer.file_url !== reading.file_url) {
      result.stale.push(reading);
      continue;
    }
    const { offers, discarded } = toFlyerOffers(flyer, reading.offers, categories);
    cache[flyer.id] = { file_url: flyer.file_url, extracted_at: reading.read_at, model: reading.reader, offers };
    result.applied.push({ flyer, offers: offers.length, discarded });
  }
  return result;
}
