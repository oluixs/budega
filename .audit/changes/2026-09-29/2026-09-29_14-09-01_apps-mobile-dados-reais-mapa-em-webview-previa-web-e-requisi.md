# Registro de mudança — apps-mobile dados reais mapa em webview previa web e requisitos das lojas

- Data e hora: 2026-09-29 14:09:01 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: 6ad6255 (base)
- Tipo: feature | bugfix | config
- Status: concluída (verificação em aparelho/emulador pendente)

## O que foi alterado

- `apps/mobile/src/lib/data.ts`: sem Supabase, usa os dados reais da região — da web
  publicada (`EXPO_PUBLIC_API_URL` → `/api/regional`, com tempo limite de 8 s) ou do retrato
  embutido; `EXPO_PUBLIC_BUDEGA_DADOS=demo` para os fictícios. `getAllBranches()`.
- Web: nova rota `apps/web/src/app/api/regional/route.ts` (dados para o app, cache 10 min).
- `components/markets-map.tsx`: Leaflet + OpenStreetMap numa WebView
  (`react-native-webview@13.16.1`, incluído no Expo Go); na web do app, iframe `srcDoc`
  (`sandbox="allow-scripts"`, só aceita mensagens do próprio iframe). Popups montados com
  `textContent` (dados de terceiros) e JSON embutido com `<`/U+2028/U+2029 escapados; só
  rotas `/mercados/…` e links `https://` são abertos.
- Telas: busca (lista/mapa, distância até a loja mais próxima, busca pelos bairros das
  lojas), mercado (descrição, site oficial, encartes com capa/validade/loja exclusiva, mapa
  e lista das lojas), encarte (PDF → capa + PDF original + crédito), home ("Encartes da
  semana", "Mercados da região", ofertas só se houver), card com logo e "Mais perto".
- Requisitos das lojas: links para Política de Privacidade e Termos no Perfil
  (`buildWebUrl`); texto do pedido de localização em português no plugin `expo-location`
  e localização em segundo plano desligada.
- Abas: altura + área segura, rótulos legíveis, cor inativa AA.
- Pré-visualização web do app: `react-native-web@~0.21.3`, `react-dom@19.2.3`,
  `@expo/metro-runtime@~57.0.16` (versões da lista oficial do SDK 57, instaladas com pnpm).
- Atualizações de patch pedidas pelo expo-doctor: `expo@~57.0.26`,
  `expo-constants@~57.0.20`, `expo-router@~57.0.24`.
- Ambiente: JDK 17 portátil, Android SDK (platform-tools, emulator, android-35
  google_apis x86_64) e AVD `Budega_Pixel` instalados no perfil do usuário.

## Motivo

Pedido do usuário: app com os dados reais, mapa interativo e emulador.

## Impacto

App pronto para Expo Go com os dados reais. Nenhuma chave de API necessária.

## Validação executada

- `tsc`, `expo lint` e `expo-doctor` (21/21) no app.
- Versão web do app no Chromium (Pixel 7): home, busca, mapa (44 marcadores = 43 lojas +
  "você está aqui"), mercado, encarte, perfil — sem erros de console.
- Monorepo: typecheck/lint (5 pacotes), 146 testes unitários, 52 e2e.

## Pendências e riscos

- **Emulador**: não inicia sem aceleração — precisa ativar a "Plataforma do Hipervisor do
  Windows" ou instalar o driver do emulador (ação de administrador; passos no README).
- O domínio `budega.app` usado em links (compartilhar, páginas legais) é um placeholder:
  precisa ser o domínio real onde a web for publicada.
- WebView carrega o Leaflet de `unpkg.com` (versão fixa 1.9.4): precisa de internet.
