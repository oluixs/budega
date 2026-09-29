# Registro de mudança — packages-sources importacao dos encartes e lojas reais do cometa

- Data e hora: 2026-09-29 12:49:51 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: ba9d109 (base)
- Tipo: feature
- Status: concluída (Cometa); outras redes pendentes

## O que foi alterado

Pedido do usuário: encartes e ofertas devem vir dos supermercados da região (ex.: Cometa
Supermercados, a partir do site deles). Região definida como **Fortaleza e Região
Metropolitana** (onde o Cometa atua).

- Novo pacote `packages/sources`:
  - `http.ts`: cliente que se identifica como `BudegaBot` (com link do projeto), respeita
    `robots.txt` (cache por site; grupo específico > `*`; regra mais longa vence) e tem
    tempo limite.
  - `parse.ts`: validade ("de 29/09 a 05/10", "de 27 a 29/09", mês por extenso, virada de
    ano), horários ("Diariamente das 06h às 00h", "Segunda a sábado … • Domingo …",
    "6h45"), endereço/bairro/cidade da RMF, coordenadas, telefone e loja exclusiva
    ("somente para a loja Montese" → filial do bairro Montese).
  - `adapters/cometa.ts`: usa `https://cometasupermercados.com.br/api/onde-estamos` e
    `/api/encartes` — os mesmos endpoints públicos que as páginas do site chamam no
    navegador. A API do CMS (`adminx…/api/*`) responde 403 e **não** é usada.
    Resultado: 1 mercado, 43 lojas geolocalizadas, encartes com PDF, capa, validade,
    descrição e crédito (`source_url`).
  - `import.ts`: roda as fontes; se uma falhar, mantém os dados anteriores dela e registra
    o erro. Encarte sem validade reconhecível **não** é publicado.
  - `scripts/importar.ts` (`pnpm importar`): grava o retrato em
    `packages/shared/src/data/regional.json`.
- Shared: tipos `RegionalData`/`DataSource`; campos opcionais `website_url` (Market),
  `description`/`cover_url`/`source_url` (Flyer), `flyer_id`/`origin` (Offer);
  `withDistance` usa a **loja mais próxima** de cada rede (`nearest_branch`);
  `matchesMarketQuery` busca também nos bairros das lojas; `regionalSnapshot`.
- Web: `lib/local-data.ts` — sem Supabase, usa os dados regionais, atualizados em tempo
  de execução (cache de fetch de 1 h) com o retrato como reserva; `BUDEGA_DADOS=demo` usa
  os fictícios (e2e). Home com "Encartes da semana", página do mercado com logo, link
  para o site oficial, encartes com capa e seção de lojas; `FlyerCard`; `FlyerViewer`
  com PDF; admin sem Supabase mostra os dados regionais.
- Testes: 26 em `packages/sources` (fixtures reais reduzidas), 2 novos em shared.

## Motivo

Substituir os dados fictícios de São Paulo por dados reais da região do usuário.

## Impacto

- Sem banco: os dados vêm dos sites a cada hora (web) ou do retrato versionado (app).
- Legal: ver registro das políticas — conteúdo exibido com fonte, link e canal de remoção.
- Ofertas individuais (produto/preço) **ainda não** são extraídas: o PDF do Cometa é só
  imagem e o OCR gratuito (Tesseract) não lê os preços (teste registrado neste ciclo).
  Extração por modelo de visão depende de chave de API (pendência do usuário).

## Validação executada

- `pnpm importar`: `[cometa] ok: 43 loja(s), 7 encarte(s)`.
- Build em modo regional + screenshots (home, mapa, mercado, encarte, celular) sem erros de
  console; busca "aldeota" encontra o Cometa; distância até a loja mais próxima = 6 m.
- `pnpm typecheck`/`lint` (5 pacotes), `pnpm test` (142), `test:e2e` (52).

## Pendências e riscos

- Se o Cometa mudar o formato dos endpoints, o adaptador falha e o site mantém o último
  retrato (o erro fica em `sources[].error`).
- Mercado importado não é "verificado" — verificação é feita com o mercado.
- Outras redes da região ainda não têm adaptador.
