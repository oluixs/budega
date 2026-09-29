# Registro de mudança — apps-web gerenciamento de filiais no painel admin

- Data e hora: 2026-09-29 10:50:38 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: c4dbd30 (base; a mudança entra no commit seguinte)
- Tipo: feature
- Status: concluída

## O que foi alterado

- Nova rota `/admin/filiais` (`apps/web/src/app/admin/filiais/page.tsx`) e item "Filiais"
  na navegação do admin (`app/admin/layout.tsx`).
- `components/admin/branches-table.tsx`: lista de filiais com busca (nome/bairro/cidade),
  filtro por mercado, horário de hoje e botão "Excluir" com diálogo de confirmação.
- `components/admin/branch-form-dialog.tsx`: cadastro de filial (mercado, nome, endereço,
  bairro, cidade, UF, CEP, telefone, latitude/longitude, horário "abre/fecha" + "fechado
  aos domingos").
- `lib/admin-data.ts`: `getAllBranchesAdmin()`.
- `lib/admin-actions.ts`: `createBranch()` e `deleteBranch()` (mesmo padrão mock/real das
  outras ações).
- `packages/shared`: `weeklyHours(opensAt, closesAt, closedDays)` em
  `business/hours.ts`; mensagens pt-BR para latitude/longitude em `branchFormSchema`.
- Testes: `branches-table.test.tsx` (5), 3 casos novos em `admin-actions.test.ts`, 2 em
  `hours.test.ts`.

## Motivo

Pendência da Fase 4 do `PLAN.md` / "Limitações conhecidas" do README: o schema e a RLS de
`branches` existiam, mas não havia UI no painel.

## Impacto

- Web/admin: nova tela. Nenhuma mudança de banco — usa a tabela `branches` e a policy
  `branches_write_manager` já existentes na migration 0001.
- Excluir filial não apaga ofertas/encartes: a FK é `on delete set null` e eles passam a
  valer para o mercado inteiro (isso é dito no diálogo de confirmação).
- Mobile: nenhum impacto de UI; `weeklyHours` fica disponível em `@budega/shared`.

## Validação executada

- `pnpm typecheck`, `pnpm lint` (4/4 pacotes), `pnpm test` (42 shared + 26 web),
  `pnpm build:web` (rota `ƒ /admin/filiais` gerada).
- `next start` + `curl /admin/filiais`: HTTP 200, 11 linhas de tabela (cabeçalho + 10
  filiais mock), nomes e horários renderizados, sem erros no log do servidor.

## Pendências e riscos

- Sem edição de filial (só criar/excluir) e horário é único para todos os dias (com
  opção de fechar domingo). Horário por dia fica para uma próxima iteração.
- Latitude/longitude são digitadas à mão — não há geocodificação a partir do endereço.
- Não houve verificação visual num navegador real (sem ferramenta de navegador nesta
  sessão), só SSR + testes com jsdom.
- Em modo mock, criar/excluir só simula (padrão de todo o admin).
