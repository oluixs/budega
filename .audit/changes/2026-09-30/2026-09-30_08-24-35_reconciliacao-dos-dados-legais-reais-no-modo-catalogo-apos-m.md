# Registro de mudança — reconciliação dos dados legais reais no modo catálogo após merge

- Data e hora: 2026-09-30 08:24:35 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: (pendente — merge em andamento)
- Tipo: fix
- Status: concluída

## O que foi alterado

Ao mesclar o trabalho desta sessão (modo catálogo, ver
`.audit/changes/2026-09-29_...leitura-manual...`) com 5 commits de uma sessão externa
que rodou em paralelo (Supabase real conectado e sincronizado, terceira rede Super
Lagoa, identificação legal real preenchida pelo responsável, analytics), o merge do
`git` (`git merge origin/main`, autorizado pelo usuário após eu explicar a divergência)
teve conflito em `apps/web/src/app/termos/page.tsx` e `packages/shared/src/data/regional.json`
— os demais arquivos (`legal.ts`, `privacidade/page.tsx`, `PLAN.md`) resolveram sozinhos.

Ao revisar o conflito de `termos/page.tsx`, percebi um problema de design: meu modo
catálogo escondia a identidade real do responsável (nome, CPF, endereço, telefone —
agora preenchidos de verdade em `lib/legal.ts` pela sessão externa) atrás do texto
genérico "projeto independente", porque eu tinha condicionado a exibição da identidade a
`hasAccounts` (Supabase configurado), quando na verdade identidade e contas são coisas
diferentes: o responsável pode querer se identificar mesmo num site sem contas.

Corrigido: novo `hasIdentity` em `lib/legal.ts` (verdadeiro quando `controllerName` está
preenchido), independente de `hasAccounts`. `apps/web/src/app/termos/page.tsx` (seção 1
"quem somos" e seção 4 "é responsável por um mercado") e
`apps/web/src/components/legal/catalog-privacy.tsx` (seção 1 "quem mantém o Budega")
agora mostram a identidade real sempre que preenchida, e só caem no texto genérico
quando de fato não há identificação. `hasAccounts` continua controlando só o que
depende de contas de verdade (seção "conta e uso aceitável", menção ao painel).

`packages/shared/src/data/regional.json` e `packages/sources/src/data/offers-cache.json`
(gerados): resolvidos rodando `pnpm importar` de novo em vez de mesclar o JSON à mão —
junta os 3 mercados/72 lojas/9 encartes já sincronizados pela sessão externa com as 143
ofertas transcritas manualmente nesta sessão. Dois sites tinham encarte novo desde
ontem (Cometa "CARNES", Frangolândia) — entraram no retrato sem leitura ainda.

`PLAN.md`: seção de hospedagem atualizada — agora que existe um Supabase real
sincronizado, o usuário escolhe no import do Vercel entre publicar com contas
(configurando `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`) ou em modo
catálogo (sem essas variáveis).

## Motivo

Duas sessões trabalharam em paralelo no mesmo repositório sem coordenação; o merge
precisava preservar o trabalho de ambas sem regressão, e a identidade legal real recém
preenchida não podia ficar escondida pelo modo catálogo que eu tinha acabado de criar.

## Impacto

Política de Privacidade e Termos mostram a identidade real do responsável em qualquer
modo (catálogo ou com contas) quando ela está preenchida; o modo catálogo simplificado
só se aplica à explicação de tratamento de dados (que de fato muda sem contas).

## Validação executada

Depois do merge: `pnpm typecheck`/`pnpm lint` (5 pacotes, limpos), `pnpm test` (176
testes unitários, 4 pacotes, todos passando), `pnpm --filter @budega/web test:e2e`
rodando em paralelo a este registro. `pnpm audit:validate` — OK (26 mudanças, 39 erros).
Inspeção manual do `regional.json` regenerado: 3 mercados, 72 lojas, 9 encartes, 143
ofertas.

## Pendências e riscos

- Dois encartes novos apareceram nos sites desde ontem (Cometa "CARNES", Frangolândia)
  e ainda não foram lidos — mesma rotina de leitura manual semanal já documentada.
- Sessões futuras devem rodar `git fetch`/`git log origin/main` antes de assumir que o
  histórico local está atualizado, especialmente após uma compactação de contexto longa.
