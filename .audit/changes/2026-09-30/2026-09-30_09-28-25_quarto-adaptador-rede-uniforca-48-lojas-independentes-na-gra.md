# Registro de mudança — quarto adaptador: Rede Uniforça (48 lojas independentes na Grande Fortaleza)

- Data e hora: 2026-09-30 09:28:25 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: (pendente)
- Tipo: feature
- Status: concluída

## O que foi alterado

Pesquisa de novas redes de Fortaleza (pedido do usuário: "Adicione mais supermercados,
deve ser priorizado os mercados existentes em Fortaleza"):
- Descartadas: Carrefour (site VTEX complexo, conteúdo carregado por JS — desproporcional
  para uma rede nacional já bem coberta por outros agregadores); Super do Povo
  (`superdopovo.com.br` devolve 403 mesmo com navegador real — bloqueio de
  infraestrutura, não é possível respeitar de forma honesta como fizemos com robots.txt);
  Fortalezasupermercados/Supermercadosfortaleza.com.br (nomes parecidos, mas são redes de
  Macapá e São Paulo, não do Ceará).
- Escolhida: **Rede Uniforça** — cooperativa de compras que reúne ~40 marcas de
  supermercados independentes do Ceará (Baratão, Carnaúba, Nidobox, Super Cordeiro etc.),
  cada uma com identidade própria. robots.txt permissivo, TLS válido,
  `/associados/` lista todas as lojas com endereço e telefone em HTML simples.

`packages/sources/src/adapters/uniforca.ts` (novo, 4º adaptador):
- Lê `/associados/`; cada `.associates-modal__item` vira uma `Branch` com a marca própria
  no nome (ex.: "Baratão Supermercado"), não um nome genérico da cooperativa — o cliente
  reconhece a loja pelo nome real.
- Endereço em texto livre e inconsistente entre lojas (cadastrado à mão pela associação):
  telefone extraído por regex ("Telefone:"/"Fone", com ou sem espaço no número),
  cidade detectada por uma lista da Região Metropolitana de Fortaleza (RMF) e uma lista
  fechada de cidades do interior conhecidas nos dados (para excluí-las sem tentar
  geocodificar à toa — a rede tem lojas em quase 20 cidades do interior). **Só as lojas da
  RMF entram no Budega**, conforme pedido do usuário.
- Sem coordenadas nem CEP no HTML (só um link curto do Google Maps por loja — não seguido,
  mesma decisão já tomada para a Frangolândia: seria raspar o Google). Geocodificado via
  Nominatim, como a Frangolândia/cache versionado.
- Sem encartes: a rede publica um encarte geral por período sem indicar a quais lojas
  associadas ele vale — mostrar isso como oferta de uma loja específica seria informação
  que a própria rede não fornece.
- `packages/sources/src/adapters/__fixtures__/uniforca-associados.html`: página real
  salva (30/09/2026, 121 associados).

`import.ts`: `uniforcaAdapter` registrado em `ADAPTERS`.

## Motivo

Pedido do usuário: "Adicione mais supermercados, deve ser priorizado os mercados
existentes em Fortaleza."

## Impacto

- Regional: 4 redes (antes 3), 168 lojas (antes 120: 43 Cometa + 21 Frangolândia +
  8 Super Lagoa + **48 Uniforça**).
- 48 lojas de ~20 marcas independentes de bairro que não apareciam no Budega antes.

## Validação executada

`packages/sources`: 55 testes (7 novos para a Uniforça, fixture real). `pnpm importar`
real: `[uniforca] ok: 48 loja(s), 0 encarte(s)`, sem nenhuma cidade do interior
vazando para o retrato (`node -e` conferindo `branches.filter(market_id==='uniforca')`:
só Fortaleza, Caucaia, Maracanaú, Itaitinga, Aquiraz). `pnpm typecheck`/`pnpm lint` (5
pacotes) limpos; 187 testes unitários do monorepo passando.

## Pendências e riscos

- A lista de cidades do interior (`INTERIOR_CITIES`) é fechada: uma cidade nova que
  apareça no site e não esteja nela cairia no padrão "Fortaleza" — mitigado hoje porque a
  geocodificação também falharia para um endereço assim (a rua não existe em Fortaleza),
  mas não é uma garantia. Revisar a lista se `pnpm importar` mostrar uma loja da Uniforça
  numa cidade estranha.
- Alguns nomes de marca saem com pequenas inconsistências do próprio site (ex.: "Super
  Uchôa Supermercado" vs "Supermercados" em lojas diferentes da mesma marca) — reflete o
  cadastro real, não um bug do adaptador.
