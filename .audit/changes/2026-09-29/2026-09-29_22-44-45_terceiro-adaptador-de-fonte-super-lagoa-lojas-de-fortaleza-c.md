# Registro de mudança — Terceiro adaptador de fonte: Super Lagoa (lojas de Fortaleza/CE)

- Data e hora: 2026-09-29 22:44:45 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: 530df5b
- Tipo: feature
- Status: concluída

## O que foi alterado

Novo adaptador `packages/sources/src/adapters/superlagoa.ts` para a rede de
supermercados Super Lagoa (Grupo Lagoa), com testes em `superlagoa.test.ts` e fixtures
reais em `__fixtures__/superlagoa-lojas.html` e `__fixtures__/superlagoa-loja-detalhe.html`
(baixadas do site em 29/09/2026). Registrado em `packages/sources/src/import.ts`
(`ADAPTERS`). `parseStoreList` lê `/lojas.php` (id + nome de cada loja);
`parseStoreDetail` lê `/loja.php?id=N` (endereço, cidade, CEP, telefone, horário e as
coordenadas exatas dos campos ocultos `localizacao_latitude`/`localizacao_longitude`
usados pelo mapa do próprio site — sem precisar geocodificar). O adaptador importa 8
lojas (Fortaleza, Sobral, Juazeiro do Norte) e **não importa encartes**: a Revista de
Ofertas do site (`/ofertas.php?categoria=2`) está parada desde agosto de 2023, e
publicar isso violaria a regra de não mostrar conteúdo sem validade atual.
`PLAN.md` (Fase 6) atualizado: Super Lagoa marcada como feita; candidatas descartadas
documentadas (São Luiz, Centerbox, Pinheiro, Diniz, Moranguinho) com o motivo de cada
descarte.

## Motivo

Pedido do usuário: "verifique no google maps os supermercados mais famosos e vá
adicionando. comece por fortaleza." Super Lagoa foi a única candidata, entre as
avaliadas nesta rodada, que passou nos três critérios do projeto: presença relevante em
Fortaleza, `robots.txt` permissivo para bots fora dos administrativos, e certificado
TLS válido.

## Impacto

Só `packages/sources` (importador de dados regionais rodado via `pnpm importar`); não
altera schema, RLS nem UI diretamente — o mercado só aparece nos apps depois de uma
importação real ser rodada e o resultado ser persistido/publicado. Sem impacto em
segurança. Sem encartes/ofertas para esta rede (decisão deliberada, ver acima).

## Validação executada

`pnpm --filter @budega/sources test` (40/40 testes, incluindo os 3 novos de Super
Lagoa) · `pnpm --filter @budega/sources exec tsc --noEmit` (limpo) ·
`pnpm --filter @budega/sources lint` (limpo).

## Pendências e riscos

Nenhuma execução real de `pnpm importar` foi feita ainda contra este adaptador (só
testado com fixtures/HTML sintético) — antes de publicar os dados em produção, rodar a
importação de verdade e revisar o log de avisos. Endereços não trazem bairro (o site não
expõe esse campo separadamente); `neighborhood` fica vazio nas lojas desta rede. Ver
também o registro de erro
`.audit/errors/2026-09-29/2026-09-29_22-44-46_super-lagoa-quebra-de-linha-mista-e-nbsp-no-texto-de-horario.md`
para os dois bugs de parsing encontrados e corrigidos durante esta mudança.
