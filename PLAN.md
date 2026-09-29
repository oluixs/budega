# PLAN.md — Budega

Plano de implementação do MVP Budega (web + Android/iOS + backend Supabase).
Este arquivo é atualizado a cada etapa concluída. Consulte `.audit/changes/` para o
histórico detalhado de cada mudança e `.audit/errors/` para erros encontrados.

## Estado do ambiente (checagem feita em 2026-09-28)

- Node.js, npm e Git **não estavam instalados** nesta máquina. Foram instalados via
  `winget` (Node.js LTS 24.19.0, Git 2.55.0) com autorização do usuário.
- `pnpm` habilitado via Corepack (v10.15.0). `turbo` usado para orquestrar o monorepo.
- **shadcn MCP**: configurado em `.mcp.json` mas falhou ao conectar nesta sessão
  (`CONNECTION_CLOSED`). Usamos a CLI `shadcn` diretamente (`pnpm dlx shadcn@latest add ...`)
  como alternativa documentada.
- **Magic MCP (21st.dev)** e **Chrome DevTools MCP**: não apareceram como ferramentas
  disponíveis nesta sessão (não configurados). Seções visuais foram construídas à mão
  seguindo a Frontend Design Skill; a validação de runtime é feita rodando o servidor
  Next.js e inspecionando manualmente/via testes, não via Chrome DevTools MCP. Isso é uma
  limitação conhecida — ver `.audit/errors/` e a seção "Limitações conhecidas" no README.
- Corrigido um artefato pré-existente no repositório: uma pasta chamada `claude.md`
  continha um arquivo `markdown` em vez de um arquivo `CLAUDE.md` normal. Foi recriado
  como `CLAUDE.md` na raiz com o mesmo conteúdo.

## Checklist de prevenção de erros (usar antes de qualquer mudança estrutural)

- [ ] Rodar `pnpm audit:preflight` (ou ler `.audit/README.md` + `.audit/errors/`) antes de
      mexer em uma área já tocada anteriormente.
- [ ] Verificar se a mudança precisa de teste de regressão novo.
- [ ] Confirmar que nenhum segredo será commitado (`.env` nunca deve ir para o git).

## Fase 1 — Fundação

- [x] Inspecionar repositório existente (estava quase vazio: apenas `package.json` com
      `shadcn` como devDependency e `.mcp.json`).
- [x] Instalar Node.js e Git (ausentes no ambiente).
- [x] Inicializar `git init` e configurar monorepo pnpm + Turborepo.
- [x] Criar `PLAN.md` e `DESIGN.md`.
- [x] Criar estrutura `.audit/` e scripts de auditoria.
- [ ] Criar `packages/shared` (tipos, Zod, regras de negócio: distância, validade de
      oferta/encarte).
- [ ] Criar `packages/supabase` (migrations, seed mock, cliente).
- [ ] Popular dados mock (8 mercados, 10 filiais, 30 ofertas, 8 encartes).

## Fase 2 — Web pública

- [ ] Configurar Next.js (App Router) + TypeScript + Tailwind + shadcn/ui em `apps/web`.
- [ ] Página inicial `/`.
- [ ] `/explorar` (busca, filtros, lista/mapa).
- [ ] `/mercados/[slug]`.
- [ ] `/ofertas/[id]`.
- [ ] `/encartes/[id]`.
- [ ] `/favoritos`.
- [ ] `/entrar` e `/cadastro` (opcionais).

## Fase 3 — Android/iOS (Expo)

- [ ] Scaffold `apps/mobile` com Expo Router + NativeWind.
- [ ] Navegação inferior (Explorar, Buscar, Favoritos, Perfil).
- [ ] Telas equivalentes às da web, adaptadas a mobile.
- [ ] Localização (Expo Location) + fallback sem mapa.
- [ ] Compartilhamento nativo e abertura de rota externa.

## Fase 4 — Backend e administração

- [ ] Migrations Supabase + RLS.
- [ ] Autenticação (roles: user, market_manager, admin).
- [ ] Painel `/admin` (dashboard, mercados, encartes, ofertas, denúncias).
- [ ] Integração TanStack Query + React Hook Form + Zod nos formulários administrativos.

## Fase 5 — Qualidade

- [ ] Testes automatizados (distância, ordenação, validade, favoritos, formulários, roles).
- [ ] Lint, typecheck, build.
- [ ] Validação manual do servidor web (sem Chrome DevTools MCP — documentar como
      limitação e usar inspeção manual/testes).
- [ ] Revisão responsiva (desktop/mobile).
- [ ] Resumo final de sessão em `.audit/`.

## Não avançar com a etapa anterior quebrada

Cada fase só é considerada concluída quando lint/build relevante passa. Problemas
encontrados são registrados em `.audit/errors/` com causa raiz e prevenção antes de
seguir para a próxima fase.
