# Registro de mudança — leitura manual das ofertas dos encartes sem API

- Data e hora: 2026-09-29 14:59:08 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: 6e3a8d5 (base)
- Tipo: feature
- Status: concluída

## O que foi alterado

- **Pesquisa de fontes de preço** (pedido: ler os preços nos sites, sem API):
  - O Cometa não tem loja on-line pública: `delivery.cometasupermercados.com.br` não existe
    mais (NXDOMAIN) e o Clube (`clube.cometasupermercados.com.br`) exige login com CPF, por
    isso não é usado.
  - A loja on-line da Frangolândia (levoo.com.br) está "em construção".
  - Conclusão: os preços públicos existem só nos encartes (PDF/imagem).
- **Transcrição dos encartes vigentes com validade maior**, feita pelo Claude Code na sessão,
  olhando as páginas dos encartes (sem chamar a API):
  - Cometa "Ofertas Exclusivas Montese": 55 ofertas.
  - Frangolândia "Mega Ofertaço das Marcas": 76 ofertas. As 12 da Sadia ficam só no
    encarte BRF, que tem o mesmo conteúdo, para não duplicar.
  - Frangolândia "Ofertas BRF": 12 ofertas.
  - Total: **143 ofertas**.
- `packages/sources/src/data/leituras/<id-do-encarte>.json`: formato versionado de leitura
  manual, com os campos:
  - `flyer_id`, `file_url`, `read_at`, `reader`, `note`;
  - `offers`, no mesmo formato da leitura automática.
- `src/offers/manual.ts` (`ManualReadingSchema`, `applyManualReadings`):
  - Aplica as leituras ao cache de ofertas com a mesma validação da leitura pela API.
  - A validação ficou em `toFlyerOffers`, extraída de `extract.ts`.
  - Leitura de arquivo trocado ou de encarte fora do ar é ignorada, com aviso.
- `pnpm importar` aplica as leituras manuais em toda execução e lista os encartes ainda
  sem leitura.

## Motivo

Pedido do usuário: "Leia os preços acessando os sites dos supermercados, para não usar API."

## Impacto

- Web e app passam a mostrar 143 ofertas reais, marcadas "Lida do encarte — confira no
  original", com link para o encarte.
- Encartes que vencem em 29–30/09 não foram lidos (7), por durarem só 1 ou 2 dias.

## Validação executada

- `packages/sources`: 45 testes. Todas as leituras versionadas passam pela validação,
  sem nenhuma descartada (categoria conhecida, preço "de" maior que o "por", nenhum preço
  implausível).
- `pnpm importar` real: 3 leituras aplicadas, 143 ofertas no retrato.

## Pendências e riscos

- A leitura precisa ser refeita a cada encarte novo, em geral toda semana:
  - rodar `pnpm importar`;
  - ver "Encartes sem leitura";
  - transcrever num novo `leituras/<id>.json`.
- Automatizar isso (rotina agendada do Claude, ou `--ofertas` com credencial) depende de
  autorização do usuário.
- Transcrição humana ou por modelo pode ter erro de leitura. A interface já manda
  conferir no encarte original.
