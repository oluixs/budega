import type { Branch, DataSource, Flyer, Market } from "@budega/shared";
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

export interface SourceAdapter {
  /** Igual ao id do mercado gerado (estável entre importações). */
  id: string;
  name: string;
  websiteUrl: string;
  fetch(http: HttpClient, now: Date): Promise<SourceResult>;
}
