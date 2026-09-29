# Registro de mudança — PROMPT_ORIGINAL e CLAUDE.md atualizados para retomada em qualquer maquina

- Data e hora: 2026-09-28 23:37:44 -03:00
- Agente/responsável: Claude Code
- Branch: master
- Commit: 6f98ecb
- Tipo: docs
- Status: concluída

## O que foi alterado

- `PROMPT_ORIGINAL.md` criado na raiz com o texto integral do briefing original do
  usuário (as 21 seções do documento "Prompt para Claude Code — Budega Web + Android"),
  preservado sem edição de conteúdo, a pedido do usuário: "para que eu possa continuar
  trabalhando no projeto de qualquer computador e que o Claude já tenha as instruções
  alinhadas".
- `CLAUDE.md` da raiz reescrito: em vez de só as diretrizes genéricas de UI herdadas do
  estado inicial do repositório, agora orienta qualquer sessão futura do Claude Code
  sobre a ordem de leitura (`README.md` → `PLAN.md` → `DESIGN.md` → `.audit/README.md`
  → `PROMPT_ORIGINAL.md`), lista as decisões técnicas já tomadas que não devem ser
  reabertas sem motivo (extensões `.js` proibidas em imports de `packages/shared`/
  `packages/supabase`, `render` em vez de `asChild` no shadcn, `pnpm.overrides` para
  `@types/react`, protocolo de auditoria obrigatório, modo mock como padrão, proibição
  de `git push`/release sem autorização explícita) e o status real das ferramentas MCP
  do brief nesta sessão.
- `README.md`: adicionado link para `PROMPT_ORIGINAL.md`.

## Motivo

Pedido explícito do usuário para poder continuar o trabalho a partir de qualquer
computador com o Claude já ciente do pedido original completo, sem precisar reenviar o
documento a cada nova sessão.

## Impacto

Nenhuma mudança de código — apenas documentação/orientação para sessões futuras.

## Validação executada

Revisão manual do texto de `PROMPT_ORIGINAL.md` contra o documento original fornecido no
início da tarefa (conteúdo reproduzido integralmente, sem paráfrase).

## Pendências e riscos

Nenhuma.
