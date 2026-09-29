# Erro — visualizador de encarte do app tratava pdf como imagem

- Data e hora: 2026-09-29 14:09:00 -03:00
- Agente/responsável: Claude Code
- Ambiente: Android | iPhone
- Comando ou ação que gerou o erro: leitura de `apps/mobile/src/app/encartes/[id].tsx`
- Status: corrigido
- Severidade: alta (todo encarte em PDF ficaria em branco no app)

## Mensagem completa do erro

Sem mensagem — `<Image source={{ uri: flyer.file_url }}>` com um PDF.

## Sintoma

Mesmo defeito já corrigido na web: o app só sabia exibir encarte em imagem.

## Motivo provável ou causa raiz

Confirmada: `file_type` ignorado na tela de encarte do app.

## Correção aplicada

Encarte em PDF mostra a capa (1ª página, com zoom), o botão "Ver encarte completo (PDF)"
(abre o arquivo original) e o crédito ao site oficial. Encarte em imagem continua igual.

## Como foi validado

`tsc`, lint e `expo export` do app; tela conferida na versão web do app.

## Como evitar a repetição

Quando um defeito é corrigido numa plataforma, procurar o equivalente na outra (web ↔ app)
no mesmo ciclo.

## Aprendizado reutilizável

Web e app têm telas "gêmeas": todo bug de regra de exibição deve ser verificado nas duas.
