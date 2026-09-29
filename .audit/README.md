# Protocolo de auditoria do Budega

Este diretório é a memória operacional do projeto: todo trabalho feito por um agente de
IA (Claude Code ou outro) precisa deixar um rastro aqui **antes** de a tarefa ser
apresentada como concluída. O objetivo não é burocracia — é evitar repetir os mesmos
erros e permitir que qualquer pessoa (ou agente) entenda o histórico de decisões sem
precisar reconstruir contexto do zero.

Fuso horário usado em todos os registros: **America/Sao_Paulo (UTC-03:00)**. Não misture
fusos horários diferentes num mesmo arquivo; se o ambiente de execução mudar de fuso,
registre o fuso explicitamente no cabeçalho do arquivo.

## Estrutura

```
.audit/
  README.md              # este arquivo
  changes/
    YYYY-MM-DD/
      YYYY-MM-DD_HH-mm-ss_<slug>.md
  errors/
    README.md
    YYYY-MM-DD/
      YYYY-MM-DD_HH-mm-ss_<slug-do-erro>.md
  decisions/
    YYYY-MM-DD_HH-mm-ss_<slug>.md
```

## Protocolo obrigatório antes de alterar qualquer arquivo

1. Ler este README.
2. Ler os registros mais recentes em `changes/` (pelo menos os últimos dias, ou os
   relacionados à área que será tocada).
3. Ler todos os registros em `errors/` (abertos ou corrigidos) relacionados à área que
   será alterada — busque por nome de arquivo, componente, rota, tabela, comando ou
   plataforma.
4. Rodar `pnpm audit:preflight` para obter um resumo automático dos erros relacionados
   (o script aceita uma palavra-chave, ex.: `pnpm audit:preflight -- ofertas`).
5. Resumir os aprendizados aplicáveis (mentalmente ou em `PLAN.md`).
6. Só então alterar o sistema.

## Quando criar um registro de mudança

Sempre que houver: criação/edição/exclusão de arquivo, instalação/remoção de
dependência, alteração de banco de dados/schema, alteração de variáveis de
ambiente/configuração, mudança de interface, correção de bug, alteração de testes,
alteração de build/deploy, ou uma decisão técnica relevante.

Use `pnpm audit:change -- "<título curto>"` para gerar o modelo com data/hora já
preenchidas em `changes/YYYY-MM-DD/`. Preencha todas as seções — "O que foi alterado",
"Motivo", "Impacto", "Validação executada", "Pendências e riscos". O registro deve ser
criado no mesmo ciclo da alteração, nunca só no fim de uma sessão longa. Mudanças
pequenas e relacionadas podem compartilhar um registro, desde que todos os arquivos
afetados sejam listados.

## Quando criar um registro de erro

Todo erro relevante encontrado durante implementação, teste, build, execução, lint,
integração ou validação. Use `pnpm audit:error -- "<título curto>"` para gerar o modelo
em `errors/YYYY-MM-DD/`. Um registro de erro **nunca** deve dizer apenas "corrigido" — ele
precisa explicar data, mensagem completa do erro, causa raiz (confirmada ou hipótese),
correção aplicada, validação pós-correção, como evitar a repetição e um aprendizado
reutilizável objetivo.

Se o erro puder reaparecer, a correção precisa incluir pelo menos uma proteção real:
teste automatizado, validação de tipo/schema, regra de lint, verificação no build,
checklist no `PLAN.md`, regra documentada aqui, ou uma abstração compartilhada que
impeça implementações divergentes.

**Nunca** registre segredos, tokens, senhas ou dados pessoais nos arquivos de auditoria.
Redija (censure) esses valores antes de salvar uma mensagem de erro.

## Consultando o histórico

- Por data: navegue em `changes/YYYY-MM-DD/` ou `errors/YYYY-MM-DD/`.
- Por palavra-chave: `pnpm audit:preflight -- <palavra-chave>` procura em todos os
  arquivos de `changes/` e `errors/` e imprime um resumo.
- Decisões técnicas isoladas (que não são uma mudança de código em si, ex.: "usar
  Supabase em vez de Firebase") ficam em `decisions/`.

## "Aprender" com erros, sem alegar retreinamento

O aprendizado persistente deste projeto **não** vem de o modelo mudar seus pesos — vem
deste diário versionado, das regras de prevenção descritas em cada registro de erro, dos
testes de regressão adicionados e da leitura obrigatória deste histórico antes de cada
mudança. Trate cada erro como conhecimento operacional verificável dentro do repositório,
não como algo que o agente "vai lembrar sozinho" na próxima sessão.
