# Erro — OfferFormDialog nunca submetia por causa de image_url vazio invalido no schema

- Data e hora: 2026-09-28 23:14:43 -03:00
- Agente/responsável: Claude Code
- Ambiente: web (apps/web, `src/components/admin/offer-form-dialog.tsx`)
- Comando ou ação que gerou o erro: `pnpm --filter @budega/web test` (teste novo `admin-actions.test.ts`, "createOffer com dados válidos")
- Status: corrigido
- Severidade: alta (formulário de criação de oferta do admin nunca enviaria de verdade, sem nenhum erro visível na tela)

## Mensagem completa do erro

```
AssertionError: expected false to be true // Object.is equality
- Expected: true
+ Received: false
```
(o `createOffer` retornava `{ success: false, message: "Dados da oferta inválidos." }`
para um payload que deveria ser válido)

## Sintoma

Ao escrever um teste unitário para `createOffer` com dados de oferta aparentemente
válidos (nome, preço, categoria, mercado, datas — tudo preenchido), a validação Zod
(`offerFormSchema`) rejeitava o payload. Investigando, o campo `image_url` estava sendo
enviado como string vazia `""`.

## Motivo provável ou causa raiz

`offerFormSchema.image_url` é `z.string().url("URL inválida").optional().nullable()` —
aceita `undefined`, `null`, ou uma URL válida, mas **não** aceita string vazia (`""` não é
uma URL válida). O componente real `OfferFormDialog` (não só o teste) tem, em
`emptyDefaults`, `image_url: ""` — e o formulário não tem nenhum campo de UI para
`image_url` (nunca foi implementado o upload/URL de imagem na oferta), então todo
formulário novo carrega esse valor padrão inválido e permanece assim até o envio.
Como `react-hook-form` com `zodResolver` **bloqueia silenciosamente** o `onSubmit` quando
há erro de validação em qualquer campo — inclusive um campo sem `FormMessage` visível na
tela — o botão "Salvar oferta" nunca chamaria `createOffer` de verdade; o usuário só veria
o botão "não fazer nada" ao clicar, sem mensagem de erro nenhuma, porque não há
`<FormField name="image_url">` renderizando `<FormMessage />` para mostrar o problema.

## Correção aplicada

Trocado `image_url: ""` para `image_url: null` em `emptyDefaults` de
`offer-form-dialog.tsx`. Como o objeto de "duplicar oferta" (`initialValues` em
`offers-table.tsx`) faz spread sobre `emptyDefaults` e também não define `image_url`,
essa mesma correção resolve os dois fluxos (criar e duplicar).

## Como foi validado

Teste `admin-actions.test.ts > createOffer com dados válidos simula sucesso` passa após
a correção do valor de teste equivalente (`image_url: null`). `pnpm --filter @budega/web
test` → toda a suíte (18 testes) passando.

## Como evitar a repetição

Sempre que um campo de formulário for **opcional e validado com `.url()`/`.email()`**
(que rejeitam string vazia), o valor padrão em `useForm({ defaultValues })` deve ser
`null` (ou `undefined`), nunca `""`. E todo `FormField` do schema — mesmo um campo ainda
sem input de UI — precisa ou ter um valor padrão válido, ou ganhar um `<FormMessage />`
visível, para que uma falha de validação silenciosa não vire um botão "morto".

## Aprendizado reutilizável

Escrever pelo menos um teste de "caminho feliz" (dados válidos → sucesso) para toda
Server Action que valida com Zod, não só testes de rejeição — foi exatamente esse tipo de
teste que expôs este bug. Um formulário que "não faz nada" ao clicar em salvar, sem erro
visível, é quase sempre um campo com valor padrão inválido para o schema.
