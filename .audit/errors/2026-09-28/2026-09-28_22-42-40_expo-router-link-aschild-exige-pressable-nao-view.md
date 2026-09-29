# Erro — expo-router Link asChild exige Pressable nao View

- Data e hora: 2026-09-28 22:42:40 -03:00
- Agente/responsável: Claude Code
- Ambiente: Android/iPhone (apps/mobile, Expo Router SDK 57)
- Comando ou ação que gerou o erro: escrever `<Link href={...} asChild><View>...</View></Link>` em `src/components/market-card.tsx`
- Status: corrigido (encontrado antes de rodar, via verificação de documentação, não via falha em runtime)
- Severidade: média (cartão inteiro ficaria sem navegação ao tocar, silenciosamente — nenhum erro apareceria)

## Mensagem completa do erro

Nenhuma — o problema é comportamental (toque não navega), não um erro que apareceria no
console.

## Sintoma

`MarketCard` envolvia o conteúdo do cartão num `<View>` dentro de `<Link href={...}
asChild>`. Isso compilaria sem erro, mas o toque no cartão não navegaria para
`/mercados/[slug]`, porque `View` não tem interação de toque.

## Motivo provável ou causa raiz

O AGENTS.md gerado pelo `create-expo-app` avisa explicitamente para não confiar em
conhecimento prévio sobre APIs do Expo/React Native e sempre consultar a documentação
versionada. Ao consultar
`https://docs.expo.dev/versions/v57.0.0/sdk/router/link.md`, a documentação confirma:
"the child component must accept `onPress` or `onClick` props" quando `asChild` é usado
— `View` não aceita/propaga `onPress` para gestos de toque; é preciso um componente como
`Pressable`, `TouchableOpacity` ou similar.

## Correção aplicada

Trocado o elemento raiz de `MarketCard` de `<View>` para `<Pressable>` dentro do
`<Link asChild>`. Como padrão para todo o app: qualquer cartão/linha clicável que use
`Link ... asChild` deve ter `Pressable` (não `View`) como elemento imediatamente dentro.

## Como foi validado

Comparado com o exemplo oficial da documentação (`Link asChild` envolvendo
`Pressable`). Validação de build/typecheck completa registrada no changelog da Fase 3
(mobile).

## Como evitar a repetição

Antes de escrever qualquer `<Link asChild>` novo neste projeto, usar `Pressable` (ou
`TouchableOpacity`) como filho imediato — nunca `View` puro. Ao revisar componentes de
cartão/lista clicáveis, verificar visualmente que o elemento raiz dentro de `asChild` é
interativo.

## Aprendizado reutilizável

Em Expo Router (`apps/mobile`), `<Link href={...} asChild>` exige que o filho imediato
aceite `onPress` (ex.: `Pressable`, `TouchableOpacity`) — um `View` puro compila mas
nunca navega ao toque, sem erro nenhum no console. Sempre verificar a documentação
versionada do Expo (`docs.expo.dev/versions/v<major>.0.0/...`) antes de escrever
padrões de composição com `asChild`, já que o comportamento pode divergir do que é
comum em outras bibliotecas de navegação.
