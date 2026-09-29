# Erro — npx expo install usa npm em vez de pnpm dentro do workspace

- Data e hora: 2026-09-28 22:34:11 -03:00
- Agente/responsável: Claude Code
- Ambiente: Android/iPhone (apps/mobile, Expo SDK 57)
- Comando ou ação que gerou o erro: `npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar expo-location react-native-svg` rodado dentro de `apps/mobile`
- Status: corrigido
- Severidade: média (não quebra nada visivelmente na hora, mas corrompe silenciosamente a estrutura do monorepo pnpm se não for percebido)

## Mensagem completa do erro

Não houve erro fatal — o comando "funcionou" (`added 348 packages`), mas usou
internamente `npm install`, não `pnpm`:

```
› Installing 8 SDK 57.0.0 compatible native modules using npm
> npm install
```

## Sintoma

Depois de rodar `npx expo install ...` dentro de `apps/mobile`, apareceram
`apps/mobile/package-lock.json` e `apps/mobile/node_modules` — uma árvore de
dependências totalmente separada, gerenciada por npm, dentro de um monorepo que é
gerenciado por pnpm (`pnpm-workspace.yaml` na raiz). Isso duplica dependências, ignora o
lockfile único do workspace (`pnpm-lock.yaml`) e pode causar builds inconsistentes
(versões diferentes de React/React Native entre o que o Metro resolve via node_modules
local vs. o que o resto do monorepo usa).

## Motivo provável ou causa raiz

O `expo install` decide qual gerenciador de pacotes usar checando (entre outras coisas)
lockfiles no diretório atual/ascendentes — mas parece não ter reconhecido este projeto
como parte de um workspace pnpm quando rodado de dentro de `apps/mobile` (talvez porque
não existia ainda nenhum lockfile pnpm específico do pacote, ou por não detectar
`pnpm-workspace.yaml` corretamente neste cenário). Resultado: caiu no fallback padrão
(npm).

## Correção aplicada

1. Copiado os nomes e versões exatas que o `expo install` já tinha resolvido em
   `apps/mobile/package.json` (ex.: `expo-router@~57.0.23`, `react-native-screens@~4.26.0`)
   — essas versões continuam corretas e compatíveis com a SDK 57.
2. Apagado `apps/mobile/package-lock.json` e `apps/mobile/node_modules`.
3. Rodado `pnpm install` a partir da raiz do monorepo, que leu as mesmas versões do
   `package.json` (já editado por engano pelo npm, mas com specifiers válidos) e as
   instalou corretamente dentro da árvore pnpm do workspace.

## Como foi validado

Após `pnpm install` na raiz: `pnpm --filter @budega/mobile ...` passou a funcionar
normalmente (ver registros de mudança seguintes para typecheck/expo-doctor/export).
Nenhum `package-lock.json` reapareceu.

## Como evitar a repetição

Neste projeto, **nunca rodar `npx expo install <pacote>` diretamente** — em vez disso:
1. Rodar `npx expo install <pacote> --dry-run` (se disponível) só para descobrir a
   versão compatível com a SDK atual, ou consultar
   `https://docs.expo.dev/versions/v<major>.0.0/sdk/<pacote>` pela versão recomendada.
2. Adicionar a versão manualmente em `apps/mobile/package.json` e rodar
   `pnpm install` a partir da raiz do monorepo.

Depois de qualquer `npx expo install` (mesmo que pareça ter funcionado), sempre conferir
com `git status` se `package-lock.json` ou uma pasta `node_modules` local apareceram
dentro de `apps/mobile` — se aparecerem, é sinal de que caiu para npm e precisa do
processo de correção acima.

## Aprendizado reutilizável

`npx expo install` pode silenciosamente usar `npm` em vez de `pnpm` mesmo dentro de um
workspace pnpm. Sempre verificar (`git status` / presença de `package-lock.json`) depois
de rodá-lo, e preferir adicionar a versão manualmente ao `package.json` seguido de
`pnpm install` na raiz quando isso acontecer.
