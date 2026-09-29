# Erro — labels dos formularios nao nomeavam os campos

- Data e hora: 2026-09-29 11:45:03 -03:00
- Agente/responsável: Claude Code
- Ambiente: web
- Comando ou ação que gerou o erro: e2e `getByRole('dialog').getByLabel('Produto')` não encontrava o campo; a árvore de acessibilidade mostrava `textbox "Ex.: Banana Prata"` (nome vindo do placeholder)
- Status: corrigido
- Severidade: média (acessibilidade — DESIGN.md exige WCAG AA)

## Mensagem completa do erro

```
Error: locator.fill: Test timeout of 30000ms exceeded.
  - waiting for getByRole('dialog').getByLabel('Produto')
```

## Sintoma

Nenhum campo de nenhum formulário (login, cadastro, denúncia, todos os do admin) tinha
nome acessível: leitores de tela liam só o placeholder ou nada; clicar no rótulo não
focava o campo.

## Motivo provável ou causa raiz

Confirmada: o `FormControl` local (`components/ui/form.tsx`, recriado à mão porque o
registry do shadcn não trouxe o `form`) envolvia o campo num `<div id=...>` em vez de
repassar `id`/`aria-*` ao próprio campo. O `<label for>` apontava para a div.

## Correção aplicada

`FormControl` agora faz `cloneElement` no filho com `id`, `aria-describedby` e
`aria-invalid` (mesmo contrato do Slot do shadcn). Nos 5 `Select`, o `FormControl` passou a
envolver o `SelectTrigger` (o `Select` do Base UI não é um elemento DOM).

## Como foi validado

e2e `getByLabel("Produto")`, `getByLabel("Nome da filial")`, `getByLabel("Motivo")` etc.
passam; typecheck garante que `FormControl` recebe exatamente um elemento.

## Como evitar a repetição

Testes e2e localizam campos por rótulo (`getByLabel`), então um rótulo desconectado
quebra o teste.

## Aprendizado reutilizável

Componente de formulário recriado à mão precisa ser verificado na árvore de
acessibilidade: "parece certo na tela" não garante `<label for>` ligado ao campo.
