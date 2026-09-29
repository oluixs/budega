# Erro — formularios do admin e denuncia nunca enviavam em modo mock por uuid nos schemas

- Data e hora: 2026-09-29 10:44:54 -03:00
- Agente/responsável: Claude Code
- Ambiente: web | Android | iPhone (schemas compartilhados de `packages/shared`)
- Comando ou ação que gerou o erro: revisão do painel admin antes de criar a tela de filiais; confirmado com `offerFormSchema.safeParse(...)` usando os IDs reais de `mock`
- Status: corrigido
- Severidade: alta

## Mensagem completa do erro

```
offerFormSchema  → ["market_id: Selecione um mercado","branch_id: Invalid uuid","category_id: Selecione uma categoria"]
flyerFormSchema  → ["market_id: Selecione um mercado"]
```

(com `market_id = "mkt-bompreco-pinheiros"`, `category_id = "cat-alimentos"`, ou seja, um
mercado e uma categoria **selecionados** nos selects do formulário)

## Sintoma

Em modo mock — o modo padrão do projeto — era impossível:

- cadastrar/duplicar oferta em `/admin/ofertas`;
- cadastrar encarte em `/admin/encartes`;
- enviar uma denúncia pelo botão "Denunciar" das páginas públicas (web e mobile).

Mesmo com o mercado escolhido, o formulário mostrava "Selecione um mercado" e o
`onSubmit` nunca era chamado.

## Motivo provável ou causa raiz

Confirmada: os schemas Zod usavam `z.string().uuid()` para `market_id`, `category_id`,
`branch_id`, `flyer_id` e `offer_id`, mas os dados mock usam IDs legíveis
(`mkt-...`, `cat-...`, `brh-...`). Os testes existentes (`schemas/index.test.ts`,
`admin-actions.test.ts`) passavam porque usavam UUIDs escritos à mão, não os IDs que os
selects realmente enviam.

## Correção aplicada

`packages/shared/src/schemas/index.ts`: novo `recordIdSchema(message)` (string não
vazia) e `optionalRecordId` substituem todos os `.uuid()`. No Supabase real, as colunas
`uuid` do Postgres continuam rejeitando valores inválidos, então nenhuma garantia de
integridade foi perdida — o schema do formulário só precisa saber se algo foi
selecionado.

## Como foi validado

- Novo bloco "schemas aceitam os IDs reais dos dados mock" em
  `packages/shared/src/schemas/index.test.ts` (offer, flyer, branch, report + um caso
  negativo com `market_id` vazio).
- Rodando os testes novos contra o schema antigo: 4 falhas; com a correção: 40/40.
- `pnpm typecheck`, `pnpm test` (40 shared + 18 web), `pnpm lint` passando.

## Como evitar a repetição

Testes de schema de formulário devem usar os IDs de `mock` (os valores que a UI
realmente envia), nunca UUIDs sintéticos. O teste de regressão acima cobre os quatro
schemas com FK.

## Aprendizado reutilizável

Não valide formato de ID em schema de formulário compartilhado entre modo mock e modo
real: deixe o banco validar o tipo e valide no formulário só a presença do valor.
