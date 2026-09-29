# Erro — botao denunciar ausente nas paginas de mercado e oferta

- Data e hora: 2026-09-29 11:45:06 -03:00
- Agente/responsável: Claude Code
- Ambiente: web
- Comando ou ação que gerou o erro: e2e `getByRole('button', { name: 'Denunciar' })` em `/mercados/[slug]` não encontrava o botão
- Status: corrigido
- Severidade: média (requisito do brief)

## Mensagem completa do erro

```
Error: locator.click: Test timeout of 30000ms exceeded.
  - waiting for getByRole('button', { name: 'Denunciar' }).first()
```

## Sintoma

`ReportDialog` só era usado em `/encartes/[id]`. Não havia como denunciar "preço
incorreto", "oferta vencida" ou "mercado incorreto" — três dos cinco motivos do brief
(§7 Denúncias) não tinham onde ser usados.

## Motivo provável ou causa raiz

Confirmada: o componente foi criado, mas só incluído na página de encarte.

## Correção aplicada

`ReportDialog` adicionado em `mercados/[slug]/page.tsx` (motivo padrão
"mercado_incorreto") e `ofertas/[id]/page.tsx` ("preco_incorreto", com `market_id`).
(O app mobile já tinha `report-modal.tsx` nas telas.)

## Como foi validado

e2e "denunciar mostra o motivo pelo nome e envia em modo demonstração" na página do
mercado, desktop e celular.

## Como evitar a repetição

Fluxo de denúncia coberto por e2e.

## Aprendizado reutilizável

Para cada requisito do brief, confira que existe um caminho na interface até ele — um
componente pronto que ninguém renderiza não conta.
