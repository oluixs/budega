# Registro de mudança — politica de privacidade e termos revisados conforme lgpd cdc e marco civil

- Data e hora: 2026-09-29 12:49:53 -03:00
- Agente/responsável: Claude Code
- Branch: main
- Commit: ba9d109 (base)
- Tipo: docs
- Status: concluída (pendente: dados de identificação do responsável)

## O que foi alterado

- `app/privacidade/page.tsx` reescrita (LGPD e Marco Civil): identificação do
  controlador e do encarregado (arts. 9º e 41); tabela dado × finalidade × base legal (art.
  7º) × prazo de guarda; registros de acesso por 6 meses (Marco Civil, art. 15);
  informações dos mercados não são dados pessoais; compartilhamento (infraestrutura,
  OpenStreetMap recebe o IP, Google Maps nos links de rota, só números agregados aos
  mercados); transferência internacional (art. 33); cookies/armazenamento local; direitos
  completos do art. 18 com prazo de 15 dias e ANPD; segurança e incidentes (arts. 46 e
  48); crianças e adolescentes (art. 14).
- `app/termos/page.tsx` reescrita (CDC, Lei 9.610/98, Lei 9.279/96): quem oferece o
  serviço; Budega é informativo e não vende; origem das informações (sites oficiais,
  fonte e link); leitura automática sinalizada e **o encarte original prevalece**;
  preços conforme arts. 30 e 35 do CDC (removida a cláusula de exoneração total, nula pelo
  art. 51, I); marcas/encartes pertencem aos mercados, **canal de remoção** em até 5 dias
  úteis; destaque/patrocínio identificado (art. 36); uso aceitável; foro do domicílio do
  consumidor (art. 101, I).
- `lib/legal.ts`: único lugar com razão social, CNPJ, endereço, e-mails e encarregado.
  Enquanto vazio, as páginas mostram "Documento em preparação" e marcadores
  "[a preencher …]" — nada inventado.
- `components/legal/legal-page.tsx`: estrutura comum.

## Motivo

Pedido do usuário para as políticas seguirem as leis; a importação de encartes de
terceiros exige tratar direitos autorais e remoção.

## Impacto

Texto alinhado às leis citadas, mas continua sendo recomendável revisão por advogado(a)
— especialmente sobre o uso de encartes de terceiros sem autorização expressa.

## Validação executada

`pnpm typecheck`/`lint`; e2e das páginas `/privacidade` e `/termos` (sem erros, sem
rolagem horizontal).

## Pendências e riscos

- **Usuário precisa preencher `apps/web/src/lib/legal.ts`** antes do lançamento.
- Os prazos (30 dias para excluir conta, 12/24 meses, 5 dias úteis para remoção) são
  propostas razoáveis; o responsável pelo Budega deve confirmar que consegue cumpri-los.
