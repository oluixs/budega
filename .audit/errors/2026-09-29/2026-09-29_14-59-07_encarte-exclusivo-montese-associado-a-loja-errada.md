# Erro — encarte exclusivo Montese associado a loja errada

- Data e hora: 2026-09-29 14:59:07 -03:00
- Agente/responsável: Claude Code
- Ambiente: backend (packages/sources — importador do Cometa)
- Comando ou ação que gerou o erro: leitura manual do encarte "Ofertas Exclusivas Montese" (cometa-encarte-512)
- Status: corrigido
- Severidade: média

## Mensagem completa do erro

Sem mensagem: erro de dado. O encarte "somente para a loja Montese" estava com
`branch_id: "cometa-loja-47"` (Cometa Gomes de Matos, Av. Professor Gomes de Matos, 1270).

## Sintoma

Web e app mostravam o encarte do Montese como se fosse da loja Gomes de Matos, e a rota
("Como chegar") levaria o cliente à loja errada.

## Motivo provável ou causa raiz

Confirmada: `findRestrictedBranch` (`packages/sources/src/parse.ts`) aceitava o **bairro**
como identificação da loja. O rodapé do encarte diz que a loja Montese fica na **Rua Barão de
Sobral, 687 - Montese** (85 3512.1744), endereço que não está na lista de lojas do site
(`/api/onde-estamos`). A Gomes de Matos também fica no bairro Montese, e o bairro bateu.
O teste existente fixava exatamente esse comportamento errado (`toBe("gomes")`).

## Correção aplicada

- `findRestrictedBranch` só associa a loja pelo **nome exato** (sem "Cometa"/"Loja") ou pelo
  **endereço com número** contido no texto; senão `null`.
- Novo `storeRestriction(description)`: quando o encarte é exclusivo de uma loja, as ofertas
  lidas dele recebem "Somente na loja X" nas condições (a oferta aparece fora do contexto do
  encarte e a loja pode não estar na lista do site).
- Testes: `parse.test.ts` (Montese → null, com o texto real; Kennedy pelo endereço;
  nome exato), `cometa.test.ts` (encarte 512 → `branch_id: null`), `manual.test.ts`.

## Como foi validado

`packages/sources`: 45 testes. `pnpm importar` real: encarte 512 sem filial, 55 ofertas com
"Somente na loja Montese" nas condições.

## Como evitar a repetição

Associação de encarte a loja precisa de identificação inequívoca (nome ou endereço). Dado
ausente é melhor que dado errado — o texto original do encarte continua visível.

## Aprendizado reutilizável

Conferir o dado importado contra o documento original (aqui, o rodapé do encarte) pega erros
que o teste não pega quando o teste foi escrito a partir da mesma suposição do código.
