# Erro — Metro nao resolvia react-native-css-interop-jsx-runtime do NativeWind

- Data e hora: 2026-09-28 23:00:48 -03:00
- Agente/responsável: Claude Code
- Ambiente: Android/iPhone (apps/mobile, Metro/Expo SDK 57, NativeWind 4.2.7)
- Comando ou ação que gerou o erro: `npx expo export --platform android` (bundle real via Metro)
- Status: corrigido
- Severidade: alta (o app não bundlava — nenhuma tela abriria, em nenhuma plataforma)

## Mensagem completa do erro

```
Android Bundling failed 17837ms .../expo-router/entry.js (1520 modules)
Error: Unable to resolve module react-native-css-interop/jsx-runtime from
C:\Users\Pichau\Downloads\budega\apps\mobile\src\app\(tabs)\_layout.tsx:
react-native-css-interop/jsx-runtime could not be found within the project or in these
directories:
  node_modules
  ..\..\node_modules
```

## Sintoma

`pnpm --filter @budega/mobile exec tsc --noEmit` passava limpo, mas o bundle real via
Metro (`expo export`) falhava logo de cara em qualquer arquivo `.tsx` sob `src/app`,
porque `babel.config.js` configura
`["babel-preset-expo", { jsxImportSource: "nativewind" }]`, que faz todo arquivo `.tsx`
importar implicitamente `react-native-css-interop/jsx-runtime` como runtime de JSX.

## Motivo provável ou causa raiz

`react-native-css-interop` é uma dependência **transitiva** de `nativewind` (não
declarada diretamente em `apps/mobile/package.json`). No modo de isolamento padrão do
pnpm, uma dependência transitiva só fica acessível a partir do pacote que a declara
diretamente (`nativewind`), não a partir de qualquer arquivo do app que a importe
indiretamente via transformação do Babel — e o Metro resolve módulos subindo a árvore de
`node_modules` a partir do arquivo importador, sem saber que deveria "pedir emprestado"
via `nativewind`. Isso é o mesmo tipo de armadilha de isolamento estrito do pnpm que já
apareceu no registro de erro sobre módulos nativos duplicados, mas manifestada como
resolução ausente em vez de duplicada.

## Correção aplicada

Adicionado `react-native-css-interop@0.2.7` (mesma versão que `nativewind@4.2.7` já
pede como dependência) como dependência **direta** de `apps/mobile/package.json`, via
`pnpm --filter @budega/mobile add react-native-css-interop@0.2.7`. Isso dá ao pacote uma
entrada própria e resolvível na árvore de `node_modules` do app, sem precisar mudar o
`nodeLinker` do workspace inteiro (que já se mostrou arriscado — ver o outro registro de
erro sobre módulos nativos duplicados).

## Como foi validado

- `npx expo export --platform android --output-dir .expo-export-test` → bundle completo
  com sucesso (3653 módulos, `.hbc` de 6.9MB gerado). Diretório de teste apagado depois.
- `npx expo export --platform ios --output-dir .expo-export-test-ios` → bundle completo
  com sucesso (3560 módulos). Diretório de teste apagado depois.
- `pnpm --filter @budega/web build` continuou funcionando normalmente (a correção não
  tocou em nada da web).

## Como evitar a repetição

`tsc --noEmit` **não** detecta erros de resolução de módulo em tempo de bundle — só
`expo export` (ou `expo start` de verdade) expõe esse tipo de problema. Sempre rodar
`npx expo export --platform android` (rápido, não precisa de emulador) depois de
adicionar qualquer biblioteca nova que injete transformações Babel/JSX customizadas
(NativeWind, Reanimated, etc.), antes de considerar a integração concluída.

## Aprendizado reutilizável

Neste monorepo pnpm, qualquer pacote que o Metro precise resolver a partir de um arquivo
de `apps/mobile` — mesmo que só via uma transformação do Babel, não um `import`
explícito no código — precisa estar listado como dependência **direta** de
`apps/mobile/package.json`, não apenas como dependência transitiva de outro pacote
(`nativewind` → `react-native-css-interop` é o exemplo real encontrado). `tsc --noEmit`
não pega esse tipo de erro; só `expo export`/`expo start` pegam.
