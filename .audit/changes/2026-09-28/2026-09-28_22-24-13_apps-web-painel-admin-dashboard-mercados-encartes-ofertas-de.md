# Registro de mudança — apps-web painel admin dashboard mercados encartes ofertas denuncias

- Data e hora: 2026-09-28 22:24:13 -03:00
- Agente/responsável: Claude Code
- Branch: master
- Commit: 6dbce1d
- Tipo: feature
- Status: parcial

## O que foi alterado

- `apps/web/src/lib/admin-data.ts`: leitura administrativa (todos os registros, sem
  filtrar por vigência) de mercados, encartes, ofertas e denúncias, mock ou Supabase
  real; `getDashboardStats()` calcula contagens e "vencendo em breve"
  (`isExpiringSoon`). Adicionado `mockReports` (3 denúncias de exemplo) a
  `packages/shared/src/mock/`, e o campo `is_suspended: boolean` ao tipo `Market` (e ao
  `marketFormSchema`) — faltava no tipo compartilhado, embora já existisse na migration.
- `apps/web/src/lib/admin-actions.ts`: Server Actions `setMarketFlag`, `createOffer`,
  `setOfferFlag`, `createFlyer`, `setFlyerStatus`, `resolveReport`. Em modo mock,
  retornam sucesso simulado com aviso explícito de que nada é persistido; com Supabase
  configurado, gravam de verdade (a autorização real vem das policies de RLS da
  migration, não desta camada — regra de negócio 10.11).
- `/admin` (layout com navegação lateral + banner de modo demonstração quando mock;
  dashboard com contadores e alerta de conteúdo vencendo), `/admin/mercados` (tabela com
  busca, verificar/destacar/suspender), `/admin/ofertas` (tabela com busca, criar,
  ativar/pausar, destacar, duplicar via `OfferFormDialog` pré-preenchido),
  `/admin/encartes` (tabela, publicar via `FlyerFormDialog`, ativar/pausar/arquivar),
  `/admin/denuncias` (tabela, resolver/descartar).

## Motivo

Implementar a Fase 4 (parte de administração) do `PLAN.md` e a seção 7 do brief.

## Impacto

- Painel administrativo funcional em modo mock para demonstração (mutações não
  persistem, é só simulação de UI — documentado no próprio painel via banner).
- Com Supabase configurado, as mutações gravam de verdade e respeitam RLS.

## Validação executada

- `pnpm --filter @budega/web build` → build de produção completo; todas as rotas
  `/admin/*` geradas com sucesso.
- Servidor `next dev` testado via `Invoke-WebRequest` em `/admin`, `/admin/mercados`,
  `/admin/ofertas`, `/admin/encartes`, `/admin/denuncias` — todas 200, sem erro no log
  do servidor. Conteúdo verificado (nomes de mercados, motivo de denúncia) presentes no
  HTML retornado.
- Corrigido durante o desenvolvimento: `LayoutProps<"/admin">` (helper de tipos gerado
  pelo Next.js) falhava no `tsc --noEmit` isolado porque os tipos de rota só são
  regenerados quando o Next processa a rota (`next dev`/`build`/`typegen`) — trocado por
  `{ children: React.ReactNode }` simples em `admin/layout.tsx`, que não depende de
  regeneração. Lição: para `apps/web`, `pnpm build` é a validação de tipos confiável,
  não `tsc --noEmit` isolado quando rotas novas acabaram de ser criadas.

## Pendências e riscos

- **Gerenciar filiais** (branches) não tem UI própria no admin ainda — só é exibido o
  total de filiais na página pública do mercado. Faltou tempo nesta sessão; os schemas
  (`branchFormSchema`) e a tabela já existem, falta só o CRUD na UI.
- Nenhuma autenticação/role real protege `/admin` nesta sessão — a proteção real vem das
  policies de RLS quando o Supabase estiver configurado (mutações de usuários sem role
  adequada falham no banco), mas não há ainda um middleware/redirect de UI para
  usuários sem sessão. Documentado no banner do próprio painel. Fica como próximo passo
  quando houver credenciais reais para testar o fluxo de login+redirect de ponta a
  ponta.
- Corrigido antes do commit: rotas `/admin/*` tinham sido geradas como estáticas no
  build (dados congelados no momento do build). Adicionado
  `export const dynamic = "force-dynamic"` em todas as páginas `/admin/*` para garantir
  dados sempre atualizados quando o Supabase real estiver configurado.
