import type { Branch, DataSource, Flyer, Market } from "@budega/shared";
import type { Geocoder } from "./geocode";
import type { HttpClient } from "./http";

/** Resultado de uma fonte (um mercado/rede) importada do site oficial. */
export interface SourceResult {
  source: DataSource;
  market: Market;
  branches: Branch[];
  flyers: Flyer[];
  /** Problemas não fatais (ex.: encarte sem período reconhecível). */
  warnings: string[];
}

export interface SourceContext {
  http: HttpClient;
  now: Date;
  /** Para redes que publicam endereço sem coordenadas (ver geocode.ts). */
  geocode: Geocoder;
}

export interface SourceAdapter {
  /** Igual ao id do mercado gerado (estável entre importações). */
  id: string;
  name: string;
  websiteUrl: string;
  fetch(context: SourceContext): Promise<SourceResult>;
}
