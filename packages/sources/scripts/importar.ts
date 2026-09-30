#!/usr/bin/env tsx
/**
 * Importa mercados, lojas e encartes dos sites oficiais das redes configuradas em
 * src/import.ts (ADAPTERS) e grava o retrato em packages/shared/src/data/regional.json,
 * que a web e o app usam quando não há Supabase configurado.
 *
 * Uso (na raiz do monorepo):
 *   pnpm importar              lojas e encartes (sem custo) + ofertas das leituras manuais
 *                              (src/data/leituras/*.json, transcritas olhando o encarte)
 *   pnpm importar --ofertas    também lê produtos e preços dos encartes NOVOS com a API
 *                              do Claude (tem custo; precisa de credencial da Anthropic —
 *                              ANTHROPIC_API_KEY ou `ant auth login`)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { mock, type RegionalData } from "@budega/shared";
import { createNominatimGeocoder, type GeocodeCache } from "../src/geocode";
import { createHttpClient } from "../src/http";
import { importRegional } from "../src/import";
import { cachedOffers, flyersToExtract, pruneCache, type OffersCache } from "../src/offers/cache";
import { extractOffersFromFlyer, OFFER_EXTRACTION_MODEL } from "../src/offers/extract";
import { applyManualReadings, ManualReadingSchema, type ManualReading } from "../src/offers/manual";

const here = path.dirname(fileURLToPath(import.meta.url));
const snapshotPath = path.resolve(here, "../../shared/src/data/regional.json");
const geocodeCachePath = path.resolve(here, "../src/data/geocode-cache.json");
const offersCachePath = path.resolve(here, "../src/data/offers-cache.json");
const readingsDir = path.resolve(here, "../src/data/leituras");

const readJson = <T>(file: string, fallback: T): T => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
};
const writeJson = (file: string, value: unknown) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

// Preço por milhão de tokens do modelo de extração (US$) — só para estimar o gasto no log.
const PRICE_PER_MTOK = { input: 4, output: 20 };

function loadManualReadings(): ManualReading[] {
  if (!fs.existsSync(readingsDir)) return [];
  return fs
    .readdirSync(readingsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => ManualReadingSchema.parse(readJson(path.join(readingsDir, file), null)));
}

async function readOffers(data: RegionalData, cache: OffersCache): Promise<OffersCache> {
  const http = createHttpClient({ timeoutMs: 60_000 });
  const client = new Anthropic();
  const pending = flyersToExtract(cache, data.flyers);
  console.log(`\nLendo ofertas de ${pending.length} encarte(s) novo(s) com ${OFFER_EXTRACTION_MODEL}...`);

  const totals = { input: 0, output: 0 };
  // Um por vez: custo previsível e respeito aos sites de onde os arquivos são baixados.
  for (const flyer of pending) {
    try {
      const result = await extractOffersFromFlyer({ client, http, flyer, categories: mock.mockCategories });
      cache[flyer.id] = {
        file_url: flyer.file_url,
        extracted_at: new Date().toISOString(),
        model: OFFER_EXTRACTION_MODEL,
        offers: result.offers,
      };
      totals.input += result.usage.input_tokens;
      totals.output += result.usage.output_tokens;
      console.log(`  ${flyer.title}: ${result.offers.length} oferta(s)${result.discarded ? `, ${result.discarded} descartada(s)` : ""}`);
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) {
        console.error("  Sem credencial válida da Anthropic (ANTHROPIC_API_KEY ou `ant auth login`) — leitura interrompida.");
        break;
      }
      if (error instanceof Anthropic.RateLimitError) {
        console.error("  Limite de uso da API atingido — tente de novo mais tarde.");
        break;
      }
      // Encarte com problema não impede os demais; tenta de novo na próxima execução.
      console.error(`  ${flyer.title}: falhou (${error instanceof Error ? error.message : String(error)})`);
    }
  }
  const cost = (totals.input * PRICE_PER_MTOK.input + totals.output * PRICE_PER_MTOK.output) / 1_000_000;
  console.log(`  Tokens: ${totals.input} entrada, ${totals.output} saída — custo estimado US$ ${cost.toFixed(2)}`);
  return cache;
}

async function main() {
  const previous = readJson<RegionalData | null>(snapshotPath, null);
  // Só endereços que ainda não estão no cache vão ao Nominatim (1 por segundo).
  const geocodeCache = readJson<GeocodeCache>(geocodeCachePath, {});
  let offersCache = readJson<OffersCache>(offersCachePath, {});

  const data = await importRegional({
    http: createHttpClient(),
    previous: previous?.markets.length ? previous : null,
    offersCache,
    geocode: createNominatimGeocoder({ cache: geocodeCache, log: (message) => console.log(message) }),
    log: (message) => console.log(message),
  });
  writeJson(geocodeCachePath, Object.fromEntries(Object.entries(geocodeCache).sort(([a], [b]) => a.localeCompare(b))));

  if (data.markets.length === 0) {
    console.error("\nNenhuma fonte respondeu e não há importação anterior — retrato NÃO foi alterado.");
    process.exit(1);
  }

  const manual = applyManualReadings(offersCache, loadManualReadings(), data.flyers, mock.mockCategories);
  if (manual.applied.length || manual.stale.length) console.log("\nLeituras manuais:");
  for (const { flyer, offers, discarded } of manual.applied) {
    console.log(`  ${flyer.title}: ${offers} oferta(s)${discarded ? `, ${discarded} descartada(s)` : ""}`);
  }
  for (const reading of manual.stale) {
    console.warn(`  ${reading.flyer_id}: encarte saiu do ar ou trocou de arquivo — leitura ignorada (ler o novo)`);
  }
  const unread = data.flyers.filter((flyer) => !offersCache[flyer.id] || offersCache[flyer.id]!.file_url !== flyer.file_url);
  if (unread.length) console.log(`  Encartes sem leitura: ${unread.map((flyer) => flyer.id).join(", ")}`);

  if (process.argv.includes("--ofertas")) offersCache = await readOffers(data, offersCache);
  const imported = data.offers;
  data.offers = data.flyers.flatMap(
    (flyer) => cachedOffers(offersCache, flyer) ?? imported.filter((offer) => offer.flyer_id === flyer.id),
  );
  writeJson(offersCachePath, pruneCache(offersCache, data.flyers));

  writeJson(snapshotPath, data);
  console.log(
    `\nRetrato salvo em ${path.relative(process.cwd(), snapshotPath)}: ` +
      `${data.markets.length} mercado(s), ${data.branches.length} loja(s), ` +
      `${data.flyers.length} encarte(s), ${data.offers.length} oferta(s).`,
  );
  if (data.sources.some((source) => source.error)) process.exitCode = 2;
}

main().catch((error) => {
  console.error("Falha na importação:", error);
  process.exit(1);
});
