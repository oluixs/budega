# Registro de mudança — Criação inicial do projeto Budega (fundação do monorepo)

- Data e hora: 2026-09-28 21:27:16 -03:00
- Agente/responsável: Claude Code
- Branch: master
- Commit: não commitado (será registrado no próximo commit)
- Tipo: config
- Status: concluída

## O que foi alterado

- Repositório estava quase vazio (apenas `package.json` com `shadcn` como devDependency
  e `.mcp.json` configurando o MCP do shadcn).
- Instalados Node.js LTS (24.19.0) e Git (2.55.0) via `winget` — ausentes no ambiente.
- `pnpm` habilitado via Corepack (10.15.0).
- Criados: `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `PLAN.md`, `DESIGN.md`.
- `package.json` raiz reescrito como manifesto do monorepo (scripts `dev`, `build`,
  `lint`, `test`, `typecheck`, `audit:*`), preservando a dependência `shadcn` existente.
- Criada a estrutura `.audit/` (README, `changes/`, `errors/`, `decisions/`) e os scripts
  `scripts/audit-lib.mjs`, `scripts/audit-change.mjs`, `scripts/audit-error.mjs`,
  `scripts/preflight-audit.mjs`, `scripts/validate-audit.mjs`.
- `git init` executado na raiz do projeto.
- Corrigido um artefato pré-existente: uma pasta `claude.md` continha um arquivo
  `markdown` em vez de um `CLAUDE.md` normal; recriado como `CLAUDE.md` na raiz (ver
  registro de erro relacionado, criado no mesmo ciclo).

## Motivo

Implementar o brief "Budega Web + Android" exige uma base de monorepo (pnpm +
Turborepo) com `apps/web`, `apps/mobile` e `packages/shared`/`packages/supabase`, além
da infraestrutura obrigatória de auditoria descrita no brief (seções 17–21). Nada disso
existia ainda, e as ferramentas de linha de comando necessárias (Node.js, Git) não
estavam instaladas na máquina.

## Impacto

- Nenhum impacto em usuários finais ainda (nenhuma aplicação rodando).
- Instalação de software no nível do sistema (Node.js, Git) — autorizada explicitamente
  pelo usuário antes de ser executada.
- Base para todas as fases seguintes (web, mobile, backend, admin).

## Validação executada

- `node --version` → v24.19.0; `npm --version` → 11.17.0; `pnpm --version` → 12.6.0;
  `git --version` → 2.55.0.windows.5.
- `node scripts/audit-change.mjs` e `node scripts/audit-error.mjs` executados com
  sucesso (geraram este arquivo e o registro de erro irmão).
- `node scripts/validate-audit.mjs` → todos os registros existentes válidos.

## Pendências e riscos

- `apps/web`, `apps/mobile`, `packages/shared` e `packages/supabase` ainda não existem
  (próximas etapas do `PLAN.md`, Fase 1 em andamento).
- Ambiente de shell usado pelo agente não persiste variáveis entre comandos: todo
  comando que precisa de `node`/`git`/`pnpm` precisa reexportar `$env:Path` a partir do
  registro do Windows no início do comando (ver `scripts/README.md` quando criado).
- Nenhum commit git feito ainda — será feito ao final desta etapa junto com o primeiro
  `.gitignore` e estrutura de pastas.
