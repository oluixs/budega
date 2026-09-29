# Budega — Mobile (Android/iPhone)

Aplicativo Expo Router (SDK 57) do Budega: navegação inferior (Explorar, Buscar,
Favoritos, Perfil) + telas de mercado, oferta e encarte.

Veja o [README na raiz do monorepo](../../README.md) para instruções completas
(instalação, modo mock, configuração do Supabase, EAS build) — este pacote não é
pensado para ser executado isoladamente fora do workspace pnpm.

Comandos locais (equivalentes a `pnpm --filter @budega/mobile <script>` a partir da
raiz):

```bash
pnpm start        # expo start
pnpm android      # expo start --android
pnpm ios          # expo start --ios
pnpm lint         # expo lint
pnpm typecheck    # tsc --noEmit
pnpm doctor       # expo-doctor
```

Builds Android/iPhone com EAS: ver seção "Gerando builds Android e iPhone com EAS" no
README da raiz. Os perfis já estão configurados em `eas.json`.
