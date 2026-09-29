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
import { createClient } from "@supabase/supabase-js";
import { buildSeedRows } from "./seed-rows";

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

  const rows = buildSeedRows();
  // Ordem importa por causa das chaves estrangeiras.
  await upsert("categories", rows.categories);
  await upsert("markets", rows.markets);
  await upsert("branches", rows.branches);
  await upsert("flyers", rows.flyers);
  await upsert("offers", rows.offers);

  console.log("\nSeed concluído.");
}

main().catch((error) => {
  console.error("\nErro ao popular o banco:", error.message);
  process.exit(1);
});
