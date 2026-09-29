# Erro — pagina de favoritos estatica sem revalidacao

- Data e hora: 2026-09-29 12:49:50 -03:00
- Agente/responsável: Claude Code
- Ambiente: web
- Comando ou ação que gerou o erro: `pnpm --filter @budega/web test:e2e` ("favoritar um mercado aparece em Favoritos" falhou)
- Status: corrigido
- Severidade: média

## Mensagem completa do erro

```
Locator: getByText('Bom Preço Pinheiros').first()
Error: element(s) not found
(página mostrava "Você ainda não salvou nada")
```

## Sintoma

O teste favoritava um mercado fictício, mas `/favoritos` listava os mercados reais: a
página tinha sido gerada no build (em modo regional) e o servidor de teste rodava em modo
demo.

## Motivo provável ou causa raiz

Confirmada: `/favoritos` é estática (`○`) e busca mercados/ofertas no build, sem
`revalidate`. Além do teste, isso é um bug real de produção: ofertas vencidas ficariam na
página (mesmo caso já corrigido na home).

## Correção aplicada

- `app/favoritos/page.tsx`: `export const revalidate = 300`.
- `playwright.config.ts`: o próprio Playwright faz o build com `BUDEGA_DADOS=demo`
  (script `test:e2e` = `playwright test`), para build e servidor usarem os mesmos dados.

## Como foi validado

`test:e2e`: 52/52.

## Como evitar a repetição

Regra (CLAUDE.md): toda página estática que exibe conteúdo com validade precisa de
`revalidate`. Conferir a tabela de rotas do build.

## Aprendizado reutilizável

Variável de ambiente lida no servidor não afeta páginas já geradas no build — o ambiente do
build importa tanto quanto o do servidor.
