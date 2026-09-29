# Budega — Web

Aplicação Next.js 16 (App Router) do Budega: experiência pública de consumidor
(`/`, `/explorar`, `/mercados/[slug]`, `/ofertas/[id]`, `/encartes/[id]`, `/favoritos`)
e painel administrativo (`/admin`).

Veja o [README na raiz do monorepo](../../README.md) para instruções completas de
instalação, execução, configuração do Supabase e deploy — este pacote não é pensado
para ser executado isoladamente fora do workspace pnpm.

Comandos locais (equivalentes a `pnpm --filter @budega/web <script>` a partir da raiz):

```bash
pnpm dev          # next dev
pnpm build        # next build
pnpm start        # next start (após build)
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest run
```
