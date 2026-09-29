# Erro — suspender mercado nao tinha efeito publico

- Data e hora: 2026-09-29 11:18:42 -03:00
- Agente/responsável: Claude Code
- Ambiente: web | Android | iPhone | Supabase
- Comando ou ação que gerou o erro: `grep is_suspended` em web, mobile e shared ao revisar as políticas RLS de `markets`
- Status: corrigido
- Severidade: média

## Mensagem completa do erro

Sem mensagem. `is_suspended` só era lido pelo painel admin (badge e contagem do
dashboard); nenhuma consulta pública nem política RLS filtrava por ele
(`markets_select_public using (true)`).

## Sintoma

O botão "Suspender" do admin mudava o badge para "Suspenso", mas o mercado continuava
aparecendo na home, no explorar, na página do mercado e no app, com todas as ofertas e
encartes.

## Motivo provável ou causa raiz

Confirmada: a regra "suspenso = fora do ar" nunca foi implementada em nenhuma camada.

## Correção aplicada

- Banco: migration 0002 — `markets_select_public` exige `not is_suspended` (ou gerente/
  admin) e nova função `is_market_public()` aplicada às policies públicas de filiais,
  ofertas e encartes.
- Modo mock: `isMarketPublic`, `filterPublicMarkets`, `filterByPublicMarkets` em
  `packages/shared/src/business/visibility.ts`, usados em `apps/web/src/lib/data.ts` e
  `apps/mobile/src/lib/data.ts` para as duas fontes se comportarem igual.

## Como foi validado

- `tests/migrations.test.ts > mercado suspenso some para o público junto com filiais, ofertas e encartes`
  (anon vê 0; admin continua vendo tudo).
- `visibility.test.ts` (2 testes).

## Como evitar a repetição

Toda flag de moderação precisa de um teste que verifique o efeito **público** dela, não
só a mudança do valor no admin.

## Aprendizado reutilizável

Um botão de moderação que só muda um badge não está implementado: confirme onde a flag é
lida antes de dar a funcionalidade por pronta.
