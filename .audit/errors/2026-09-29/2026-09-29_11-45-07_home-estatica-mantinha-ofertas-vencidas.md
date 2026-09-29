# Erro — home estatica mantinha ofertas vencidas

- Data e hora: 2026-09-29 11:45:07 -03:00
- Agente/responsável: Claude Code
- Ambiente: web
- Comando ou ação que gerou o erro: leitura da tabela de rotas do `next build` (`○ /` = estática, sem revalidate)
- Status: corrigido
- Severidade: média (regra de negócio)

## Mensagem completa do erro

```
┌ ○ /
○  (Static)   prerendered as static content
```

## Sintoma

A home era gerada uma única vez no build. Uma oferta ou encarte que vencesse depois do
deploy continuaria em "Ofertas em destaque" indefinidamente — contrariando a regra
"vencido some automaticamente" (e o próprio texto da home, "Ofertas sempre atuais").

## Motivo provável ou causa raiz

Confirmada: `app/page.tsx` não declarava `revalidate`, e o filtro de vigência
(`filterActiveOffers`) roda na geração da página.

## Correção aplicada

`export const revalidate = 300` em `app/page.tsx` (regera a cada 5 min no máximo). As
ações do admin já chamam `revalidatePath("/", "layout")` para refletir mudanças na hora.

## Como foi validado

`next build` passa; rota continua pré-renderizada, agora com revalidação.

## Como evitar a repetição

Toda página estática que mostra conteúdo com validade precisa de `revalidate`.

## Aprendizado reutilizável

Olhe a tabela de rotas do build: `○` em página que depende de "agora" é bug.
