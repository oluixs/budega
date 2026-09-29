# Erro — expo-doctor detectou modulos nativos duplicados no pnpm isolado do monorepo

- Data e hora: 2026-09-28 22:51:00 -03:00
- Agente/responsável: Claude Code
- Ambiente: Android/iPhone (apps/mobile, Expo SDK 57, monorepo pnpm)
- Comando ou ação que gerou o erro: `npx expo-doctor` dentro de `apps/mobile`
- Status: corrigido (parcialmente — ver limitação residual aceita abaixo)
- Severidade: média (duplicatas de módulo nativo podem causar erros de build nativo reais, não só warnings)

## Mensagem completa do erro

```
✖ Check that no duplicate dependencies are installed
Your project contains duplicate native module dependencies...
Found duplicates for expo: ...
Found duplicates for react-native: ...
Found duplicates for expo-modules-core: ...
(+ expo-constants, @expo/dom-webview, @expo/log-box, expo-asset, expo-file-system, expo-font, expo-modules-jsi)
```

Também nesta mesma checagem:
```
✖ Check for lock file
Multiple lock files detected (pnpm-lock.yaml, package-lock.json).
✖ Check Expo config (app.json/app.config.js) schema
should NOT have additional property 'newArchEnabled'.
```

## Sintoma

`expo-doctor` reportou 3 falhas de 21 checagens: (1) lockfile duplicado, (2) propriedade
inválida em `app.json`, (3) várias dependências nativas (expo, react-native,
expo-modules-core, etc.) instaladas em mais de uma cópia dentro do monorepo.

## Motivo provável ou causa raiz

1. **Lockfile duplicado**: havia um `package-lock.json` na **raiz** do monorepo, deixado
   de antes de este projeto ser convertido para pnpm nesta mesma sessão (o ambiente já
   tinha `package.json`+`node_modules`+`package-lock.json` de uma instalação npm
   anterior, antes de qualquer trabalho do Claude Code). Não tinha sido removido ainda.
2. **`newArchEnabled` inválido**: esquema do `app.json` do Expo SDK 57 não aceita mais
   esse campo como propriedade de nível superior (a Nova Arquitetura já é o padrão nesta
   versão do Expo/React Native — não precisa ser declarada).
3. **Módulos nativos duplicados**: confirmado pelo guia oficial de monorepos do Expo
   (`docs.expo.dev/guides/monorepos`) — o modo de isolamento padrão do pnpm (cada
   dependente resolve sua própria cópia simbólica de uma dependência transitiva) faz com
   que pacotes como `expo-location`, `expo-router` e o próprio `expo` acabem cada um com
   sua própria cópia de `expo-modules-core`/`react-native`/etc. dentro da store do pnpm,
   em vez de uma única cópia compartilhada — o que native builds (Android/iOS) não
   toleram bem.

## Correção aplicada

1. Apagado o `package-lock.json` da raiz do monorepo (vestígio pré-pnpm).
2. Removida a propriedade `newArchEnabled` de `apps/mobile/app.json`.
3. **Tentativa revertida**: adicionar `nodeLinker: hoisted` em `pnpm-workspace.yaml`
   (recomendação do guia de monorepos do Expo para pnpm) de fato eliminou as duplicatas
   de módulo nativo, mas **quebrou o build da web** — `pnpm --filter @budega/web build`
   passou a falhar no `tsc` com um erro de `skeleton.tsx` do tipo "Two different types
   with this name exist, but they are unrelated" no `ref` de `@types/react`. Isso é um
   sintoma clássico de duas instâncias fisicamente diferentes do mesmo pacote `@types`
   no armazenamento de conteúdo do pnpm, e o modo hoisted piorou (não resolveu) esse
   caso específico entre `apps/web` (`@types/react@^19` → 19.3.0) e `apps/mobile`
   (`@types/react@~19.2.2`). Revertido: `nodeLinker: hoisted` removido de
   `pnpm-workspace.yaml`, `node_modules` apagado em todos os pacotes e reinstalado em
   modo isolado padrão — o que, nesta reinstalação, já não reproduziu as duplicatas de
   módulo nativo originais (aparentemente resolvidas por outra reinstalação limpa).
4. **Correção real e definitiva**: adicionado `pnpm.overrides` em `package.json` da
   raiz fixando `"@types/react": "19.2.4"` — uma versão dentro do range aceito tanto por
   `apps/web` (`^19`) quanto pelo range esperado pelo Expo SDK 57 (`~19.2.4`). Isso força
   pnpm a resolver uma única instância física do pacote de tipos em vez de duas.

## Como foi validado

Depois da correção final (overrides, sem `nodeLinker: hoisted`):
- `npx expo-doctor` em `apps/mobile` → **21/21 checagens passando**.
- `pnpm --filter @budega/web build` → build de produção completo, sem erro de tipos.
- `pnpm --filter @budega/mobile exec tsc --noEmit` → sem erros.
- `pnpm --filter @budega/shared test` → 33/33 testes passando.

## Como evitar a repetição

Sempre rodar `npx expo-doctor` (mobile) **e** `pnpm --filter @budega/web build` (web)
depois de qualquer mudança em `pnpm-workspace.yaml` ou nas versões de `@types/*`/`react`
em qualquer `package.json` do monorepo — uma mudança que "conserta" um app pode quebrar
o outro silenciosamente. Preferir `pnpm.overrides` em pacotes `@types/*` específicos a
mudar o `nodeLinker` do workspace inteiro, que tem efeitos colaterais muito mais amplos.

## Aprendizado reutilizável

Neste monorepo, `apps/web` e `apps/mobile` **não** compartilham a mesma versão de
`react` (Next.js 16 pede `19.2.8`, Expo SDK 57 pede `19.2.3`) — isso é esperado e não deve
ser "corrigido" forçando uma versão só. Mas `@types/react` **é** fixado numa única versão
(`19.2.4`) via `pnpm.overrides` na raiz, porque pacotes de tipos duplicados fisicamente
no pnpm store causam erros de "two different types with this name exist" no `tsc`,
mesmo quando as versões runtime de `react` continuam diferentes entre os dois apps.
`nodeLinker: hoisted` foi testado e **rejeitado** para este workspace — não usar sem
testar `pnpm --filter @budega/web build` depois.
