# Registro de mudança — apps-web scaffold Next.js 16 shadcn base-nova design tokens e pagina inicial

- Data e hora: 2026-09-28 22:05:06 -03:00
- Agente/responsável: Claude Code
- Branch: master
- Commit: 0cfb461
- Tipo: feature
- Status: parcial

## O que foi alterado

- `apps/web` criado com `create-next-app` (Next.js 16.3.6, App Router, TypeScript,
  Tailwind v4, Turbopack), depois integrado ao monorepo: renomeado para `@budega/web`,
  removidos `pnpm-lock.yaml`/`pnpm-workspace.yaml` próprios gerados pelo scaffold,
  adicionado `transpilePackages: ["@budega/shared", "@budega/supabase"]` em
  `next.config.ts`.
- shadcn/ui inicializado via CLI (`pnpm dlx shadcn@latest init`, já que o MCP do shadcn
  falhou ao conectar — ver decisão em `.audit/decisions/`). Versão do CLI instalada
  (4.21.0) usa o style `base-nova`, construído sobre `@base-ui/react` (não Radix) — toda
  composição usa a prop `render`, não `asChild` (ver registro de erro correspondente).
  Componentes gerados: button, card, input, badge, skeleton, tabs, select, dialog,
  sheet, dropdown-menu, separator, avatar, label, textarea, sonner, table, switch,
  checkbox. O componente `form` não veio do registry desta versão — recriado localmente
  em `src/components/ui/form.tsx` com a mesma API pública do shadcn/ui clássico (ver
  registro de erro correspondente).
- `src/app/globals.css`: tokens do shadcn (`--primary`, `--secondary`, `--accent`,
  `--border`, `--ring`, etc.) remapeados para a paleta da marca Budega definida em
  `DESIGN.md` (verde `brand-500 #1F7A4D`, terracota `accent-500 #E2612E`, neutros
  quentes) em vez do cinza genérico padrão do shadcn — variante `.dark` também definida,
  embora ainda sem toggle na UI.
- Fontes: `Sora` (display/títulos) + `Inter` (corpo/UI) via `next/font/google`, conforme
  `DESIGN.md`.
- `src/lib/env.ts`, `src/lib/supabase.ts`, `src/lib/data.ts`: camada de dados que lê de
  `packages/shared/src/mock` quando não há credenciais Supabase (`isMock`), ou do
  Supabase real quando configuradas — mesmos tipos em ambos os casos.
- `src/hooks/use-favorites.ts` (favoritos anônimos em `localStorage`, regra de negócio
  10.6) e `src/hooks/use-geolocation.ts` (botão "Usar minha localização").
- Componentes: `SiteHeader`/`MobileNav`/`SiteFooter` (layout), `MarketCard`,
  `OfferCard`, `PriceTag`, `FavoriteButton`, `EmptyState`, `CategoryPills`,
  `HeroSearch`, `AppProviders` (TanStack Query + toasts).
- Página inicial (`/`) implementada: hero com busca por endereço/bairro e "Usar minha
  localização", categorias, mercados em destaque, ofertas em destaque, CTA final.
- **Correção estrutural em `packages/shared` e `packages/supabase`**: todos os imports
  relativos passaram de `./arquivo.js` para `./arquivo` (sem extensão), e
  `packages/shared/src/index.ts` passou a usar reexports nomeados explícitos em vez de
  `export * from`. Causa: bug de resolução do Turbopack com extensão `.js` apontando
  para `.ts` em pacotes do workspace — ver registro de erro detalhado em
  `.audit/errors/2026-09-28/..._turbopack-nao-resolve-imports-relativos...md`. Essa
  correção era necessária para qualquer app (web ou mobile) conseguir de fato importar
  `@budega/shared`/`@budega/supabase` via bundler, não só via `tsc`/`vitest`.

## Motivo

Implementar a Fase 2 do `PLAN.md` (web pública), seguindo a Frontend Design Skill e os
tokens de `DESIGN.md`, com fallback documentado para as ferramentas MCP indisponíveis.

## Impacto

- Primeira vez que `@budega/shared`/`@budega/supabase` são consumidos por um bundler de
  verdade — a correção da extensão `.js` também beneficia `apps/mobile` (Expo/Metro),
  que ainda será criado e teria o mesmo problema.
- Nenhum dado real é lido/escrito — app roda 100% em modo mock nesta sessão (sem
  credenciais Supabase no ambiente).

## Validação executada

- `pnpm --filter @budega/shared test` → 29/29 passando.
- `pnpm --filter @budega/shared exec tsc --noEmit`, `pnpm --filter @budega/supabase exec tsc --noEmit`, `pnpm --filter @budega/web exec tsc --noEmit` → sem erros.
- `pnpm --filter @budega/web build` → build de produção completo com sucesso,
  `/` prerenderizada como conteúdo estático.
- Ainda **não** validado com Chrome DevTools MCP (indisponível nesta sessão — ver
  decisão registrada) nem com inspeção manual no navegador nesta etapa; isso está
  planejado para o fim da Fase 2/Fase 5, depois que as páginas principais existirem.

## Pendências e riscos

- Faltam as páginas `/explorar`, `/mercados/[slug]`, `/ofertas/[id]`, `/encartes/[id]`,
  `/favoritos`, `/entrar`, `/cadastro` (próximos registros de mudança).
- Dark mode existe nos tokens CSS mas não tem nenhum toggle na UI — não é um requisito
  explícito do brief, então fica documentado como não implementado, não como bug.
- Validação visual/responsiva real (rodar o servidor e navegar) ainda pendente.
