# Registro de mudança — hospedagem gratuita no Vercel

- Data e hora: 2026-09-30 08:08:35 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: (pendente — ver próximo commit)
- Tipo: infra
- Status: parcial (login feito; deploy depende de uma ação do usuário)

## O que foi alterado

`.gitignore`: adicionada a entrada `.vercel` (a CLI do Vercel também tinha acrescentado
`.env*`, redundante com as entradas específicas já existentes — simplificado). Nenhum
código de produto foi alterado; o restante deste registro documenta a investigação de
hospedagem (login concluído, deploy ainda pendente de uma ação do usuário).

## Motivo

Pedido do usuário: "Ainda não temos domínio web. Busque um grátis e hospede."

## O que foi tentado

Pedido do usuário: "Ainda não temos domínio web. Busque um grátis e hospede." Escolhido o
Vercel (plano Hobby, gratuito, subdomínio `*.vercel.app`, sem cartão) por já rodar Next.js
16 nativamente.

1. `vercel login` (fluxo de dispositivo, autorizado pelo usuário no navegador) — **login
   concluído** com a conta `oluixs` (a mesma do GitHub).
2. `vercel deploy --prod` rodado de dentro de `apps/web`: só envia os arquivos daquela
   pasta, sem o `pnpm-lock.yaml`/`pnpm-workspace.yaml` da raiz do monorepo →
   `npm install` remoto falha em `workspace:*` (não sabe resolver os pacotes irmãos).
3. `vercel link --repo` (modo monorepo oficial da CLI, ainda alpha): detecta corretamente
   `apps/web` como o projeto Next.js do monorepo, mas a etapa de confirmação é uma lista
   interativa (setas/espaço) que não responde a entrada por pipe neste ambiente (a Bash
   deste agente não tem um console real; `winpty` também falhou, pois depende de um
   console do Windows que não existe aqui). Também tentou conectar automaticamente o
   repositório `oluixs/budega` do GitHub e falhou (o app do Vercel para GitHub não está
   instalado na conta).
4. Build local (`vercel build`, que usa as dependências já instaladas pelo pnpm) chegou a
   compilar o Next.js inteiro com sucesso, mas travou no último passo (deduplicar funções
   serverless com link simbólico): `EPERM: operation not permitted, symlink` — Windows
   exige **Modo de Desenvolvedor** ativado ou privilégio de administrador para criar
   links simbólicos sem elevação, e esta conta não tem (mesma limitação do emulador
   Android, que precisa do Hipervisor).
5. Criar um token de API pela CLI (para configurar o projeto por HTTP direto) foi
   recusado pelo próprio Vercel: "Cannot create tokens for this app" — restrição do
   método de login (dispositivo/GitHub) desta conta, não algo contornável.

## Decisão

Como os dois caminhos 100% automáticos (deploy remoto direto da CLI, build local) esbarram
em limitações do ambiente (não do projeto), a hospedagem será finalizada pela
**integração Git do Vercel** (import do repositório GitHub pelo painel): é o fluxo
padrão e suportado para monorepos, não depende de link simbólico nem de console
interativo, e já deixa o deploy automático a cada push configurado. Precisa de uma ação
do usuário (autorizar o app do Vercel a acessar o repositório) — ver PLAN.md.

## Impacto

Nenhum impacto em produção ainda: o site continua funcionando só localmente até o
deploy ser concluído pelo usuário.

## Validação executada

`git status`/`git check-ignore`: confirmado que nada gerado pelo Vercel (tokens,
`.env.production.local`, `.vercel/output`) foi ou seria commitado. Nenhum teste
automatizado é afetado por esta mudança (só `.gitignore` e documentação).

## Pendências e riscos

- Falta o usuário importar `oluixs/budega` em vercel.com/new, com Root Directory
  `apps/web` (instruções passadas na conversa).
- Depois do primeiro deploy, atualizar `WEB_BASE_URL` em
  `packages/shared/src/business/links.ts` e `EXPO_PUBLIC_API_URL` do app mobile para a
  URL `*.vercel.app` definitiva, e registrar isso em novo `.audit/changes`.
