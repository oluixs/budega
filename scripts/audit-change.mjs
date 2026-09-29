#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { nowParts, slugify, gitInfo, repoRoot, ensureDir } from "./audit-lib.mjs";

const title = process.argv.slice(2).join(" ").trim() || "Mudanca sem titulo";
const { date, stamp } = nowParts();
const { branch, commit } = gitInfo();
const slug = slugify(title);

const root = repoRoot();
const dir = path.join(root, ".audit", "changes", date);
ensureDir(dir);

const timeStamp = nowParts().time.replace(/:/g, "-");
const filePath = path.join(dir, `${date}_${timeStamp}_${slug}.md`);

const template = `# Registro de mudança — ${title}

- Data e hora: ${stamp}
- Agente/responsável: Claude Code
- Branch: ${branch}
- Commit: ${commit}
- Tipo: feature | bugfix | refactor | config | database | docs | test | design
- Status: concluída | parcial | revertida

## O que foi alterado

<!-- Descrição clara dos arquivos, telas, APIs, tabelas e comportamentos modificados -->

## Motivo

<!-- Por que a mudança foi necessária -->

## Impacto

<!-- Impacto para web, Android, iPhone, backend, banco, segurança e usuários -->

## Validação executada

<!-- Comandos, testes, lint, build e verificações manuais realizados -->

## Pendências e riscos

<!-- Itens que ainda precisam de atenção -->
`;

fs.writeFileSync(filePath, template, "utf8");
console.log(`Registro de mudança criado: ${path.relative(root, filePath)}`);
