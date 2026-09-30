# Erro — Super Lagoa: quebra de linha mista e nbsp no texto de horario

- Data e hora: 2026-09-29 22:44:46 -03:00
- Agente/responsável: Claude Code
- Ambiente: backend
- Comando ou ação que gerou o erro: `pnpm --filter @budega/sources test` (teste novo de
  `superlagoa.test.ts` contra a fixture real `superlagoa-loja-detalhe.html`)
- Status: corrigido
- Severidade: baixa

## Mensagem completa do erro

```
AssertionError: expected { …(7) } to deeply equal { …(7) }
- Expected
+ Received
  Object {
    ...
-   "hoursText": "SEGUNDA A SÁBADO: 07h00 às 22h00
+   "hoursText": "SEGUNDA A SÁBADO: 07h00 às 22h00
  DOMINGOS E FERIADOS: 07h00 às 21h00",
    ...
  }
```
O diff aparentava strings idênticas (mesmo texto visível), o que já era a primeira pista
de que a diferença era em caracteres invisíveis, não no conteúdo.

## Sintoma

`parseStoreDetail` (novo adaptador Super Lagoa) devolvia um `hoursText` que parecia
igual ao esperado no teste, mas a comparação `toEqual` falhava mesmo assim.

## Motivo provável ou causa raiz

Duas causas, achadas em sequência com um script Node descartável que imprimiu os
charCodes da string real:
1. O HTML de `.horarios` mistura terminadores de linha: o `<br>` entre dia e horário
   vira `\n` (via `.text` do `node-html-parser`), mas o `<br>` entre um bloco de
   dia/horário e o próximo (ex.: entre "22h00" e "DOMINGOS") preserva o `\r\n` literal
   do arquivo-fonte (a fixture foi salva via `Invoke-WebRequest`/PowerShell, que grava
   `\r\n`). A primeira correção (normalizar `\r\n`→`\n` antes do regex) resolveu só
   metade do problema.
2. Depois de corrigir os terminadores de linha, o teste ainda falhava: char na posição 9
   era ` ` (nbsp) no texto real vs. espaço normal (` `) esperado — o HTML da
   página usa `&nbsp;` entre "A" e "SÁBADO" em "SEGUNDA A SÁBADO".

## Correção aplicada

`packages/sources/src/adapters/superlagoa.ts`, função `fixHoursSeparator`: agora aplica,
nesta ordem, (1) ` ` → espaço normal, (2) `\r\n` → `\n`, (3) o regex original que
insere `": "` antes de qualquer linha começando com dígito.

## Como foi validado

Isolado o problema com um script Node descartável (removido depois) que imprimia
`JSON.stringify` e os charCodes da string devolvida por `node-html-parser` diretamente
contra a fixture real, comparando char a char com a string esperada — foi assim que os
dois bugs foram encontrados e confirmados (não por tentativa e erro). Depois:
`pnpm --filter @budega/sources test` (40/40, incluindo os 3 testes de Super Lagoa),
`tsc --noEmit` e `lint` limpos.

## Como evitar a repetição

O teste `superlagoa.test.ts` já cobre este caso com dado real (fixture, não texto
sintético) — qualquer regressão nesta normalização quebra o teste. Regra geral para
adaptadores futuros: ao extrair texto de HTML de terceiros com `node-html-parser`,
nunca assumir que quebras de linha ou espaços em branco vêm normalizados; sempre
normalizar ` ` e `\r\n` explicitamente antes de qualquer regex que dependa de
separadores específicos, e testar contra fixture real (não só sintética) pelo menos uma
vez por campo que envolva texto livre do site.

## Aprendizado reutilizável

Ao depurar uma comparação de string que parece "visualmente igual" mas falha, não
adivinhe — dump os charCodes (`[...str].map(c => c.charCodeAt(0))`) e compare posição a
posição; a causa quase sempre é um caractere invisível (nbsp, `\r`, BOM, espaço
Unicode diferente), não um erro de lógica.
