-- Budega — metadados de importação de dados reais (packages/sources).
--
-- packages/shared/src/types/index.ts já tinha estes campos opcionais (usados pelos
-- adaptadores de packages/sources desde o Cometa/Frangolândia/Super Lagoa), mas o schema
-- do banco nunca ganhou as colunas correspondentes — passou despercebido porque os dados
-- de demonstração (mock) nunca preenchem esses campos. Sem RLS nova: só colunas
-- opcionais/com default, não mudam nenhuma política existente.

alter table markets
  add column website_url text,
  add column coordinates_approximate boolean not null default false;

alter table branches
  add column coordinates_approximate boolean not null default false;

alter table flyers
  add column description text,
  add column cover_url text,
  add column source_url text;
