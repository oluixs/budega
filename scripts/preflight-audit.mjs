#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { repoRoot, listMarkdownFiles } from "./audit-lib.mjs";

const keyword = process.argv.slice(2).join(" ").trim().toLowerCase();
const root = repoRoot();

const changeFiles = listMarkdownFiles(path.join(root, ".audit", "changes"));
const errorFiles = listMarkdownFiles(path.join(root, ".audit", "errors"));

console.log(`Preflight audit — ${changeFiles.length} registro(s) de mudança, ${errorFiles.length} registro(s) de erro encontrados.\n`);

if (!keyword) {
  console.log("Nenhuma palavra-chave informada. Uso: pnpm audit:preflight -- <palavra-chave>");
  console.log("Listando os 5 registros de erro mais recentes:\n");
  for (const file of errorFiles.slice(-5)) {
    console.log(`- ${path.relative(root, file)}`);
  }
  process.exit(0);
}

function matches(file) {
  const content = fs.readFileSync(file, "utf8").toLowerCase();
  return content.includes(keyword) || file.toLowerCase().includes(keyword);
}

const matchingErrors = errorFiles.filter(matches);
const matchingChanges = changeFiles.filter(matches);

console.log(`Resultados para "${keyword}":\n`);

if (matchingErrors.length === 0 && matchingChanges.length === 0) {
  console.log("Nenhum registro relacionado encontrado. Prossiga, mas registre o que aprender.");
} else {
  if (matchingErrors.length) {
    console.log(`Erros relacionados (${matchingErrors.length}):`);
    for (const file of matchingErrors) {
      const firstLine = fs.readFileSync(file, "utf8").split("\n")[0];
      console.log(`  - ${path.relative(root, file)} — ${firstLine.replace(/^#\s*/, "")}`);
    }
  }
  if (matchingChanges.length) {
    console.log(`\nMudanças relacionadas (${matchingChanges.length}):`);
    for (const file of matchingChanges) {
      const firstLine = fs.readFileSync(file, "utf8").split("\n")[0];
      console.log(`  - ${path.relative(root, file)} — ${firstLine.replace(/^#\s*/, "")}`);
    }
  }
  console.log("\nLeia os arquivos acima antes de continuar.");
}
