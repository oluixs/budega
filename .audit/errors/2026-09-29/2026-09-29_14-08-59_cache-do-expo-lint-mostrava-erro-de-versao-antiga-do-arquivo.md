# Erro — cache do expo lint mostrava erro de versao antiga do arquivo

- Data e hora: 2026-09-29 14:08:59 -03:00
- Agente/responsável: Claude Code
- Ambiente: Android | iPhone (ferramentas)
- Comando ou ação que gerou o erro: `pnpm --filter @budega/mobile lint`
- Status: corrigido (contornado)
- Severidade: baixa

## Mensagem completa do erro

```
Parse errors in imported module '@/components/markets-map': Unterminated regular expression literal. (32:64)  import/namespace
```

## Sintoma

Depois de corrigir o arquivo (e com `tsc` e `npx eslint` diretos limpos), o `expo lint`
continuava acusando o erro da versão anterior.

## Motivo provável ou causa raiz

Confirmada: `expo lint` guarda cache em `apps/mobile/.expo/cache/eslint`, e a regra
`import/namespace` reaproveitou a análise antiga do módulo importado. (O erro original era
real: a ferramenta de escrita gravou os escapes ` `/` ` como os caracteres
literais, quebrando a regex — corrigido montando os caracteres com `String.fromCharCode`.)

## Correção aplicada

`rm -rf apps/mobile/.expo/cache/eslint` antes de rodar o lint do app.

## Como foi validado

`pnpm --filter @budega/mobile lint` limpo.

## Como evitar a repetição

Se o lint do app acusar algo que `npx eslint <arquivo>` não acusa, limpe
`.expo/cache/eslint`. Evite escapes Unicode de separadores de linha escritos no código —
monte-os por código de caractere.

## Aprendizado reutilizável

Resultado de ferramenta com cache precisa ser confirmado sem o cache antes de concluir
que o código está errado.
