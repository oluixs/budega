# Budega

Encontre mercados perto de você e as melhores ofertas do seu bairro. O Budega é
composto por um site responsivo, um aplicativo Android/iPhone (Expo) e um backend
Supabase compartilhado, todos consumindo o mesmo pacote de tipos e regras de negócio.

> **Antes de qualquer alteração neste repositório**, leia `.audit/README.md` — este
> projeto mantém um diário versionado de mudanças e erros que deve ser consultado antes
> de mexer em qualquer área já tocada. Veja a seção [Auditoria](#auditoria-e-histórico-de-mudanças)
> abaixo.

## Estrutura do monorepo

```
apps/
  web/       # Next.js 16 (App Router) + Tailwind v4 + shadcn/ui — site público + /admin
  mobile/    # Expo Router (SDK 57) + NativeWind — Android e iPhone
packages/
  shared/    # tipos, validações Zod, regras de negócio e dados mock compartilhados
  supabase/  # migrations SQL, políticas RLS, scripts de migrate/seed, cliente
.audit/      # diário de mudanças, erros e decisões técnicas (leitura obrigatória)
```

## Pré-requisitos

- Node.js 20+ e [pnpm](https://pnpm.io) (`corepack enable` já resolve a versão certa).
- Para rodar no celular: o app [Expo Go](https://expo.dev/go) (Android/iPhone) **ou**
  Android Studio/Xcode para emuladores — nenhum dos dois foi usado nesta sessão de
  desenvolvimento (ambiente sem Android SDK), então a verificação visual em
  dispositivo real ainda não foi feita (ver [Limitações conhecidas](#limitações-conhecidas-e-próximos-passos)).
- Uma conta [Supabase](https://supabase.com) — **opcional**. Sem ela, tudo roda em modo
  mock com dados de demonstração.

## Instalação

```bash
pnpm install
```

## Rodando em modo mock (padrão, sem credenciais)

Sem nenhuma variável de ambiente configurada, tanto a web quanto o mobile usam os dados
de demonstração de `packages/shared/src/mock` (8 mercados, 10 filiais, 30 ofertas, 8
encartes, categorias e algumas denúncias de exemplo). É o modo usado por padrão.

```bash
pnpm dev            # inicia web (localhost:3000) e mobile (Expo) juntos
pnpm dev:web        # só a web
pnpm dev:mobile     # só o mobile (abre o Metro bundler / QR code do Expo)
```

## Comandos principais

| Comando | O que faz |
|---|---|
| `pnpm install` | Instala as dependências de todo o monorepo |
| `pnpm dev` | Inicia web + mobile em modo desenvolvimento |
| `pnpm dev:web` | Inicia só a aplicação web (`apps/web`) |
| `pnpm dev:mobile` | Inicia só o app mobile (`apps/mobile`, via Expo) |
| `pnpm build` | Builda a web para produção (mobile/EAS é builds separados, ver abaixo) |
| `pnpm build:web` | Idem, filtrado explicitamente para `@budega/web` |
| `pnpm lint` | Roda o lint de todos os pacotes (web, mobile, shared, supabase) |
| `pnpm typecheck` | Roda `tsc --noEmit` em todos os pacotes |
| `pnpm test` | Roda os testes automatizados (Vitest) de `shared` e `web` |
| `pnpm audit:preflight -- <termo>` | Busca mudanças/erros relacionados a um termo antes de alterar algo |
| `pnpm audit:change` / `pnpm audit:error` | Cria um novo registro de mudança/erro em `.audit/` |
| `pnpm audit:validate` | Valida se todos os registros de `.audit/` têm os campos obrigatórios |
| `pnpm supabase:migrate` | Aplica as migrations SQL num Supabase real (requer `DATABASE_URL`) |
| `pnpm supabase:seed` | Popula um Supabase real com os dados de demonstração (requer `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`) |

## Configurando o Supabase real

1. Copie `.env.example` para `apps/web/.env.local` **e** para `apps/mobile/.env`,
   preenchendo apenas as variáveis do app correspondente (`NEXT_PUBLIC_*` para a web,
   `EXPO_PUBLIC_*` para o mobile).
2. Crie um projeto em [supabase.com](https://supabase.com).
3. Rode as migrations (cria tabelas, índices e políticas RLS):

   ```bash
   $env:DATABASE_URL = "postgresql://postgres:SENHA@db.xxxx.supabase.co:5432/postgres"
   pnpm supabase:migrate
   ```

4. (Opcional) Popule com os mesmos dados de demonstração usados no modo mock:

   ```bash
   $env:SUPABASE_URL = "https://xxxx.supabase.co"
   $env:SUPABASE_SERVICE_ROLE_KEY = "sua-service-role-key"   # nunca exponha no cliente
   pnpm supabase:seed
   ```

5. Reinicie `pnpm dev` — com `NEXT_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_URL`
   configuradas, os apps passam a consultar o banco real automaticamente (a troca entre
   mock e real é detectada em `apps/*/src/lib/supabase.ts`, sem precisar mudar código).

Sem `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`/`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`, a busca de
mercados continua funcionando normalmente como lista (com distância, endereço e botão de
rota externa) em vez de mapa interativo — isso é intencional, não um erro.

## Rodando o app mobile no seu celular (Expo Go)

```bash
pnpm dev:mobile
```

Escaneie o QR code exibido no terminal com o app **Expo Go** (Android) ou pela câmera do
iPhone. O app pedirá permissão de localização ao tocar em "Usar minha localização" — se
negada, a busca continua funcionando por texto (bairro/cidade).

## Gerando builds Android e iPhone com EAS

O projeto já tem `apps/mobile/eas.json` com os perfis `development`, `preview` e
`production`. Nenhum build foi gerado nesta sessão (exige uma conta Expo/EAS e
credenciais de assinatura que não existem neste ambiente) — os comandos abaixo são o
caminho documentado para fazer isso você mesmo:

```bash
npm install -g eas-cli     # ou: npx eas-cli@latest <comando>, sem instalar globalmente
cd apps/mobile
eas login
eas build:configure        # associa o projeto à sua conta Expo (gera/atualiza o "projectId")

# Build de teste interno (APK Android / simulador iOS)
eas build --profile preview --platform android
eas build --profile preview --platform ios

# Build de produção (App Bundle Android / build para a App Store)
eas build --profile production --platform android
eas build --profile production --platform ios

# Envio para as lojas (depois de configurar eas.json > submit e credenciais)
eas submit --platform android
eas submit --platform ios
```

## Deploy da web

Qualquer plataforma compatível com Next.js 16 (Vercel, Netlify, um servidor Node próprio
via `next start`) funciona. Nenhum deploy foi feito nesta sessão. Passos gerais:

```bash
pnpm --filter @budega/web build
pnpm --filter @budega/web start   # ou aponte a plataforma de deploy para apps/web
```

Configure as mesmas variáveis de `.env.example` (prefixo `NEXT_PUBLIC_`) no painel da
plataforma de deploy escolhida.

## Design e identidade visual

A direção visual completa (paleta, tipografia, espaçamento, estados, regras de
responsividade e acessibilidade) está documentada em [`DESIGN.md`](./DESIGN.md). O plano
de implementação por fases está em [`PLAN.md`](./PLAN.md).

## Auditoria e histórico de mudanças

Toda alteração feita por um agente de IA neste projeto é registrada em `.audit/`:

- `.audit/changes/` — o que foi mudado, por quê, e como foi validado.
- `.audit/errors/` — todo erro relevante encontrado durante o desenvolvimento, com causa
  raiz, correção e como evitar que se repita.
- `.audit/decisions/` — decisões técnicas que não são uma mudança de código em si.

**Antes de alterar qualquer parte do sistema**, leia `.audit/README.md` e rode
`pnpm audit:preflight -- <palavra-chave>` para ver se a área já teve problemas
conhecidos. Depois de qualquer mudança, registre-a com `pnpm audit:change`.

## Limitações conhecidas e próximos passos

- **Nenhuma verificação visual real** foi feita nesta sessão — nem no navegador (Chrome
  DevTools MCP não estava disponível), nem no celular (sem Android SDK/emulador no
  ambiente). A validação foi feita via build de produção, testes automatizados, lint,
  `expo-doctor`, `expo export` (bundle completo sem erros) e requisições HTTP diretas
  contra o servidor `next dev`. Antes de considerar o MVP pronto para usuários reais,
  abra a web num navegador de verdade e o app no Expo Go/emulador.
- **Mapa interativo** (Google Maps/`react-native-maps`) não foi implementado — tanto a
  web quanto o mobile mostram uma lista com distância, endereço e botão de rota externa
  como fallback, mesmo com uma chave de mapa configurada. Fica como próximo passo.
- **Gerenciar filiais** não tem UI no painel `/admin` ainda (schema e validação já
  existem em `packages/shared`).
- **Autenticação/roles no `/admin`**: as políticas de RLS no banco já impedem mutações
  sem a role correta, mas não há ainda um middleware de redirecionamento na web para
  usuários sem sessão — hoje o painel só mostra um aviso de "modo demonstração" quando
  não há Supabase configurado.
- **`packages/supabase/migrations/0001_init.sql`** nunca rodou contra um Postgres real
  nesta sessão (sem credenciais no ambiente) — revisado manualmente com cuidado, mas
  ainda precisa de uma primeira execução real (`pnpm supabase:migrate`) contra um
  projeto de teste antes de produção.
- Testes automatizados existem para `packages/shared` (35 testes) e `apps/web` (18
  testes) — ainda não há testes end-to-end em navegador real (Playwright) nem testes
  automatizados no `apps/mobile`.
- Web e mobile usam versões de Tailwind diferentes (v4 vs. v3/NativeWind) — os tokens de
  cor são mantidos sincronizados manualmente entre `DESIGN.md`,
  `apps/web/src/app/globals.css` e `apps/mobile/tailwind.config.js`.

## Política de Privacidade e Termos de Uso

Disponíveis em `/privacidade` e `/termos` na aplicação web (conteúdo real, não
placeholder — mas marcado como modelo que precisa de revisão jurídica antes de produção).
