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
- [x] `eas.json` e instruções de build Android/iPhone com EAS (ver README).

## Fase 4 — Backend e administração

- [x] Migrations Supabase + RLS. 0001 executada pela primeira vez num Postgres (PGlite)
      em 2026-09-29: tinha escalonamento de privilégio → corrigido na
      `0002_security_hardening.sql`, com 16 testes de RLS.
- [x] Autenticação (roles: user, market_manager, admin) com sessão em cookie
      (`@supabase/ssr`), `src/proxy.ts` redirecionando `/admin` sem sessão, checagem de
      role no servidor (`lib/auth.ts`), `/acesso-negado`, `/auth/callback`, "Sair".
- [x] Painel `/admin` (dashboard, mercados, filiais, encartes, ofertas, denúncias).
- [x] Mercados: cadastrar e editar (2026-09-29), com horário por dia da semana.
- [x] Tela de usuários (`/admin/usuarios`): permissões e atribuição de mercados
      (migration 0003). Só o primeiro admin é promovido via SQL.
- [ ] Upload de encarte/imagem para o Supabase Storage (hoje por URL).
- [x] Registrar `analytics_events` (visualizações, cliques, compartilhamento, favoritar)
      e mostrar no dashboard (2026-09-29, retomada em máquina nova) — ver
      `.audit/changes/2026-09-29/..._analytics-events...md`.
- [x] Integração React Hook Form + Zod nos formulários administrativos (TanStack Query
      não foi necessário nesta fase — Server Actions + `revalidatePath` cobriram as
      mutações do admin; pode ser adotado depois para listagens com paginação real).
- [x] Gerenciar filiais (branches) no admin — `/admin/filiais` com listagem, busca,
      filtro por mercado, cadastro, edição e exclusão, horário por dia (2026-09-29).

## Retomada em 2026-09-29 (máquina nova)

- [x] Clone limpo + `pnpm install`. `corepack enable` sem admin falha (EPERM em
      `C:\Program Files\nodejs`); resolvido com
      `corepack enable --install-directory "$APPDATA\npm" pnpm`.
- [x] Corrigido: `pnpm typecheck` falhava em clone novo (`LayoutProps` gerado em `.next/`).
- [x] Corrigido: `pnpm audit:preflight -- <termo>` nunca achava nada (o `--` entrava na
      busca).
- [x] Corrigido: formulários de oferta/encarte do admin e "Denunciar" nunca enviavam em
      modo mock (schemas exigiam UUID).
- [x] Corrigido: selects da web mostravam o ID cru no gatilho em vez do nome.
- [x] Corrigido: RLS permitia virar admin, forjar mercados/denúncias (migration 0002).
- [x] Corrigido: admin não funcionaria com Supabase real (sessão só no localStorage).
- [x] Corrigido: "Suspender mercado" não tinha efeito público.
- [x] Corrigido (achados no navegador): hidratação em favoritos, labels de formulário
      desconectados, escala tipográfica inexistente, data sem fuso / validade "agora
      mesmo", "Denunciar" ausente em mercado/oferta, home estática com ofertas vencidas.

## Fase 6 — Dados reais da região (Fortaleza e RMF)

- [x] `packages/sources` com importador educado (BudegaBot, robots.txt) e adaptador do
      Cometa Supermercados: 43 lojas e encartes vigentes com validade, PDF e capa.
- [x] Web usa os dados reais sem Supabase (atualização a cada 1 h + retrato salvo).
- [x] Mapa interativo (Leaflet + OpenStreetMap, sem chave) no Explorar e na página do
      mercado; distância até a loja mais próxima; busca pelos bairros das lojas.
- [x] Política de Privacidade e Termos revisados (LGPD, Marco Civil, CDC, direitos
      autorais) — falta o responsável preencher `apps/web/src/lib/legal.ts`.
- [x] App mobile com dados reais, mapa (Leaflet em WebView), capas dos encartes, lojas,
      links para as páginas legais e texto do pedido de localização em português.
      Verificado pela versão web do app (Chromium, tamanho de celular).
- [x] Segunda rede: Frangolândia (21 lojas geocodificadas via Nominatim com cache).
- [x] Terceira rede: Super Lagoa (8 lojas, coordenadas exatas do próprio site — sem
      encartes, pois a Revista de Ofertas do site está parada desde 08/2023).
- [ ] Mais redes da região (candidatas já avaliadas e descartadas: São Luiz —
      robots.txt bloqueia bots fora de Googlebot/Bingbot; Centerbox e Pinheiro —
      certificado TLS inválido; Diniz — só tem app, sem site com encartes; Moranguinho —
      não atua em Fortaleza, só no interior. Buscar outras redes como Carrefour/Assaí se
      tiverem site público com robots.txt permissivo e TLS válido).
- [x] Leitura de ofertas dos encartes com a API do Claude (`pnpm importar --ofertas`,
      cache por encarte, validação de preços) — pronta e testada com cliente simulado.
- [ ] Rodar a leitura de ofertas pela primeira vez (precisa de credencial da Anthropic).
- [ ] Emulador Android: SDK instalado; falta ativar o hipervisor (precisa de admin).

## Retomada em 2026-09-29 (verificação completa + analytics)

Sessão à parte, depois que o trabalho da seção anterior já estava publicado no GitHub
(`git log` mostrava 9 commits novos desde o push inicial). Antes de continuar, rodada
a suíte inteira de novo para confirmar que nada regrediu:

- [x] `pnpm typecheck`/`pnpm lint`/`pnpm test` (5 pacotes) — todos limpos, 158
      testes unitários/integração passando (55 shared + 37 sources + 19 supabase/PGlite
      + 47 web).
- [x] `pnpm --filter @budega/web test:e2e` — 52/52 passando (instalado o Chromium do
      Playwright, que não estava presente nesta máquina).
- [x] `pnpm build` (web) e `npx expo-doctor`/`expo export --platform android` (mobile) —
      sem erros.
- [x] Nenhum registro de erro em aberto em `.audit/errors/` (35 registros, todos
      corrigidos/documentados).
- [x] Implementado o item pendente "registrar `analytics_events` e mostrar no
      dashboard": `lib/track-event.ts` (grava evento, no-op em modo mock),
      `ViewTracker`/`TrackedActionButton` nas páginas de mercado/oferta/encarte,
      `favorite_add`/`favorite_remove` no `FavoriteButton`, `share` no `ShareButton`, e
      `getAnalyticsSummary()` no dashboard (só para admin — RLS não deixa
      responsável de mercado ler `analytics_events`). 2 testes novos; suíte completa
      (unitários + e2e) revalidada depois, sem regressão.
- Verificado: sem privilégio de administrador do Windows nesta sessão (grupo
  Administradores em modo "só negar") — não é possível ativar o Hyper-V/hipervisor para
  o emulador Android. Fica como pendência que só o usuário pode resolver (ver README).

## Fase 5 — Qualidade

- [x] Testes automatizados: 48 em `packages/shared`, 19 em `packages/supabase`
      (migrations + RLS em PGlite) e 47 em `apps/web` (inclui proxy, permissões e
      argumentos forjados nas Server Actions), além dos 44 e2e.
- [x] Lint, typecheck, build — `pnpm lint`/`pnpm typecheck`/`pnpm build` passam limpos
      nos 4 pacotes do monorepo via turbo.
- [x] Validação do servidor web via `Invoke-WebRequest` contra `next dev` (sem Chrome
      DevTools MCP, indisponível nesta sessão — ver decisão registrada). Sem inspeção
      visual num navegador real.
- [x] Revisão visual real da web (desktop e celular) com Playwright/Chromium:
      44 testes e2e (`pnpm --filter @budega/web test:e2e`), falham em erro de console
      ou rolagem horizontal; 6 bugs encontrados e corrigidos (2026-09-29).
- [ ] Verificação visual do app mobile em Expo Go/emulador.
- [x] Resumo final de sessão apresentado ao usuário ao final da implementação.

## Não avançar com a etapa anterior quebrada

Cada fase só é considerada concluída quando lint/build relevante passa. Problemas
encontrados são registrados em `.audit/errors/` com causa raiz e prevenção antes de
seguir para a próxima fase.
