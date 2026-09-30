-- Budega — metadados de origem das ofertas (packages/sources).
--
-- packages/shared/src/types/index.ts já tinha `flyer_id` e `origin` opcionais na oferta
-- (usados pela leitura de ofertas dos encartes, manual ou pela API — ver
-- packages/sources/src/offers/), mas o schema do banco nunca ganhou as colunas
-- correspondentes, pelo mesmo motivo da 0004_source_metadata: os dados de demonstração
-- (mock) nunca preenchem esses campos, então passou despercebido até a primeira
-- sincronização de ofertas reais (`pnpm --filter @budega/supabase sync:regional`) falhar
-- com "Could not find the 'flyer_id' column of 'offers'". Sem RLS nova: só colunas
-- opcionais/com default, não mudam nenhuma política existente.

alter table offers
  add column flyer_id uuid references flyers (id) on delete set null,
  add column origin text not null default 'manual' check (origin in ('manual', 'encarte'));

comment on column offers.flyer_id is
  'Encarte de onde a oferta foi lida (transcrita à mão ou pela API); null = cadastrada direto pelo mercado.';
comment on column offers.origin is
  '''manual'': cadastrada direto pelo mercado/admin. ''encarte'': transcrita de um encarte — a interface avisa para conferir no original.';
