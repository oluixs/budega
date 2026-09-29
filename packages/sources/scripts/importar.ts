#!/usr/bin/env tsx
/**
 * Importa mercados, lojas e encartes dos sites oficiais das redes configuradas em
 * src/import.ts (ADAPTERS) e grava o retrato em packages/shared/src/data/regional.json,
 * que a web e o app usam quando não há Supabase configurado.
 *
 * Uso: pnpm importar   (na raiz do monorepo)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { RegionalData } from "@budega/shared";
import { createHttpClient } from "../src/http";
import { importRegional } from "../src/import";

const here = path.dirname(fileURLToPath(import.meta.url));
const snapshotPath = path.resolve(here, "../../shared/src/data/regional.json");

function readPrevious(): RegionalData | null {
  try {
    const data = JSON.parse(fs.readFileSync(snapshotPath, "utf8")) as RegionalData;
    return data.markets.length ? data : null;
  } catch {
    return null;
  }
}

async function main() {
  const previous = readPrevious();
  const data = await importRegional({
    http: createHttpClient(),
    previous,
    log: (message) => console.log(message),
  });

  if (data.markets.length === 0) {
    console.error("\nNenhuma fonte respondeu e não há importação anterior — retrato NÃO foi alterado.");
    process.exit(1);
  }

  fs.writeFileSync(snapshotPath, `${JSON.stringify(data, null, 2)}\n`);
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
