#!/usr/bin/env node
/**
 * Aplica as migrations SQL de packages/supabase/migrations em ordem, usando uma
 * conexão Postgres direta (DATABASE_URL). Não depende da Supabase CLI.
 *
 * Uso:
 *   DATABASE_URL="postgresql://postgres:senha@db.xxxx.supabase.co:5432/postgres" \
 *     pnpm --filter @budega/supabase migrate
 *
 * Se DATABASE_URL não estiver definida, o script explica como configurá-la e
 * termina sem erro (modo mock continua funcionando sem banco real).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, "..", "migrations");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log(`
Nenhuma DATABASE_URL configurada — nada foi executado.

Para rodar as migrations num projeto Supabase real:
  1. Crie um projeto em https://supabase.com.
  2. Em "Project Settings > Database", copie a "Connection string" (modo "URI").
  3. Exporte a variável e rode o comando novamente, por exemplo:

     $env:DATABASE_URL = "postgresql://postgres:SENHA@db.xxxx.supabase.co:5432/postgres"
     pnpm --filter @budega/supabase migrate

O app web e mobile continuam funcionando em modo mock (dados de demonstração em
packages/shared/src/mock) sem precisar de um banco real.
`);
  process.exit(0);
}

const { Client } = await import("pg");
const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

await client.connect();

try {
  await client.query(`
    create table if not exists _migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const { rows: appliedRows } = await client.query("select name from _migrations");
  const applied = new Set(appliedRows.map((row) => row.name));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`- ${file} (já aplicada, pulando)`);
      continue;
    }
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`- Aplicando ${file}...`);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into _migrations (name) values ($1)", [file]);
      await client.query("commit");
      console.log(`  OK`);
    } catch (error) {
      await client.query("rollback");
      throw new Error(`Falha ao aplicar ${file}: ${error.message}`);
    }
  }

  console.log("\nMigrations concluídas.");
} finally {
  await client.end();
}
