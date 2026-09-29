# Erro — Move-Item apagou o conteúdo de claude.md por colisão de nome case-insensitive

- Data e hora: 2026-09-28 21:27:16 -03:00
- Agente/responsável: Claude Code
- Ambiente: CI (ferramentas de shell locais, PowerShell no Windows)
- Comando ou ação que gerou o erro: `Move-Item -Path "claude.md\markdown" -Destination "CLAUDE.md"` seguido de `Remove-Item -Path "claude.md" -Recurse -Force`
- Status: corrigido
- Severidade: baixa (conteúdo recuperado; nenhuma perda de dado real)

## Mensagem completa do erro

O comando `Move-Item` não produziu uma mensagem de erro visível no output combinado (o
agente encadeou vários comandos com `;` e não verificou o resultado de cada um
individualmente). O sintoma só apareceu depois, ao listar o diretório.

## Sintoma

O repositório continha uma pasta `claude.md/` com um arquivo `markdown` dentro (em vez
de um arquivo `CLAUDE.md` normal na raiz — provavelmente um artefato de como o arquivo
foi criado/exportado antes desta sessão). O agente tentou corrigir isso com
`Move-Item ... -Destination "CLAUDE.md"` e depois `Remove-Item -Recurse -Force
"claude.md"`. Após rodar `Get-ChildItem`, nem `claude.md` nem `CLAUDE.md` existiam mais
no diretório — o conteúdo tinha sumido.

## Motivo provável ou causa raiz

O sistema de arquivos do Windows (NTFS) não é case-sensitive: um arquivo `CLAUDE.md` e
uma pasta `claude.md` no mesmo diretório pai são tratados como o **mesmo nome**. O
`Move-Item` para `CLAUDE.md` colidiu com a pasta `claude.md` já existente (mesmo nome,
case diferente) e falhou silenciosamente nesse ponto do encadeamento de comandos; como o
`Remove-Item -Recurse -Force` seguinte apagou `claude.md` incondicionalmente, o arquivo
`markdown` que ainda estava dentro dela foi removido junto, sem nunca ter sido
efetivamente movido para o novo nome.

## Correção aplicada

Como o conteúdo do arquivo já tinha sido lido integralmente pelo agente antes da
tentativa de mover (via a ferramenta de leitura, no início da tarefa), nada foi perdido
de fato. A correção foi recriar o arquivo diretamente com a ferramenta de escrita
(`Write`, não `Move-Item`/shell) em `CLAUDE.md` na raiz, com o conteúdo original
("Web Design Guidelines & Engineering Standards").

## Como foi validado

`Get-ChildItem -Force` confirmou que `CLAUDE.md` existe na raiz e `claude.md` (pasta) não
existe mais. O conteúdo foi conferido manualmente contra a leitura original feita no
início da tarefa.

## Como evitar a repetição

- Em Windows, nunca usar `Move-Item`/`Rename-Item` para "corrigir" o nome de um arquivo
  ou pasta quando o destino difere apenas em maiúsculas/minúsculas do nome de origem —
  isso é uma colisão de nome, não uma operação segura. Preferir: (1) mover para um nome
  temporário claramente diferente, (2) apagar o item antigo, (3) renomear para o nome
  final — em três passos separados, verificando cada um.
- Antes de qualquer `Remove-Item -Recurse -Force`, verificar (`Test-Path`) que o destino
  do passo anterior foi criado com sucesso.
- Ao encadear múltiplos comandos PowerShell com `;`, verificar explicitamente o
  resultado de operações destrutivas (`Remove-Item`, `Move-Item` sobre paths existentes)
  antes de prosseguir, em vez de assumir sucesso.

## Aprendizado reutilizável

Em ambientes Windows/NTFS, tratar qualquer par de caminhos que difiram só em
maiúsculas/minúsculas como o **mesmo caminho** para fins de operações de arquivo — nunca
usar `Move-Item`/`Rename-Item` direto entre eles. Sempre confirmar com `Test-Path` antes
de um `Remove-Item -Recurse -Force` subsequente.
