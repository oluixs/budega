# Registro de mudança — README completo eas-json e instrucoes de deploy build e limitacoes conhecidas

- Data e hora: 2026-09-28 23:24:20 -03:00
- Agente/responsável: Claude Code
- Branch: master
- Commit: a9b639b
- Tipo: docs
- Status: concluída

## O que foi alterado

- `README.md` da raiz reescrito por completo: estrutura do monorepo, pré-requisitos,
  instalação, modo mock (padrão), tabela de comandos, configuração do Supabase real
  (migrate/seed), como rodar o mobile no Expo Go, geração de builds Android/iPhone com
  EAS, deploy da web, link para `DESIGN.md`/`PLAN.md`, seção de auditoria e uma seção
  explícita de **Limitações conhecidas e próximos passos** (nenhuma verificação visual
  real em navegador/dispositivo, mapa não implementado, gerenciar filiais sem UI,
  RLS sem middleware de redirect no admin, migration nunca rodada contra Postgres real,
  ausência de testes E2E/Playwright e de testes no mobile, tokens de cor duplicados
  entre web/mobile).
- `apps/mobile/eas.json` criado com perfis `development`, `preview` e `production`.
- `apps/web/README.md` e `apps/mobile/README.md` (este último não existia) reescritos
  para apontar para o README da raiz em vez do boilerplate padrão do
  `create-next-app`/`create-expo-app`.

## Motivo

Cobrir os entregáveis da seção 13 do brief (README com comandos exatos, instruções de
deploy web, instruções para Android/iPhone, instruções para gerar APK/AAB com EAS,
limitações conhecidas e próximos passos).

## Impacto

Nenhuma mudança de código/comportamento — apenas documentação. Nenhum build EAS nem
deploy foi de fato executado nesta sessão (exigiria conta Expo/EAS e credenciais de
assinatura que não existem no ambiente) — os comandos documentados são o caminho a
seguir, não uma alegação de que já foram executados.

## Validação executada

Revisão manual do conteúdo contra os comandos reais já validados nesta sessão
(`pnpm install`, `pnpm dev`/`dev:web`/`dev:mobile`, `pnpm lint`/`typecheck`/`test`/`build`,
`pnpm supabase:migrate`/`supabase:seed`) — todos os comandos citados no README foram
efetivamente executados com sucesso em algum momento desta sessão, exceto os de EAS
build/submit e deploy web (documentados, não executados, por falta de credenciais).

## Pendências e riscos

Nenhuma nova pendência — este registro consolida e documenta as pendências já
levantadas nos registros anteriores.
