# Erro — filtros do explorar com valor cru e rotulos soltos

- Data e hora: 2026-09-29 12:49:49 -03:00
- Agente/responsável: Claude Code
- Ambiente: web
- Comando ou ação que gerou o erro: screenshot de `/explorar?view=mapa` em modo regional
- Status: corrigido
- Severidade: média

## Mensagem completa do erro

Na tela: filtros "Distância: **any**", "Categoria: **any**", "Ordenar por: **distance**".

## Sintoma

O mesmo defeito corrigido nos formulários (Select do Base UI sem `items` mostra o valor
cru) continuava nos três filtros do Explorar. Além disso, os `<Label>` não tinham `htmlFor`.

## Motivo provável ou causa raiz

Confirmada: na correção anterior procurei só `<Select` dentro de `<FormControl>`
(formulários) — `filters-bar.tsx` usa `<Select>` solto e ficou de fora. Minha busca de
verificação também filtrava por `items=` na mesma linha, escondendo os casos multi-linha.

## Correção aplicada

`items` com os rótulos nos três `Select` e `id`/`htmlFor` ligando rótulo e gatilho.

## Como foi validado

e2e "filtros do explorar mostram os nomes das opções e têm rótulo"
(`getByLabel("Distância")` → "Qualquer distância").

## Como evitar a repetição

Ao corrigir um padrão, buscar **todas** as ocorrências do componente (não só as do
contexto onde o bug apareceu) e conferir cada uma.

## Aprendizado reutilizável

Um grep de verificação que filtra por linha não serve para JSX multi-linha: leia os arquivos.
