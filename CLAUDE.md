# Budega — guia para Claude Code

Este é o monorepo do **Budega** (web + Android/iPhone + Supabase). Se você está
retomando este projeto numa sessão nova (mesmo computador ou outro), leia **nesta
ordem** antes de fazer qualquer alteração:

1. `README.md` — comandos exatos, como rodar em modo mock, como configurar o Supabase
   real, limitações conhecidas.
2. `PLAN.md` — progresso por fase (o que já está feito, o que falta).
3. `DESIGN.md` — direção visual (paleta, tipografia, tokens) já definida — não redefina
   do zero.
4. `.audit/README.md` — protocolo de auditoria. **Leia antes de mexer em qualquer área
   já tocada** e rode `pnpm audit:preflight -- <palavra-chave>` para ver erros/decisões
   relacionados antes de alterar código.
5. `PROMPT_ORIGINAL.md` — o briefing original completo do produto, preservado na
   íntegra, caso precise conferir um requisito específico.

## Regras que já foram decididas (não redecidir)

- Monorepo pnpm + Turborepo: `apps/web` (Next.js 16 + shadcn/ui, style `base-nova`
  sobre `@base-ui/react` — **use a prop `render`, não `asChild`**, e todo `<Select>`
  precisa de `items={{ [valor]: rótulo }}` senão o gatilho mostra o ID cru — ver
  `.audit/errors/2026-09-29/`), `apps/mobile` (Expo
  Router SDK 57 + NativeWind), `packages/shared` (tipos/Zod/regras de negócio/mock),
  `packages/supabase` (migrations + RLS + cliente).
- Todo import relativo dentro de `packages/shared` e `packages/supabase` é **sem**
  extensão de arquivo (`from "./algo"`, nunca `from "./algo.js"`) — o Turbopack da web
  não resolve `.js` apontando para `.ts` nesses pacotes (ver
  `.audit/errors/2026-09-28_22-04-18_...`).
- `apps/web` e `apps/mobile` têm versões de `react` diferentes de propósito (peers de
  Next 16 vs. Expo SDK 57); `@types/react` é fixado numa única versão via
  `pnpm.overrides` no `package.json` raiz — não mude o `nodeLinker` do pnpm para
  `hoisted` sem testar `pnpm --filter @budega/web build` depois (já foi tentado e
  quebrou a web — ver `.audit/errors/2026-09-28_22-51-00_...`).
- Todo trabalho de IA (criar/editar/apagar arquivo, mudar schema, corrigir bug, decisão
  técnica) precisa de um registro em `.audit/changes/` ou `.audit/errors/` no mesmo
  ciclo da mudança — use `pnpm audit:change`/`pnpm audit:error`. Nunca commitar segredo
  em `.audit/`.
- Schemas de formulário em `packages/shared` validam IDs só como string não vazia
  (`recordIdSchema`), nunca `.uuid()` — os IDs mock não são UUIDs. Testes de schema devem
  usar os IDs de `mock`, não UUIDs sintéticos.
- Sem credenciais Supabase, os apps rodam 100% em modo mock (dados de
  `packages/shared/src/mock`) — isso é o padrão e deve continuar funcionando.
- Não faça `git push`, crie releases nem altere configuração remota sem autorização
  explícita do usuário para aquela ação específica.

## Ferramentas MCP (status registrado)

`shadcn` MCP falhou ao conectar; Magic MCP e Chrome DevTools MCP não apareceram
disponíveis na sessão original. O fallback documentado foi: CLI `shadcn` direto para
componentes web, seções construídas à mão seguindo a Frontend Design Skill, e validação
de runtime via build/testes/`Invoke-WebRequest` em vez do Chrome DevTools MCP. Se essas
ferramentas estiverem disponíveis numa sessão nova, prefira usá-las (é o comportamento
padrão pedido no brief) — só não pare o trabalho se elas faltarem de novo.

## Design (herdado, não gerado por MCP)

- Use strictly semantic component design via shadcn/ui.
- Maintain accessible color contrast (WCAG AA standards) — ver `DESIGN.md` para os
  tokens exatos de cor/tipografia/espaçamento já definidos.
- Ao pedir uma UI nova, prefira a CLI do shadcn/registries antes de construir do zero;
  rascunhe o layout antes de implementar.
