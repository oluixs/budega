#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { repoRoot, listMarkdownFiles } from "./audit-lib.mjs";

const root = repoRoot();

const CHANGE_REQUIRED = [
  /^- Data e hora:/m,
  /^- Agente\/responsável:/m,
  /^- Branch:/m,
  /^- Commit:/m,
  /^- Tipo:/m,
  /^- Status:/m,
  /## O que foi alterado/,
  /## Motivo/,
  /## Impacto/,
  /## Validação executada/,
  /## Pendências e riscos/,
];

const ERROR_REQUIRED = [
  /^- Data e hora:/m,
  /^- Agente\/responsável:/m,
  /^- Ambiente:/m,
  /^- Status:/m,
  /^- Severidade:/m,
  /## Mensagem completa do erro/,
  /## Sintoma/,
  /## Motivo provável ou causa raiz/,
  /## Correção aplicada/,
  /## Como foi validado/,
  /## Como evitar a repetição/,
  /## Aprendizado reutilizável/,
];

const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{16,}/,
  /AIza[0-9A-Za-z\-_]{20,}/,
  /-----BEGIN [A-Z ]+PRIVATE KEY-----/,
  /SUPABASE_SERVICE_ROLE_KEY\s*=\s*\S+/,
  /password\s*[:=]\s*['"]?\S{6,}/i,
];

function validateFile(file, requiredPatterns) {
  const content = fs.readFileSync(file, "utf8");
  const issues = [];
  for (const pattern of requiredPatterns) {
    if (!pattern.test(content)) {
      issues.push(`campo/secão ausente: ${pattern}`);
    }
  }
  for (const secretPattern of SECRET_PATTERNS) {
    if (secretPattern.test(content)) {
      issues.push(`possível segredo detectado (padrão: ${secretPattern})`);
    }
  }
  return issues;
}

let hasErrors = false;

const changeFiles = listMarkdownFiles(path.join(root, ".audit", "changes"));
const errorFiles = listMarkdownFiles(path.join(root, ".audit", "errors"));

for (const file of changeFiles) {
  const issues = validateFile(file, CHANGE_REQUIRED);
  if (issues.length) {
    hasErrors = true;
    console.error(`\n[INVÁLIDO] ${path.relative(root, file)}`);
    issues.forEach((i) => console.error(`  - ${i}`));
  }
}

for (const file of errorFiles) {
  const issues = validateFile(file, ERROR_REQUIRED);
  if (issues.length) {
    hasErrors = true;
    console.error(`\n[INVÁLIDO] ${path.relative(root, file)}`);
    issues.forEach((i) => console.error(`  - ${i}`));
  }
}

if (hasErrors) {
  console.error(`\nValidação falhou. Corrija os registros acima.`);
  process.exit(1);
}

console.log(`OK — ${changeFiles.length} registro(s) de mudança e ${errorFiles.length} registro(s) de erro válidos.`);
