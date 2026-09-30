#!/usr/bin/env tsx
/**
 * Envia o retrato real da região (packages/shared/src/data/regional.json, gerado por
 * `pnpm importar`) para um projeto Supabase real, usando a service role key (ignora
 * RLS — o mesmo padrão de scripts/run-seed.ts, mas com dados reais dos sites oficiais
 * em vez dos dados de demonstração). Categorias continuam fixas do app (mock), pois não
 * vêm dos sites dos mercados.
 *
 * Uso:
 *   $env:SUPABASE_URL = "https://xxxx.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY = "..."
 *   pnpm --filter @budega/supabase sync:regional
 */
import { createClient } from "@supabase/supabase-js";
import { mock, regionalSnapshot } from "@budega/shared";
import { toUuid } from "./seed-rows";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.log(`
SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY não configuradas — nada foi enviado.

Para popular um projeto Supabase real com os dados reais da região (importados dos
sites oficiais em packages/sources):
  1. Rode as migrations primeiro: pnpm --filter @budega/supabase migrate
  2. Rode a importação, se ainda não tiver rodado: pnpm importar
  3. Em "Project Settings > API", copie a "Project URL" e a "service_role key"
     (NUNCA exponha a service_role key no cliente/frontend).
  4. Exporte as variáveis e rode o comando novamente:

     $env:SUPABASE_URL = "https://xxxx.supabase.co"
     $env:SUPABASE_SERVICE_ROLE_KEY = "sua-service-role-key"
     pnpm --filter @budega/supabase sync:regional
`);
  process.exit(0);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

async function upsert(table: string, rows: Record<string, unknown>[], onConflict = "id") {
  if (rows.length === 0) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`Falha ao popular "${table}": ${error.message}`);
  console.log(`- ${table}: ${rows.length} registro(s) enviados.`);
}

async function main() {
  console.log(
    `Enviando retrato real da região (gerado em ${regionalSnapshot.generated_at}) para o Supabase...\n`,
  );

  if (regionalSnapshot.markets.length === 0) {
    console.error("regional.json não tem nenhum mercado — rode `pnpm importar` antes.");
    process.exit(1);
  }

  // Categorias são fixas do app (não vêm dos sites); precisam existir antes das ofertas
  // por causa da FK categories(id).
  await upsert(
    "categories",
    mock.mockCategories.map(({ id, name, slug, icon, sort_order, created_at }) => ({
      id: toUuid(id),
      name,
      slug,
      icon,
      sort_order,
      created_at,
    })),
  );

  // PostgREST normaliza as colunas de um upsert em lote pelo conjunto de chaves
  // presentes em TODAS as linhas: se uma rede define `coordinates_approximate` e outra
  // não, a que não define recebe `null` em vez do default da coluna — por isso os
  // campos opcionais entram explícitos aqui, nunca omitidos.
  await upsert(
    "markets",
    regionalSnapshot.markets.map((market) => ({
      ...market,
      id: toUuid(market.id),
      owner_id: null,
      website_url: market.website_url ?? null,
      coordinates_approximate: market.coordinates_approximate ?? false,
    })),
  );
  await upsert(
    "branches",
    regionalSnapshot.branches.map((branch) => ({
      ...branch,
      id: toUuid(branch.id),
      market_id: toUuid(branch.market_id),
      coordinates_approximate: branch.coordinates_approximate ?? false,
    })),
  );
  await upsert(
    "flyers",
    regionalSnapshot.flyers.map((flyer) => ({
      ...flyer,
      id: toUuid(flyer.id),
      market_id: toUuid(flyer.market_id),
      branch_id: flyer.branch_id ? toUuid(flyer.branch_id) : null,
      description: flyer.description ?? null,
      cover_url: flyer.cover_url ?? null,
      source_url: flyer.source_url ?? null,
    })),
  );
  await upsert(
    "offers",
    regionalSnapshot.offers.map((offer) => ({
      ...offer,
      id: toUuid(offer.id),
      market_id: toUuid(offer.market_id),
      branch_id: offer.branch_id ? toUuid(offer.branch_id) : null,
      category_id: toUuid(offer.category_id),
      flyer_id: offer.flyer_id ? toUuid(offer.flyer_id) : null,
    })),
  );

  console.log("\nSincronização concluída.");
}

main().catch((error) => {
  console.error("\nErro ao sincronizar dados reais:", error.message);
  process.exit(1);
});
