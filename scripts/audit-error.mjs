#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { nowParts, slugify, repoRoot, ensureDir, cliText } from "./audit-lib.mjs";

const title = cliText() || "Erro sem titulo";
const { date, stamp, time } = nowParts();
const slug = slugify(title);

const root = repoRoot();
const dir = path.join(root, ".audit", "errors", date);
ensureDir(dir);

const timeStamp = time.replace(/:/g, "-");
const filePath = path.join(dir, `${date}_${timeStamp}_${slug}.md`);

const template = `# Erro — ${title}

- Data e hora: ${stamp}
- Agente/responsável: Claude Code
- Ambiente: web | Android | iPhone | backend | Supabase | CI
- Comando ou ação que gerou o erro: \`<comando ou descrição>\`
- Status: aberto | em investigação | corrigido | conhecido | não reproduzido
- Severidade: baixa | média | alta | crítica

## Mensagem completa do erro

<!-- Cole a mensagem original sem omitir o trecho relevante. NUNCA cole segredos/tokens. -->

## Sintoma

<!-- O que foi observado pelo sistema ou pelo usuário -->

## Motivo provável ou causa raiz

<!-- Explique a causa confirmada ou, se ainda não confirmada, as hipóteses -->

## Correção aplicada

<!-- Descreva a correção, os arquivos alterados e a decisão tomada -->

## Como foi validado

<!-- Testes e comandos executados após a correção -->

## Como evitar a repetição

<!-- Regra prática, teste de regressão, validação ou documentação que deve impedir a repetição -->

## Aprendizado reutilizável

<!-- Uma instrução objetiva que deve ser consultada antes de alterações futuras -->
`;

fs.writeFileSync(filePath, template, "utf8");
console.log(`Registro de erro criado: ${path.relative(root, filePath)}`);
