#!/usr/bin/env tsx
/**
 * Envia os dados de demonstração de packages/shared/src/mock para um projeto Supabase
 * real, usando a service role key (que ignora RLS). Não afeta o modo mock local — o
 * app web/mobile continua funcionando com os mesmos dados mesmo sem rodar este script.
 *
 * Uso:
 *   $env:SUPABASE_URL = "https://xxxx.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY = "..."
 *   pnpm --filter @budega/supabase seed
 */
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { mock } from "@budega/shared";

const { mockBranches, mockCategories, mockFlyers, mockMarkets, mockOffers } = mock;

/**
 * Os IDs do mock (ex.: "mkt-bompreco-pinheiros") são legíveis, mas a coluna `id` do
 * Postgres é `uuid`. Convertemos cada slug para um UUID determinístico (mesmo slug ⇒
 * sempre o mesmo UUID), preservando as relações de chave estrangeira entre as tabelas.
 */
function toUuid(slug: string): string {
  const hash = createHash("md5").update(slug).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.log(`
SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY não configuradas — nada foi enviado.

Para popular um projeto Supabase real com os dados de demonstração:
  1. Rode as migrations primeiro: pnpm --filter @budega/supabase migrate
  2. Em "Project Settings > API", copie a "Project URL" e a "service_role key"
     (NUNCA exponha a service_role key no cliente/frontend).
  3. Exporte as variáveis e rode o comando novamente:

     $env:SUPABASE_URL = "https://xxxx.supabase.co"
     $env:SUPABASE_SERVICE_ROLE_KEY = "sua-service-role-key"
     pnpm --filter @budega/supabase seed

O app web e mobile continuam funcionando em modo mock (mesmos dados, direto de
packages/shared/src/mock) sem precisar deste passo.
`);
  process.exit(0);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

async function upsert(table: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`Falha ao popular "${table}": ${error.message}`);
  console.log(`- ${table}: ${rows.length} registro(s) enviados.`);
}

async function main() {
  console.log("Populando Supabase com dados de demonstração do Budega...\n");

  await upsert(
    "categories",
    mockCategories.map(({ id, name, slug, icon, sort_order, created_at }) => ({
      id: toUuid(id),
      name,
      slug,
      icon,
      sort_order,
      created_at,
    })),
  );

  await upsert(
    "markets",
    mockMarkets.map((market) => ({
      ...market,
      id: toUuid(market.id),
      owner_id: null,
      is_suspended: false,
    })),
  );

  await upsert(
    "branches",
    mockBranches.map((branch) => ({
      ...branch,
      id: toUuid(branch.id),
      market_id: toUuid(branch.market_id),
    })),
  );

  await upsert(
    "flyers",
    mockFlyers.map((flyer) => ({
      ...flyer,
      id: toUuid(flyer.id),
      market_id: toUuid(flyer.market_id),
      branch_id: flyer.branch_id ? toUuid(flyer.branch_id) : null,
    })),
  );

  await upsert(
    "offers",
    mockOffers.map((offer) => ({
      ...offer,
      id: toUuid(offer.id),
      market_id: toUuid(offer.market_id),
      branch_id: offer.branch_id ? toUuid(offer.branch_id) : null,
      category_id: toUuid(offer.category_id),
    })),
  );

  console.log("\nSeed concluído.");
}

main().catch((error) => {
  console.error("\nErro ao popular o banco:", error.message);
  process.exit(1);
});
