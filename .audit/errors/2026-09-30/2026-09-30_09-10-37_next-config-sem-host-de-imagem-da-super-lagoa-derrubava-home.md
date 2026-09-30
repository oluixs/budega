# Erro — next.config sem host de imagem da Super Lagoa derrubava home e explorar

- Data e hora: 2026-09-30 09:10:37 -03:00
- Agente/responsável: Claude Code
- Ambiente: web (apps/web — Next.js Image, dados reais via Supabase)
- Comando ou ação que gerou o erro: navegar em `/` e `/explorar` com o Supabase real (nunca testado antes — os testes e2e usam `BUDEGA_DADOS=demo`)
- Status: corrigido
- Severidade: alta (erro 500 na home)

## Mensagem completa do erro

```
⨯ Error: Invalid src prop (https://www.superlagoa.com.br/img/logo-lagoa.png) on `next/image`,
hostname "www.superlagoa.com.br" is not configured under images in your `next.config.js`
GET / 500 in 24.9s
```

## Sintoma

A home (`/`) e `/explorar` (lista) devolviam erro 500 assim que a Super Lagoa foi
sincronizada para o Supabase real. `/explorar?view=mapa` e a página do próprio mercado
continuavam ok (não usam `next/image` com a logo na lista).

## Motivo provável ou causa raiz

Confirmada: `apps/web/next.config.ts` só tinha os hosts de imagem do Cometa e da
Frangolândia em `images.remotePatterns`. A Super Lagoa foi adicionada em
`packages/sources/src/adapters/superlagoa.ts` numa mudança anterior sem atualizar o
`next.config.ts` — `next/image` recusa (e derruba a página inteira, não só a imagem)
qualquer host fora da lista. Como nenhum teste automatizado roda com dados reais, isso só
apareceu ao navegar manualmente com o Supabase configurado.

## Correção aplicada

- `apps/web/next.config.ts`: adicionado `{ protocol: "https", hostname: "www.superlagoa.com.br" }`.
- Novo teste `apps/web/src/lib/image-hosts.test.ts`: lê `regional.json` (o retrato real) e
  confere que todo host de `logo_url`/`cover_url`/`image_url` está em
  `images.remotePatterns` — pega esse tipo de erro sem precisar rodar o servidor com
  Supabase real.

## Como foi validado

Servidor `next dev` com o Supabase real: `/` e `/explorar` voltaram a 200. Screenshot sem
erro de console. `apps/web`: 5 testes novos (4 hosts cobertos + este arquivo), suíte
completa depois.

## Como evitar a repetição

Adicionar uma rede nova em `packages/sources` precisa atualizar `next.config.ts` no mesmo
commit — o teste novo (`image-hosts.test.ts`) agora falha se isso for esquecido de novo.

## Aprendizado reutilizável

`next/image` recusa qualquer host fora de `remotePatterns` derrubando a página **inteira**
(erro 500), não só a imagem — e como os testes e2e sempre rodam em `BUDEGA_DADOS=demo`
(dados fixos, hosts já conhecidos), esse tipo de erro só aparece navegando com dados reais.
Um teste que confere os hosts do retrato real contra a config, sem precisar de servidor,
pega isso de graça a cada `pnpm test`.
