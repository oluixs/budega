# Decisão — Fallback para shadcn CLI e construção manual sem Magic MCP / Chrome DevTools MCP

- Data e hora: 2026-09-28 21:30:00 -03:00
- Agente/responsável: Claude Code

## Contexto

O brief do projeto (seção 1) exige o uso obrigatório de shadcn/ui MCP, Magic MCP
(21st.dev) e Chrome DevTools MCP quando apropriado, mas também instrui explicitamente:
"Se alguma dessas ferramentas não estiver disponível na sessão, continue com a melhor
alternativa local e documente a limitação. Não invente resultados de ferramentas que não
foram executadas."

Ao iniciar a sessão:
- `shadcn` MCP estava configurado em `.mcp.json`, mas a conexão falhou
  (`CONNECTION_CLOSED`).
- `Magic MCP` (21st.dev) e `Chrome DevTools MCP` não apareceram na lista de ferramentas
  disponíveis nesta sessão (não configurados/instalados no ambiente do Claude Code).
- Apenas a Frontend Design Skill estava disponível como ferramenta de apoio ao design.

## Decisão

Confirmada com o usuário via pergunta direta: usar a CLI pública do shadcn/ui
(`pnpm dlx shadcn@latest add <componente>`) em vez do MCP para gerar componentes web, e
construir manualmente as seções que o Magic MCP normalmente aceleraria (hero, cards de
mercado/oferta, dashboard admin), seguindo os tokens definidos em `DESIGN.md` e a
Frontend Design Skill. A validação de runtime (erros de console/rede, responsividade)
será feita rodando o servidor Next.js localmente e inspecionando manualmente / via
testes automatizados, já que o Chrome DevTools MCP não está disponível — isso é uma
limitação conhecida, documentada no README e em `PLAN.md`.

## Alternativas consideradas

- Pausar o trabalho até o usuário reconectar o shadcn MCP e configurar Magic MCP /
  Chrome DevTools MCP — rejeitada porque adiaria todo o projeto indefinidamente e o
  próprio brief permite fallback documentado.

## Consequências

- Componentes shadcn/ui continuam consistentes (mesma fonte/registro), só a via de
  instalação muda (CLI em vez de MCP).
- Seções "aceleradas" pelo Magic MCP exigem mais tempo de implementação manual, mas
  seguem os mesmos tokens de `DESIGN.md`, então a consistência visual não é afetada.
- Sem Chrome DevTools MCP, a validação de acessibilidade/responsividade/erros de console
  depende de inspeção manual e testes automatizados (Playwright/Vitest) em vez de
  automação via DevTools — risco de passar despercebido algum erro de console que só um
  DevTools real pegaria. Mitigação: testes de integração cobrindo os fluxos críticos.
