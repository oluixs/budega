# Erro — Expo web trava com NativeWind dark mode "media" em todas as rotas

- Data e hora: 2026-09-30 09:10:39 -03:00
- Agente/responsável: Claude Code
- Ambiente: mobile (apps/mobile — `expo start --web`)
- Comando ou ação que gerou o erro: abrir qualquer rota da versão web do app (`npx expo start --web`)
- Status: corrigido
- Severidade: crítica (tela de erro em vez do app, em toda rota)

## Mensagem completa do erro

```
Uncaught Error
Cannot manually set color scheme, as dark mode is type 'media'. Please use
StyleSheet.setFlag('darkMode', 'class')
```

## Sintoma

A versão web do app (usada nesta máquina para verificar o mobile, já que o emulador
Android depende do Hipervisor do Windows, ainda sem privilégio de admin) mostrava a tela
vermelha de erro do Metro em **toda** rota (`/`, `/mapa`, `/buscar`, `/favoritos`,
`/perfil`) — o app inteiro ficava inutilizável no navegador.

## Motivo provável ou causa raiz

Não totalmente isolada (não achei o chamador exato de `setColorScheme`, provavelmente
Expo Router/React Navigation tentando sincronizar o tema ao montar). Confirmado o
gatilho: `apps/mobile/tailwind.config.js` não definia `darkMode`, e o padrão do NativeWind
é `"media"`. Em `node_modules/react-native-css-interop/.../color-scheme.ts`, `.set()`
lança exceção sempre que `darkMode === "media"` — qualquer código (do próprio Expo
Router/React Navigation) que chame `setColorScheme(...)` uma vez derruba o app inteiro na
web. Em modo nativo (Android/iOS) isso não apareceria do mesmo jeito porque o runtime é
diferente, mas o app quebraria de forma equivalente se algo chamasse essa função lá.

## Correção aplicada

`apps/mobile/tailwind.config.js`: `darkMode: "class"` (a alternativa sugerida na própria
mensagem de erro). O app não usa tema escuro — `DESIGN.md` só define paleta clara — então
isso não muda a aparência, só evita que o NativeWind lance exceção ao tentar sincronizar
o tema.

## Como foi validado

`npx expo start --web`: as 5 rotas testadas carregam sem erro de console/exceção
(antes: erro em todas). Screenshots em
`C:\Users\Lorena\AppData\Local\Temp\claude\...\scratchpad\shots-mobile2\`.
`expo-doctor` (21/21) e `expo lint`/`tsc --noEmit` continuam limpos.

## Como evitar a repetição

Verificar a versão web do app (`npx expo start --web`) faz parte da revisão de bugs desta
sessão pela primeira vez com dados reais/Supabase real — nenhuma sessão anterior tinha
rodado isso, só a verificação visual "pela versão web" mencionada no PLAN.md sem checar
console de erro sistematicamente. Deixar isso registrado: sempre abrir o DevTools/checar
`pageerror` ao validar a versão web do mobile, não só olhar a screenshot.

## Aprendizado reutilizável

Um `console.error`/exceção não pega por nenhum teste automatizado (e2e do mobile não
existe; só os specs do site web checam console) pode ficar invisível por várias sessões.
Cheque erros de página, não só a aparência visual, ao inspecionar manualmente.
