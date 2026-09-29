# Erro — heredoc do git bash remove barras invertidas ao gerar arquivos

- Data e hora: 2026-09-29 11:19:37 -03:00
- Agente/responsável: Claude Code
- Ambiente: ferramentas do agente (Windows + Git Bash)
- Comando ou ação que gerou o erro: gerar/editar arquivos com `cat <<'EOF'` e `python - <<'EOF'` no Git Bash
- Status: corrigido (arquivos afetados consertados)
- Severidade: baixa

## Mensagem completa do erro

```
SyntaxWarning: invalid escape sequence '\P'
AssertionError: expected '/malicioso.com' to be '/'
```

## Sintoma

- `PLAN.md`/`README.md`: `C:\Program Files\nodejs` e `$APPDATA\npm` viraram quebras de
  linha no meio do texto (`\n` interpretado).
- `utils.test.ts`: o caso `"/\\malicioso.com"` foi gravado como `"/\malicioso.com"`,
  que o JavaScript lê como `"/malicioso.com"` — o teste falhou (o código estava certo).

## Motivo provável ou causa raiz

Neste ambiente, o texto de heredoc passado pelo Git Bash perde um nível de barra
invertida mesmo com o delimitador entre aspas, antes de chegar ao `cat`/`python`.

## Correção aplicada

Arquivos corrigidos com a ferramenta de edição de arquivos (que grava o texto literal).

## Como foi validado

`grep` dos caminhos em `PLAN.md`/`README.md`; `utils.test.ts` passando.

## Como evitar a repetição

Regra no `CLAUDE.md`: conteúdo com `\` (caminhos Windows, regex, escapes) deve ser
escrito com as ferramentas de edição de arquivo, não via heredoc no shell.

## Aprendizado reutilizável

Depois de gerar arquivo pelo shell no Windows, confira qualquer linha com `\` — ou evite
o shell para esse conteúdo.
