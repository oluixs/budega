# Erro — visualizador de encarte tratava pdf como imagem

- Data e hora: 2026-09-29 12:49:49 -03:00
- Agente/responsável: Claude Code
- Ambiente: web
- Comando ou ação que gerou o erro: leitura de `components/flyer/flyer-viewer.tsx` ao integrar os encartes reais do Cometa (todos em PDF)
- Status: corrigido
- Severidade: alta (todo encarte em PDF ficaria quebrado)

## Mensagem completa do erro

Sem mensagem — `FlyerViewer` recebia só `fileUrl` e sempre renderizava `<Image src={fileUrl}>`,
ignorando `file_type`. Com um PDF, o navegador mostraria uma imagem quebrada.

## Sintoma

O schema e o admin aceitavam encarte `pdf`, mas a página `/encartes/[id]` só funcionava
com imagem. Os dados mock usavam só imagens, então ninguém percebeu.

## Motivo provável ou causa raiz

Confirmada: o tipo do arquivo nunca era consultado na exibição.

## Correção aplicada

`FlyerViewer` recebe o encarte inteiro: imagem → exibe com zoom; PDF → exibe a capa
(`cover_url`, 1ª página) com zoom e o botão "Ver encarte completo (PDF)" que abre o arquivo
original no site do mercado, mais o crédito "Encarte publicado por X no site oficial".
Não embutimos o PDF: navegadores de celular não exibem PDF embutido de forma confiável.

## Como foi validado

Screenshot de `/encartes/cometa-encarte-512` (dados reais) mostrando capa, botão e crédito.

## Como evitar a repetição

Dados de teste devem cobrir todos os valores de um enum usado na interface (aqui,
`file_type: "pdf"`) — os encartes importados do Cometa passam a exercitar o caso PDF.

## Aprendizado reutilizável

Se o schema aceita variantes (pdf/imagem), a interface precisa de um caminho para cada uma.
