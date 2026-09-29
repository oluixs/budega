# Registro de mudança — apps-mobile app Expo Router SDK 57 tabs telas e integracao com budega-shared

- Data e hora: 2026-09-28 23:08:51 -03:00
- Agente/responsável: Claude Code
- Branch: master
- Commit: 6a744b0
- Tipo: feature
- Status: concluída

## O que foi alterado

- `apps/mobile` criado com `create-expo-app` (Expo SDK 57.0.25, React Native 0.86.3,
  template TypeScript em branco), depois integrado ao monorepo: renomeado para
  `@budega/mobile`, `App.tsx`/`index.ts` removidos em favor de `expo-router/entry`.
- **Expo Router** configurado com estrutura `src/app/`: `_layout.tsx` (Stack raiz),
  `(tabs)/_layout.tsx` (navegação inferior com 4 abas: Explorar, Buscar, Favoritos,
  Perfil, usando `lucide-react-native`), rotas de detalhe fora das tabs
  (`mercados/[slug].tsx`, `ofertas/[id].tsx`, `encartes/[id].tsx`).
- **NativeWind 4.2.7** (Tailwind v3.4.17 — versão diferente da v4 usada na web, ver nota
  em `tailwind.config.js`) configurado com os mesmos tokens de cor de `DESIGN.md`
  (`brand`, `accent`, `neutral`, `success`/`warning`/`danger`/`info`) espelhados
  manualmente em `apps/mobile/tailwind.config.js`.
- Camada de dados própria (`src/lib/data.ts`, `src/lib/supabase.ts`, `src/lib/env.ts`,
  `src/lib/actions.ts`) replicando a lógica de `apps/web` (mock vs. Supabase real via
  `EXPO_PUBLIC_*`), sem poder reaproveitar o arquivo da web por causa do
  `import "server-only"` que não existe em React Native.
- `packages/supabase/src/client.ts` ganhou um parâmetro opcional `authStorage` para que
  o mobile passe `@react-native-async-storage/async-storage` (React Native não tem
  `localStorage`) — web continua sem passar esse parâmetro e usa o `localStorage` padrão.
- Hooks: `useFavorites` (favoritos locais via AsyncStorage, mesma regra de negócio 10.6
  da web) e `useGeolocation` (via `expo-location`, com fallback de erro amigável).
- Componentes: `MarketCard`, `OfferCard`, `PriceTag`, `EmptyState`, `FavoriteButton`,
  `ReportModal` (denúncia com modal nativo, já que o app não tem os componentes shadcn
  da web) — todos com áreas de toque adequadas para mobile.
- 4 telas de abas + 3 telas de detalhe, cobrindo as mesmas jornadas da web: localização,
  busca com filtro "aberto agora", favoritos sem cadastro, mercado (rota, ligar,
  WhatsApp, compartilhar, denunciar, encarte, ofertas), oferta (preço, compartilhar,
  rota), encarte (zoom simples, navegação entre encartes do mesmo mercado,
  compartilhar, denunciar).
- Sem chave de mapa configurada — não há mapa nativo implementado; a tela "Buscar" lista
  mercados com distância e ordenação, cobrindo o requisito de fallback funcional.

## Motivo

Implementar a Fase 3 do `PLAN.md` (Android/iOS via Expo) com as mesmas jornadas da web,
compartilhando tipos/regras de negócio/dados mock de `packages/shared`.

## Impacto

- Primeiro consumidor real de `@budega/shared`/`@budega/supabase` via Metro (bundler
  diferente do Turbopack da web) — expôs um problema de resolução de módulo que também
  afeta o pacote em geral (ver registro de erro sobre `react-native-css-interop`).
- `packages/supabase` ganhou uma pequena extensão de API (`authStorage`) que é
  retrocompatível (opcional, web não precisa mudar nada).

## Validação executada

Nesta sessão não há Android SDK, emulador nem dispositivo físico disponível — validação
manual num aparelho real **não foi possível**. Em vez disso, validação equivalente via
linha de comando:
- `pnpm --filter @budega/mobile exec tsc --noEmit` → sem erros.
- `npx expo lint` (dentro de `apps/mobile`) → sem problemas (corrigido 1 warning de
  import duplicado em `ofertas/[id].tsx`).
- `npx expo-doctor` → **21/21 checagens passando** (depois de resolver 3 problemas reais,
  ver registros de erro: lockfile duplicado pré-existente, `newArchEnabled` inválido no
  schema do SDK 57, e módulos nativos duplicados/versões incompatíveis de
  reanimated+worklets — resolvido fixando `react-native-reanimated@4.5.1` +
  `react-native-worklets@0.10.1`, as versões que o próprio `expo-doctor` confirma serem
  as corretas para o SDK 57, e adicionando `react-native-css-interop` como dependência
  direta).
- `npx expo export --platform android` **e** `--platform ios` → bundle completo com
  sucesso (3667 e ~3560 módulos respectivamente, sem erro de resolução) — isso valida
  que todo o grafo de imports do app (incluindo `@budega/shared`, NativeWind,
  Reanimated, Expo Router) resolve corretamente pelo Metro, o mais próximo que se pode
  chegar de "o app funciona" sem um dispositivo/emulador real.
- `pnpm --filter @budega/web build` e `pnpm --filter @budega/shared test` (29→33 testes)
  continuaram passando depois de todas as mudanças acima, incluindo depois de reverter
  uma tentativa de `nodeLinker: hoisted` que quebrou a web (ver registro de erro).

## Pendências e riscos

- **Nenhuma verificação visual real** (Expo Go, emulador Android/iOS ou dispositivo
  físico) foi feita nesta sessão — o ambiente não tem Android SDK/emulador disponível.
  Isso é uma limitação do ambiente, documentada no README, não uma alegação de que o app
  foi "testado no celular".
- Mapa nativo (react-native-maps) não implementado — só a lista com distância. Consistente
  com a mesma decisão tomada na web.
- Cores hard-coded duplicadas entre `DESIGN.md`, `apps/web/src/app/globals.css` e
  `apps/mobile/tailwind.config.js` (Tailwind v4 vs. v3 impede um arquivo de tokens único
  facilmente compartilhado) — mudanças de paleta precisam ser replicadas manualmente nos
  3 lugares. Documentado em `DESIGN.md`.
- `EAS build`/`eas.json` ainda não configurado — fica para os entregáveis de
  documentação (README) desta mesma fase.
