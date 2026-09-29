# Erro — scripts de auditoria incluiam o separador -- na palavra-chave e no titulo

- Data e hora: 2026-09-29 10:39:01 -03:00
- Agente/responsável: Claude Code
- Ambiente: CI (ferramentas do repositório)
- Comando ou ação que gerou o erro: `pnpm audit:preflight -- admin`
- Status: corrigido
- Severidade: média

## Mensagem completa do erro

```
Resultados para "-- admin":

Nenhum registro relacionado encontrado. Prossiga, mas registre o que aprender.
```

## Sintoma

O preflight nunca encontrava nada quando usado da forma documentada no README e no
`CLAUDE.md` (`pnpm audit:preflight -- <termo>`), mesmo havendo 6 mudanças e 2 erros
sobre o painel admin. Isso anulava silenciosamente o protocolo de "ler erros
relacionados antes de alterar".

## Motivo provável ou causa raiz

Confirmada: o pnpm 10 repassa o `--` literal para o script (`node scripts/preflight-audit.mjs "--" "admin"`),
e os três scripts usavam `process.argv.slice(2).join(" ")` sem descartar o `--`. O mesmo
defeito afetava `audit:change` e `audit:error` (o título do registro ganharia o prefixo
`-- `).

## Correção aplicada

Novo helper `cliText()` em `scripts/audit-lib.mjs` que descarta argumentos `--`; usado
em `preflight-audit.mjs`, `audit-change.mjs` e `audit-error.mjs`.

## Como foi validado

`pnpm audit:preflight -- admin` agora lista 2 erros e 6 mudanças relacionadas. Os
registros de erro desta data foram criados com `pnpm audit:error -- "..."` e saíram com
título correto.

## Como evitar a repetição

Todo script novo em `scripts/` que lê argumentos deve usar `cliText()` em vez de ler
`process.argv` diretamente.

## Aprendizado reutilizável

Uma ferramenta de busca que retorna "nada encontrado" precisa ser testada com um termo
que sabidamente existe — resultado vazio não é prova de ausência.
