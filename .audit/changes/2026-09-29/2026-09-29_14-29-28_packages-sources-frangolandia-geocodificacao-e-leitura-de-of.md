# Registro de mudança — packages-sources frangolandia geocodificacao e leitura de ofertas com a api do claude

- Data e hora: 2026-09-29 14:29:28 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: 067c05e (base)
- Tipo: feature
- Status: concluída (leitura de ofertas aguardando credencial da Anthropic)

## O que foi alterado

**Segunda rede: Frangolândia Supermercados** (`packages/sources/src/adapters/frangolandia.ts`)
- Site WordPress/JetEngine; robots.txt só proíbe `/wp-admin/`. Lê `/encartes/` (título,
  validade, capa 768 px), a página de cada encarte (PDF) e `/lojas/` (endereço, telefone,
  horário) com `node-html-parser`.
- Ignora o centro administrativo e a loja "José Walter — VEM AÍ!" (não inaugurada).
- Corrige erros de digitação do site ("Euzebio" → Eusébio, "Joaquin" → Joaquim) e tenta a
  geocodificação sem o bairro quando a primeira falha. Resultado: 21 de 22 lojas abertas
  (fora: Trairi), 3 encartes.
- Parsers estendidos: validade com ponto ("De 28.09 a 04.10.2026", "26 a 29.09 de 2026") e
  horários "Seg à Sab: 06:00 às 00:00 Domingos e Feriados: Fechado".
- Adaptadores recebem `{ http, now, geocode }`; `HttpClient.getText`.

**Geocodificação** (`src/geocode.ts`, decisão em `.audit/decisions/`): Nominatim, 1 req/s,
cache versionado `src/data/geocode-cache.json`; site/app só usam o cache. Lojas
geocodificadas levam `coordinates_approximate: true`; novo `buildPlaceRouteUrl` (shared)
manda a rota pelo endereço em texto nesses casos (web e app).

**Leitura de ofertas dos encartes** (`src/offers/`)
- `extract.ts`: `claude-opus-5-5` (esforço `medium` explícito), arquivo baixado pelo nosso
  cliente e enviado em base64 (imagem ou PDF), **saída estruturada** (`output_config.format`
  JSON Schema, revalidada com zod), fallback de recusa do lado do servidor
  (`fallbacks: "default"`), `refusal`/`max_tokens` viram erro. Prompt instrui a **pular**
  preços ilegíveis; validação descarta categoria desconhecida e preço implausível.
- `cache.ts` + `src/data/offers-cache.json`: cada encarte é lido uma vez (chave = encarte +
  arquivo; arquivo trocado → relido; encarte fora do ar → removido).
- `pnpm importar --ofertas`: opt-in explícito; mostra tokens e custo estimado.
- `importRegional` usa o cache por padrão: web e app mostram as ofertas sem chamar a API.
- Interface: oferta `origin: "encarte"` mostra "Lida do encarte — confira no original" e,
  na página da oferta, aviso com link para o encarte (web e app).

## Motivo

Pedido do usuário: encartes e ofertas das redes da região, retirados dos sites delas.

## Impacto

- Regional: 2 redes, 64 lojas, 10 encartes (antes: 1, 43, 7).
- Custo estimado da leitura (a medir na primeira execução): ~2 mil tokens de entrada e
  ~3–5 mil de saída por página → ~US$ 0,07–0,11 por página a US$ 4/US$ 20 por milhão;
  ~20 páginas por semana nas duas redes → ~US$ 1,50–2,20/semana.
- Nova dependência: `@anthropic-ai/sdk` (só no pacote de fontes e no script; não entra
  no site nem no app), `node-html-parser`, `zod`.

## Validação executada

- `packages/sources`: 37 testes (fixtures HTML reais da Frangolândia; cliente da Anthropic
  simulado — nenhuma chamada paga); typecheck e lint.
- `pnpm importar` real: `[cometa] ok: 43 loja(s), 7 encarte(s)`,
  `[frangolandia] ok: 21 loja(s), 3 encarte(s)`.
- Monorepo: typecheck/lint 5 pacotes, 158 testes unitários, 52 e2e; screenshots da home e
  do mapa com as duas redes.

## Pendências e riscos

- **Leitura de ofertas não foi executada**: não há credencial da Anthropic neste
  computador (`ANTHROPIC_API_KEY` ou `ant auth login`). Ao configurar, rodar
  `pnpm importar --ofertas` e conferir uma amostra das ofertas contra o encarte.
- Mudança de layout do site da Frangolândia quebra o adaptador (o site mantém o último
  retrato e o erro fica registrado).
