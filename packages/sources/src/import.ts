import type { Offer, RegionalData } from "@budega/shared";
import { cometaAdapter } from "./adapters/cometa";
import type { HttpClient } from "./http";
import type { SourceAdapter } from "./types";

/** Fontes ativas. Para adicionar uma rede: criar o adaptador em ./adapters e incluir aqui. */
export const ADAPTERS: SourceAdapter[] = [cometaAdapter];

export const REGION = {
  name: "Fortaleza e Região Metropolitana",
  center: { latitude: -3.7319, longitude: -38.5267 },
};

export interface ImportOptions {
  http: HttpClient;
  now?: Date;
  adapters?: SourceAdapter[];
  /** Retrato anterior: usado quando uma fonte falha, para não sumir com o mercado. */
  previous?: RegionalData | null;
  /** Ofertas lidas dos encartes (ver offers/), por id de encarte. */
  offersByFlyer?: Map<string, Offer[]>;
  log?: (message: string) => void;
}

export async function importRegional({
  http,
  now = new Date(),
  adapters = ADAPTERS,
  previous = null,
  offersByFlyer,
  log = () => {},
}: ImportOptions): Promise<RegionalData> {
  const data: RegionalData = {
    region: REGION,
    generated_at: now.toISOString(),
    sources: [],
    markets: [],
    branches: [],
    flyers: [],
    offers: [],
  };

  const results = await Promise.allSettled(adapters.map((adapter) => adapter.fetch(http, now)));

  results.forEach((result, index) => {
    const adapter = adapters[index]!;
    if (result.status === "fulfilled") {
      const { source, market, branches, flyers, warnings } = result.value;
      for (const warning of warnings) log(`[${adapter.id}] aviso: ${warning}`);
      log(`[${adapter.id}] ok: ${branches.length} loja(s), ${flyers.length} encarte(s)`);
      data.sources.push(source);
      data.markets.push(market);
      data.branches.push(...branches);
      data.flyers.push(...flyers);
      return;
    }

    const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
    log(`[${adapter.id}] ERRO: ${message} — mantendo os dados da última importação`);
    const old = previous?.sources.find((source) => source.market_id === adapter.id);
    data.sources.push({
      market_id: adapter.id,
      name: adapter.name,
      website_url: adapter.websiteUrl,
      fetched_at: old?.fetched_at ?? "",
      error: message,
    });
    if (previous) {
      data.markets.push(...previous.markets.filter((market) => market.id === adapter.id));
      data.branches.push(...previous.branches.filter((branch) => branch.market_id === adapter.id));
      data.flyers.push(...previous.flyers.filter((flyer) => flyer.market_id === adapter.id));
    }
  });

  // Ofertas acompanham os encartes que continuam no ar: leitura nova do encarte substitui
  // a anterior; sem leitura nova, mantém a anterior; encarte que saiu do ar leva as suas.
  data.offers = data.flyers.flatMap(
    (flyer) => offersByFlyer?.get(flyer.id) ?? previous?.offers.filter((offer) => offer.flyer_id === flyer.id) ?? [],
  );

  return data;
}
