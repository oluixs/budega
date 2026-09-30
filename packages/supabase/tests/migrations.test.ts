import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { beforeAll, describe, expect, it } from "vitest";
import { buildSeedRows } from "../scripts/seed-rows";

/**
 * Roda as migrations reais num Postgres em processo (PGlite) com um stub do que o
 * Supabase fornece (tests/supabase-stub.sql) e testa as políticas RLS como as roles
 * anon/authenticated do PostgREST. Não precisa de credenciais nem de rede.
 */

const migrationsDir = path.resolve(__dirname, "..", "migrations");
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

const USER_ID = "00000000-0000-4000-8000-000000000001";
const OTHER_USER_ID = "00000000-0000-4000-8000-000000000002";
const ADMIN_ID = "00000000-0000-4000-8000-00000000000a";

type Role = "anon" | "authenticated";

let db: PGlite;

/** Executa `fn` como o PostgREST faria para um request anônimo ou de `userId`. */
async function as<T>(role: Role, userId: string | null, fn: () => Promise<T>): Promise<T> {
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId ?? ""]);
  await db.exec(`set role ${role}`);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub', '', false)");
  }
}

function rejects(promise: Promise<unknown>) {
  return expect(promise).rejects.toThrow();
}

async function insertRows(table: string, rows: Record<string, unknown>[]) {
  for (const row of rows) {
    const columns = Object.keys(row);
    const values = columns.map((column) => {
      const value = row[column];
      return Array.isArray(value) ? JSON.stringify(value) : value;
    });
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
    await db.query(`insert into ${table} (${columns.join(", ")}) values (${placeholders})`, values);
  }
}

beforeAll(async () => {
  db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(fs.readFileSync(path.resolve(__dirname, "supabase-stub.sql"), "utf8"));
  // Mesmo passo que scripts/run-migrations.mjs faz antes de aplicar os arquivos.
  await db.exec("create table _migrations (name text primary key, applied_at timestamptz not null default now())");
  for (const file of migrationFiles) {
    await db.exec(fs.readFileSync(path.join(migrationsDir, file), "utf8"));
  }

  // Usuários: o trigger on_auth_user_created cria os perfis.
  await db.query(
    `insert into auth.users (id, email, raw_user_meta_data) values
       ($1, 'user@example.com', '{"name":"Usuária"}'),
       ($2, 'other@example.com', '{"name":"Outro"}'),
       ($3, 'admin@example.com', '{"name":"Admin"}')`,
    [USER_ID, OTHER_USER_ID, ADMIN_ID],
  );
  // Promoção do admin inicial via papel confiável (SQL Editor / postgres).
  await db.query("update profiles set role = 'admin' where id = $1", [ADMIN_ID]);

  // Dados de demonstração — os mesmos que scripts/run-seed.ts envia.
  const rows = buildSeedRows();
  await insertRows("categories", rows.categories);
  await insertRows("markets", rows.markets);
  await insertRows("branches", rows.branches);
  await insertRows("flyers", rows.flyers);
  await insertRows("offers", rows.offers);
}, 60_000);

describe("migrations", () => {
  it("aplicam em ordem num Postgres limpo e criam as políticas", async () => {
    expect(migrationFiles[0]).toBe("0001_init.sql");
    const { rows } = await db.query<{ n: number }>("select count(*)::int as n from pg_policies");
    expect(rows[0]!.n).toBeGreaterThan(20);
  });

  it("aceitam todos os dados de demonstração do seed", async () => {
    const seed = buildSeedRows();
    const { rows } = await db.query<{ n: number }>("select count(*)::int as n from offers");
    expect(rows[0]!.n).toBe(seed.offers.length);
  });

  it("habilitam RLS em _migrations", async () => {
    const { rows } = await db.query<{ relrowsecurity: boolean }>(
      "select relrowsecurity from pg_class where relname = '_migrations'",
    );
    expect(rows[0]!.relrowsecurity).toBe(true);
  });
});

describe("profiles", () => {
  it("usuário comum NÃO consegue se promover a admin", async () => {
    await rejects(as("authenticated", USER_ID, () => db.query("update profiles set role = 'admin' where id = auth.uid()")));
    const { rows } = await db.query<{ role: string }>("select role from profiles where id = $1", [USER_ID]);
    expect(rows[0]!.role).toBe("user");
  });

  it("usuário comum pode editar o próprio nome", async () => {
    await as("authenticated", USER_ID, () => db.query("update profiles set name = 'Novo nome' where id = auth.uid()"));
    const { rows } = await db.query<{ name: string }>("select name from profiles where id = $1", [USER_ID]);
    expect(rows[0]!.name).toBe("Novo nome");
  });

  it("admin pode promover outro usuário a gerente de mercado", async () => {
    await as("authenticated", ADMIN_ID, () =>
      db.query("update profiles set role = 'market_manager' where id = $1", [OTHER_USER_ID]),
    );
    const { rows } = await db.query<{ role: string }>("select role from profiles where id = $1", [OTHER_USER_ID]);
    expect(rows[0]!.role).toBe("market_manager");
  });
});

describe("admin_list_users (0003)", () => {
  it("admin lista usuários com e-mail e role", async () => {
    const { rows } = await as("authenticated", ADMIN_ID, () =>
      db.query<{ email: string; role: string }>("select email, role from admin_list_users()"),
    );
    expect(rows.map((row) => row.email)).toEqual(
      expect.arrayContaining(["user@example.com", "other@example.com", "admin@example.com"]),
    );
  });

  it("usuário comum e anônimo NÃO listam usuários (e-mails ficam protegidos)", async () => {
    await rejects(as("authenticated", USER_ID, () => db.query("select * from admin_list_users()")));
    await rejects(as("anon", null, () => db.query("select * from admin_list_users()")));
  });

  it("admin atribui mercado a um responsável; o próprio responsável não consegue", async () => {
    const seed = buildSeedRows();
    const marketId = seed.markets[1]!.id;
    // Sem ser dono, o RLS nem enxerga a linha para UPDATE: 0 linhas alteradas.
    const attempt = await as("authenticated", OTHER_USER_ID, () =>
      db.query("update markets set owner_id = $1 where id = $2", [OTHER_USER_ID, marketId]),
    );
    expect(attempt.affectedRows ?? 0).toBe(0);

    await as("authenticated", ADMIN_ID, () =>
      db.query("update markets set owner_id = $1 where id = $2", [OTHER_USER_ID, marketId]),
    );
    const { rows } = await db.query<{ owner_id: string }>("select owner_id from markets where id = $1", [marketId]);
    expect(rows[0]!.owner_id).toBe(OTHER_USER_ID);
  });
});

describe("markets", () => {
  const newMarket = (overrides: Record<string, unknown> = {}) => ({
    name: "Mercado Teste",
    slug: `mercado-teste-${Math.random().toString(36).slice(2, 8)}`,
    address: "Rua A, 1",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    postal_code: "01000-000",
    latitude: -23.55,
    longitude: -46.63,
    ...overrides,
  });

  async function insertMarketAs(userId: string, market: Record<string, unknown>) {
    const columns = Object.keys(market);
    return as("authenticated", userId, () =>
      db.query<{ id: string }>(
        `insert into markets (${columns.join(", ")}) values (${columns.map((_, i) => `$${i + 1}`).join(", ")}) returning id`,
        Object.values(market),
      ),
    );
  }

  it("usuário cadastra mercado próprio, não verificado", async () => {
    const { rows } = await insertMarketAs(USER_ID, newMarket({ owner_id: USER_ID }));
    expect(rows).toHaveLength(1);
  });

  it("usuário NÃO cadastra mercado em nome de outro dono", async () => {
    await rejects(insertMarketAs(USER_ID, newMarket({ owner_id: OTHER_USER_ID })));
  });

  it("usuário NÃO cadastra mercado já verificado ou destacado", async () => {
    await rejects(insertMarketAs(USER_ID, newMarket({ owner_id: USER_ID, is_verified: true })));
    await rejects(insertMarketAs(USER_ID, newMarket({ owner_id: USER_ID, is_featured: true })));
  });

  it("dono NÃO se auto-verifica nem reativa mercado suspenso, mas edita dados comuns", async () => {
    const { rows } = await insertMarketAs(USER_ID, newMarket({ owner_id: USER_ID }));
    const marketId = rows[0]!.id;

    await rejects(as("authenticated", USER_ID, () => db.query("update markets set is_verified = true where id = $1", [marketId])));
    await as("authenticated", USER_ID, () => db.query("update markets set phone = '1130000000' where id = $1", [marketId]));

    await as("authenticated", ADMIN_ID, () => db.query("update markets set is_suspended = true where id = $1", [marketId]));
    await rejects(as("authenticated", USER_ID, () => db.query("update markets set is_suspended = false where id = $1", [marketId])));

    const { rows: after } = await db.query<{ is_verified: boolean; is_suspended: boolean; phone: string }>(
      "select is_verified, is_suspended, phone from markets where id = $1",
      [marketId],
    );
    expect(after[0]).toEqual({ is_verified: false, is_suspended: true, phone: "1130000000" });
  });

  it("mercado suspenso some para o público junto com filiais, ofertas e encartes", async () => {
    const seed = buildSeedRows();
    const marketId = seed.markets[0]!.id;
    const count = async (role: Role, userId: string | null) =>
      as(role, userId, async () => {
        const q = async (table: string, column: string) =>
          (await db.query<{ n: number }>(`select count(*)::int as n from ${table} where ${column} = $1`, [marketId])).rows[0]!.n;
        return {
          markets: await q("markets", "id"),
          branches: await q("branches", "market_id"),
          offers: await q("offers", "market_id"),
        };
      });

    const before = await count("anon", null);
    expect(before.markets).toBe(1);
    expect(before.offers).toBeGreaterThan(0);

    await db.query("update markets set is_suspended = true where id = $1", [marketId]);
    try {
      expect(await count("anon", null)).toEqual({ markets: 0, branches: 0, offers: 0 });
      // Admin continua vendo tudo (inclusive ofertas pausadas/vencidas, que o público
      // já não via antes da suspensão).
      const { rows } = await db.query<{ n: number }>("select count(*)::int as n from offers where market_id = $1", [marketId]);
      const adminView = await count("authenticated", ADMIN_ID);
      expect(adminView.markets).toBe(1);
      expect(adminView.offers).toBe(rows[0]!.n);
    } finally {
      await db.query("update markets set is_suspended = false where id = $1", [marketId]);
    }
  });
});

describe("metadados de importação (0004)", () => {
  it("markets/branches/flyers aceitam os campos opcionais dos adaptadores de packages/sources", async () => {
    const seed = buildSeedRows();
    const marketId = seed.markets[0]!.id;
    await db.query("update markets set website_url = $1, coordinates_approximate = true where id = $2", [
      "https://exemplo.com.br",
      marketId,
    ]);
    await db.query(
      "insert into branches (market_id, name, address, neighborhood, city, state, postal_code, latitude, longitude, coordinates_approximate) values ($1, 'Filial teste', 'Rua B, 2', 'Centro', 'Fortaleza', 'CE', '60000-000', -3.73, -38.52, true)",
      [marketId],
    );
    await db.query(
      "insert into flyers (market_id, title, file_url, file_type, valid_from, valid_until, description, cover_url, source_url) values ($1, 'Encarte teste', 'https://exemplo.com.br/encarte.pdf', 'pdf', now(), now() + interval '1 day', 'obs', 'https://exemplo.com.br/capa.jpg', 'https://exemplo.com.br/encartes/1')",
      [marketId],
    );

    const { rows } = await db.query<{ website_url: string; coordinates_approximate: boolean }>(
      "select website_url, coordinates_approximate from markets where id = $1",
      [marketId],
    );
    expect(rows[0]).toEqual({ website_url: "https://exemplo.com.br", coordinates_approximate: true });
  });
});

describe("offers", () => {
  it("anônimo NÃO cria oferta", async () => {
    const seed = buildSeedRows();
    await rejects(
      as("anon", null, () =>
        db.query(
          `insert into offers (market_id, category_id, name, promotional_price, unit, valid_from, valid_until)
           values ($1, $2, 'Oferta pirata', 1, 'un', now(), now() + interval '1 day')`,
          [seed.markets[0]!.id, seed.categories[0]!.id],
        ),
      ),
    );
  });

  it("usuário comum NÃO altera oferta de mercado alheio (RLS filtra, 0 linhas)", async () => {
    const seed = buildSeedRows();
    const offerId = seed.offers[0]!.id;
    const result = await as("authenticated", USER_ID, () =>
      db.query("update offers set promotional_price = 0.01 where id = $1", [offerId]),
    );
    expect(result.affectedRows ?? 0).toBe(0);
  });
});

describe("reports", () => {
  it("anônimo denuncia normalmente", async () => {
    const seed = buildSeedRows();
    await as("anon", null, () =>
      db.query("insert into reports (offer_id, reason) values ($1, 'preco_incorreto')", [seed.offers[0]!.id]),
    );
  });

  it("anônimo NÃO forja status nem autor da denúncia", async () => {
    await rejects(as("anon", null, () => db.query("insert into reports (reason, status) values ('oferta_vencida', 'resolved')")));
    await rejects(
      as("anon", null, () => db.query("insert into reports (reason, user_id) values ('oferta_vencida', $1)", [USER_ID])),
    );
  });

  it("usuário logado denuncia em seu próprio nome", async () => {
    await as("authenticated", USER_ID, () =>
      db.query("insert into reports (reason, user_id) values ('oferta_vencida', $1)", [USER_ID]),
    );
  });
});
