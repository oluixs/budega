# Registro de mudança — Preenche identificacao do responsavel legal (LEGAL) com dados reais

- Data e hora: 2026-09-29 22:46:22 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: 530df5b
- Tipo: config
- Status: concluída

## O que foi alterado

`apps/web/src/lib/legal.ts` preenchido com os dados reais do responsável fornecidos
diretamente pelo usuário no chat: nome completo, CPF, telefone e e-mail; endereço
(logradouro e número) também fornecido pelo usuário, com cidade/UF inferidos do contexto
do projeto (foco em Fortaleza) e do DDD do telefone — bairro e CEP não foram informados
e ficam como pendência documentada em comentário no próprio arquivo. Adicionado o campo
novo `contactPhone` (não existia no schema original de `LEGAL`). `apps/web/src/app/termos/page.tsx`
e `apps/web/src/app/privacidade/page.tsx` atualizados para exibir o telefone de contato
no parágrafo de identificação do controlador.

## Motivo

`legal.ts` já existia com todos os campos vazios (placeholder "PREENCHA antes de
publicar"), o que fazia `/termos` e `/privacidade` mostrarem o aviso de "dados
pendentes" — a regra do projeto proíbe inventar esses dados
(`Nunca invente dados de identificação legal`), então eles só podiam vir do próprio
responsável. O usuário forneceu telefone/e-mail/CPF espontaneamente e, quando
perguntado sobre os dois campos que ainda faltavam (nome completo e endereço), forneceu
ambos.

## Impacto

Só `apps/web` (páginas públicas `/termos` e `/privacidade`). Sem impacto em banco,
autenticação ou lógica de negócio. Dado sensível: como o repositório GitHub `budega` é
público, CPF e demais dados pessoais do responsável passam a existir em texto plano no
histórico do Git a partir deste commit — isso é intencional e exigido pela LGPD/Decreto
7.962/2013 (identificação do controlador do tratamento de dados), não um vazamento
acidental; foi confirmado explicitamente com o usuário antes de commitar.

## Validação executada

`pnpm --filter @budega/web exec tsc --noEmit` (limpo) e
`pnpm --filter @budega/web lint` (limpo). Não foi rodado `test:e2e` porque a mudança é
só de texto estático nas páginas legais (sem novo componente, formulário ou estado).

## Pendências e riscos

Bairro e CEP do endereço do responsável não foram informados — `controllerAddress` fica
com só logradouro/número/cidade/UF. Completar em `apps/web/src/lib/legal.ts` quando o
usuário tiver esse dado, se quiser o endereço completo nas páginas legais.
