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
- [x] Criar `packages/shared` (tipos, Zod, regras de negócio: distância, validade de
      oferta/encarte). 29 testes Vitest passando, typecheck limpo.
- [x] Criar `packages/supabase` (migrations, seed mock, cliente). Migration SQL escrita
      e revisada, mas **ainda não executada contra um Postgres real** (sem credenciais
      no ambiente) — ver pendência em `.audit/changes/`.
- [x] Popular dados mock (8 mercados, 10 filiais, 30 ofertas, 8 encartes) — em
      `packages/shared/src/mock/`.

## Fase 2 — Web pública

- [x] Configurar Next.js (App Router) + TypeScript + Tailwind + shadcn/ui em `apps/web`.
- [x] Página inicial `/`.
- [x] `/explorar` (busca, filtros, lista/mapa).
- [x] `/mercados/[slug]`.
- [x] `/ofertas/[id]`.
- [x] `/encartes/[id]`.
- [x] `/favoritos`.
- [x] `/entrar` e `/cadastro` (opcionais).
- [x] `/privacidade` e `/termos`.

## Fase 3 — Android/iOS (Expo)

- [x] Scaffold `apps/mobile` com Expo Router + NativeWind (SDK 57).
- [x] Navegação inferior (Explorar, Buscar, Favoritos, Perfil).
- [x] Telas equivalentes às da web, adaptadas a mobile (mercado, oferta, encarte).
- [x] Localização (Expo Location) + fallback sem mapa (lista com distância).
- [x] Compartilhamento nativo e abertura de rota externa (Linking + Share).
- [ ] Verificação visual real em Expo Go/emulador/dispositivo — não foi possível nesta
      sessão (sem Android SDK/emulador no ambiente). Validado via `tsc`, `expo lint`,
      `expo-doctor` (21/21) e `expo export --platform android/ios` (bundle completo).
- [ ] `eas.json` e instruções de build Android/iPhone com EAS — pendente para o README.

## Fase 4 — Backend e administração

- [x] Migrations Supabase + RLS (escritas e revisadas; ainda não executadas contra um
      Postgres real — sem credenciais no ambiente).
- [x] Autenticação (roles: user, market_manager, admin) — schema e RLS prontos;
      `/entrar`/`/cadastro` funcionam com Supabase Auth real quando configurado. Falta
      middleware de redirect para `/admin` sem sessão (ver pendência no registro de
      mudança do admin).
- [x] Painel `/admin` (dashboard, mercados, encartes, ofertas, denúncias).
- [x] Integração React Hook Form + Zod nos formulários administrativos (TanStack Query
      não foi necessário nesta fase — Server Actions + `revalidatePath` cobriram as
      mutações do admin; pode ser adotado depois para listagens com paginação real).
- [ ] Gerenciar filiais (branches) no admin — schema pronto, falta UI dedicada.

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
