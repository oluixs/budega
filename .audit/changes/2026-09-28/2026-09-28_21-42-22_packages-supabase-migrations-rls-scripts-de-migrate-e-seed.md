# Registro de mudança — packages-supabase migrations RLS scripts de migrate e seed

- Data e hora: 2026-09-28 21:42:22 -03:00
- Agente/responsável: Claude Code
- Branch: master
- Commit: d8b6aa3
- Tipo: database
- Status: concluída

## O que foi alterado

Criado o pacote `packages/supabase` (`@budega/supabase`):
- `migrations/0001_init.sql`: enums (`user_role`, `flyer_status`, `report_reason`, etc.),
  tabelas `profiles`, `markets`, `branches`, `categories`, `flyers`, `offers`,
  `favorites`, `reports`, `analytics_events` (seção 8 do brief), índices (slug, geo,
  validade, destaque), funções `is_admin()`/`is_market_manager_of()`, trigger
  `handle_new_user` (cria `profiles` ao registrar em `auth.users`), e políticas RLS em
  todas as tabelas.
- Regras de RLS: mercados/filiais/categorias com leitura pública; ofertas e encartes só
  aparecem publicamente quando `is_active`/`status='active'` **e** dentro do período de
  validade (RN 10.2 e 10.3), mas gerente/admin do mercado sempre enxerga os próprios
  mesmo pausados/vencidos; favoritos só o dono autenticado vê/edita (favoritos anônimos
  continuam 100% locais via `packages/shared`, só sincronizam após login); denúncias
  exigem autenticação para criar, só admin revisa; eventos de analytics são
  insert-only para qualquer cliente e leitura restrita a admin.
- `scripts/run-migrations.mjs`: aplica as migrations via conexão Postgres direta
  (`DATABASE_URL`), sem depender da Supabase CLI; sem a variável, imprime instruções e
  sai com código 0 (não quebra o resto do fluxo).
- `scripts/run-seed.ts`: popula um projeto Supabase real com os mesmos dados de
  `packages/shared/src/mock` via `service_role key`, convertendo os IDs legíveis do
  mock (ex.: `mkt-bompreco-pinheiros`) em UUIDs determinísticos (hash MD5) para caber na
  coluna `uuid` e preservar as relações de chave estrangeira. Sem credenciais, imprime
  instruções e sai com código 0.
- `src/client.ts`: `createSupabaseConnection(url, anonKey)` — recebe credenciais já
  resolvidas pelo app chamador (Next.js usa `NEXT_PUBLIC_*`, Expo usa `EXPO_PUBLIC_*`) e
  retorna `{ client: null, isMock: true }` quando ausentes, em vez de lançar erro.
- Criado `.env.example` na raiz do repositório documentando todas as variáveis
  necessárias para web, mobile e scripts administrativos.

## Motivo

Implementar a seção 8 (modelo de dados), a regra "ofertas/encartes vencidos não
aparecem publicamente" via RLS (não só no client, para não depender de o front-end
"lembrar" de filtrar), e a seção 12 ("se alguma credencial estiver ausente, use modo
mock e documente como configurar o serviço real").

## Impacto

- Nenhum banco real foi criado ou modificado nesta sessão — não há credenciais
  Supabase configuradas no ambiente, então os scripts rodaram em modo "instruções apenas"
  (validado, ver abaixo).
- Define o contrato que `apps/web`/`apps/mobile` vão usar para autenticação e dados.

## Validação executada

- `pnpm --filter @budega/supabase exec tsc --noEmit` → sem erros.
- `pnpm --filter @budega/supabase migrate` sem `DATABASE_URL` → imprime instruções, sai
  com código 0.
- `pnpm --filter @budega/supabase seed` sem credenciais → falhou primeiro com
  `SyntaxError` (import incorreto do mock, registrado em `.audit/errors/`), corrigido, e
  depois passou a imprimir instruções e sair com código 0.
- O SQL da migration não foi executado contra um Postgres real nesta sessão (nenhuma
  credencial disponível) — revisão manual cuidadosa do SQL foi feita, mas a validação
  definitiva só ocorre ao rodar `pnpm --filter @budega/supabase migrate` contra um
  projeto Supabase real. Isso é uma pendência explícita abaixo.

## Pendências e riscos

- **Risco não totalmente validado**: `migrations/0001_init.sql` nunca rodou contra um
  Postgres real nesta sessão. Antes de usar em produção, rodar
  `pnpm --filter @budega/supabase migrate` contra um projeto Supabase de teste e
  confirmar que todas as tabelas/policies são criadas sem erro.
- RLS de `favorites` assume que favoritos anônimos nunca tocam o Supabase diretamente
  (ficam só no `localStorage`/`AsyncStorage` do cliente) — se uma versão futura quiser
  sincronizar favoritos anônimos sem login, a política atual vai bloquear; isso é
  intencional e documentado no SQL, mas precisa de decisão de produto se mudar.
- Falta popular `is_suspended`/`owner_id` de mercados a partir do painel admin (Fase 4).
