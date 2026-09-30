# Registro de mudança — conexão real com Supabase, mapa geral estilo Waze e correção do Button Base UI

- Data e hora: 2026-09-30 09:11:16 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: (pendente)
- Tipo: feature + fix
- Status: concluída (migration 0005 aplicada pelo usuário no SQL Editor; sincronização de ofertas pendente)

## O que foi alterado

**Conexão real com o Supabase** (pedido do usuário: "pode usar o supabase ja que ja esta
vinculado"):
- Credenciais reais passadas pelo usuário no chat, gravadas só em `.env`/`.env.local`
  gitignorados: `apps/web/.env.local` (`NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`),
  `apps/mobile/.env` (`EXPO_PUBLIC_...`), `packages/supabase/.env` (`SUPABASE_URL` +
  `SUPABASE_SERVICE_ROLE_KEY`, para os scripts administrativos). `DATABASE_URL` não foi
  fornecida (o modelo colado tinha `[YOUR-PASSWORD]`) — migrations novas precisam ser
  aplicadas pelo SQL Editor do Supabase até termos essa credencial.
- `pnpm --filter @budega/supabase sync:regional` rodado contra o projeto real: revelou
  que a tabela `offers` não tinha `flyer_id`/`origin` (campos usados pela leitura de
  ofertas dos encartes desta semana) → `packages/supabase/migrations/0005_offer_source_metadata.sql`
  (colunas opcionais, sem RLS nova). Aplicada pelo usuário no SQL Editor.

**Mapa geral "estilo Waze"** (pedido do usuário): novo `/mapa` (web) e aba "Mapa" (mobile,
5ª aba) mostrando **todas** as lojas cadastradas (72, nas 3 redes), sem filtro nem busca.
- `MarketsMap`/`MarketsMapInner` (web) e `MarketsMap` (mobile, WebView) ganharam
  `fitToPoints`/`zoom`: o `/explorar` com filtro continua ajustando o zoom para caber nos
  resultados (comportamento antigo), mas o mapa geral fica **fixo em Fortaleza** (zoom 12)
  e não encolhe por causa de lojas do interior (Sobral, Juazeiro do Norte — Super Lagoa).
- Navegação: item "Mapa" no cabeçalho/menu mobile da web; ícone de mapa na tab bar do app.

**Revisão de bugs com dados reais** (pedido do usuário): nenhuma sessão anterior tinha
navegado o site com Supabase de verdade nem aberto a versão web do mobile checando erro
de console/exceção sistematicamente — dois bugs sérios apareceram assim que testado (ver
`.audit/errors/2026-09-30_09-10-37` e `_09-10-39`):
1. `next.config.ts` sem o host de imagem da Super Lagoa → erro 500 na home/explorar.
2. `tailwind.config.js` do mobile sem `darkMode: "class"` → app inteiro crashava na
   versão web (tela de erro do Metro em toda rota).

**Correção adicional (achada nos screenshots reais)**: aviso do Base UI
("A component that acts as a button expected a native <button>...") em toda página que
usa `<Button render={<Link .../>}>` (cabeçalho, rodapé de encarte, home, etc. — 11
ocorrências). `apps/web/src/components/ui/button.tsx`: `nativeButton` agora tem padrão
inteligente (`false` sempre que `render` é passado, já que neste projeto `render` só é
usado para navegação, nunca para outro `<button>`), então nenhuma chamada precisa mais
passar `nativeButton={false}` manualmente.

**Testes**: `apps/web/src/lib/image-hosts.test.ts` (novo) confere que todo host de imagem
do retrato real está em `next.config.ts` — pega o bug nº 1 sem precisar rodar o servidor
com Supabase real.

## Motivo

Pedidos do usuário: "Revise os bugs/erros no sistema, resolva a versão mobile para
Android/iOS. [...] deve haver um mapa onde mostra o geral de todos os supermercados em
fortaleza tal qual o Waze, pode usar o supabase ja que ja esta vinculado".

## Impacto

- Site e app funcionam com o Supabase real (mercados/lojas/encartes já sincronizados;
  ofertas pendentes da migration + resync).
- Dois bugs que derrubavam páginas inteiras (500 na web, crash total no mobile web)
  corrigidos antes de afetar alguém de verdade.
- Vitrine "Mapa de mercados" nova em ambas as plataformas.

## Validação executada

`pnpm typecheck`/`pnpm lint` (5 pacotes) limpos. Navegação manual (curl + Playwright
screenshots) do site com Supabase real: home, explorar (lista e mapa), mapa geral,
mercado, favoritos, entrar, cadastro, privacidade, termos — sem erro de console nem
página 500. Versão web do mobile (`expo start --web`): 5 rotas sem erro de console.
Suíte automatizada revalidada depois (ver próximo registro).

## Pendências e riscos

- Sincronizar as 143 ofertas para o Supabase real (`pnpm --filter @budega/supabase
  sync:regional`) agora que a migration 0005 foi aplicada.
- `DATABASE_URL` ainda não disponível — migrations futuras dependem do SQL Editor manual
  até o usuário passar essa credencial.
- O chamador exato de `setColorScheme` (bug nº 2) não foi isolado, só contornado pela
  configuração recomendada pela própria mensagem de erro.
