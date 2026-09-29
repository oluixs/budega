# Prompt original — Budega Web + Android

Este é o texto integral do briefing original fornecido pelo usuário no início do
projeto (documento "Prompt para Claude Code — Budega Web + Android"). Está preservado
aqui, sem edições de conteúdo, para que qualquer sessão futura do Claude Code (em
qualquer computador) tenha o contexto completo e alinhado do que foi pedido, sem
depender de o usuário reenviar o documento original.

**Para trabalho contínuo no projeto, leia primeiro, nesta ordem:** `README.md` (estado
atual, comandos, limitações conhecidas) → `PLAN.md` (progresso por fase) → `DESIGN.md`
(direção visual) → `.audit/README.md` (protocolo de auditoria) → este arquivo (o pedido
original completo, para referência dos requisitos).

---

Você é um engenheiro de software sênior, product designer e especialista em UX
responsável por construir um MVP bonito, funcional e responsivo do aplicativo Budega.

O Budega ajuda pessoas a localizar mercados próximos e consultar encartes e promoções.
O produto deve ser entregue em duas experiências conectadas ao mesmo backend:

1. Sistema web responsivo, acessível pelo navegador em desktop e celular;
2. Aplicativo Android, com experiência nativa mobile-first.

O usuário final deve conseguir consultar mercados e ofertas tanto no Android quanto na
web. Os responsáveis pelos mercados e administradores devem ter um sistema web para
cadastrar e gerenciar conteúdo.

## 1. Ferramentas disponíveis e como utilizá-las

As seguintes ferramentas estão instaladas/configuradas no ambiente do Claude Code:

- shadcn/ui MCP;
- Magic MCP da 21st.dev;
- Frontend Design Skill;
- Chrome DevTools MCP.

Use-as de forma obrigatória quando forem apropriadas:

### shadcn/ui MCP

Use para construir os componentes da interface web, incluindo: botões; cards; inputs;
selects; tabs; dialogs; drawers; dropdowns; tabelas; badges; skeletons; toast
notifications; estados vazios; filtros; componentes administrativos.

Não implemente manualmente componentes web que já possam ser obtidos de forma
consistente com shadcn/ui.

### Magic MCP da 21st.dev

Use para acelerar a criação de seções visuais de alta qualidade, especialmente: hero da
página inicial; cards de mercados; cards de ofertas; cabeçalho e navegação; dashboard
administrativo; seções de destaque; estados vazios; componentes promocionais.

Revise e adapte todo código gerado pelo Magic MCP. Não aceite interfaces genéricas,
visualmente poluídas ou inconsistentes apenas porque foram geradas automaticamente.

### Frontend Design Skill

Leia e siga a Frontend Design Skill antes de definir a interface. Use-a para
estabelecer: direção visual; hierarquia de informação; tipografia; cores;
espaçamentos; estados de interação; responsividade; acessibilidade; consistência entre
web, Android e iPhone.

Crie primeiro uma direção visual clara em `DESIGN.md`, com tokens e decisões de
interface. O produto deve parecer uma marca real, não um template genérico de
dashboard.

### Chrome DevTools MCP

Use depois de executar o sistema web para: abrir as páginas principais; verificar erros
de console; verificar erros de rede; testar dimensões desktop e mobile; inspecionar
problemas de responsividade; confirmar que botões e links importantes funcionam; validar
acessibilidade básica; conferir que imagens, fontes e ícones carregam corretamente.

Se encontrar problemas, corrija-os antes de concluir.

Se alguma dessas ferramentas não estiver disponível na sessão, continue com a melhor
alternativa local e documente a limitação. Não invente resultados de ferramentas que
não foram executadas.

## 2. Forma obrigatória de trabalho

Antes de escrever código:

1. inspecione o repositório atual;
2. verifique se existe uma aplicação ou stack que deve ser preservada;
3. se estiver vazio, crie a estrutura recomendada abaixo;
4. leia a Frontend Design Skill disponível;
5. crie `PLAN.md` com etapas pequenas;
6. crie `DESIGN.md` com a direção visual;
7. implemente por etapas funcionais;
8. execute lint, testes e builds;
9. execute a validação web com Chrome DevTools MCP;
10. corrija os erros encontrados;
11. não pare apenas na análise: implemente o máximo possível;
12. se alguma credencial estiver ausente, use modo mock e documente como configurar o
    serviço real.

Ao concluir, entregue uma aplicação executável, não apenas wireframes ou telas
estáticas.

## 3. Arquitetura recomendada

Se o repositório estiver vazio, use um monorepo com pnpm e Turborepo:

```
apps/
  web/       # Next.js + shadcn/ui
  mobile/    # Expo React Native para Android
packages/
  shared/    # tipos, validações, utilitários e regras de negócio
  supabase/  # tipos gerados, migrations e clientes
```

### Aplicação web

Use: Next.js com App Router; TypeScript; Tailwind CSS; shadcn/ui; componentes gerados
ou acelerados pelo Magic MCP quando apropriado; React Hook Form + Zod; TanStack Query;
Supabase; Lucide Icons ou ícones consistentes; Playwright ou testes equivalentes quando
já houver configuração.

A web deve incluir a experiência do consumidor e o painel administrativo.

### Aplicação Android

Use: Expo; React Native; TypeScript; Expo Router; NativeWind ou uma camada visual
equivalente para manter tokens próximos ao web; TanStack Query; Zustand apenas quando
necessário; React Hook Form + Zod; Expo Location; react-native-maps, com fallback
funcional caso a chave do mapa não esteja configurada.

A aplicação mobile para Android e iPhone deve rodar em Expo Go quando possível e possuir
instruções para gerar builds Android e iPhone com EAS.

### Backend

Use Supabase para: autenticação; banco PostgreSQL; Row Level Security; storage de
imagens e PDFs; dados públicos de mercados e ofertas; dados privados administrativos.

As duas aplicações devem compartilhar tipos, validações e regras de negócio pelo pacote
`packages/shared`.

## 4. Direção visual do produto

Crie uma identidade visual própria para o Budega.

A direção deve transmitir: economia; confiança; proximidade; praticidade; descoberta de
boas ofertas.

Evite: visual genérico de template SaaS; excesso de gradientes; excesso de cards sem
hierarquia; textos pequenos; telas com muitas informações competindo entre si; uso
exagerado de cores promocionais; componentes diferentes para a mesma função.

Defina em `DESIGN.md`: paleta de cores; cores semânticas; tipografia; escala de
espaçamento; bordas e sombras; raio dos componentes; estados de hover, pressed, focus,
disabled e loading; regras de responsividade; tokens equivalentes entre web, Android e
iPhone.

Use português do Brasil em todos os textos visíveis.

## 5. Experiência web para consumidores

Crie as seguintes páginas:

### `/`

Página inicial com: proposta de valor clara; campo para endereço ou bairro; botão "Usar
minha localização"; mercados próximos ou mercados em destaque; ofertas em destaque;
categorias de ofertas; chamada para explorar os mercados; design responsivo para
desktop e celular.

### `/explorar`

Tela principal de busca com: campo de localização; lista de mercados; mapa quando
configurado; alternância lista/mapa; filtros por distância, categoria, aberto agora e
atualização; ordenação por distância ou relevância; estados de loading, erro e nenhum
resultado.

### `/mercados/[slug]`

Página do mercado com: nome e imagem; endereço; distância; horário; telefone e
WhatsApp; botão de rota; botão de favorito; encarte atual; ofertas individuais; filtros
por categoria; data da última atualização; aviso de que preço e disponibilidade devem
ser confirmados na loja.

### `/ofertas/[id]`

Página detalhada da oferta com: produto; preço promocional; preço anterior; unidade ou
peso; validade; condições; mercado e filial; compartilhar; salvar; rota para o mercado.

### `/encartes/[id]`

Visualizador de encarte em PDF ou imagens, com: zoom; navegação; validade;
compartilhamento; denúncia de conteúdo desatualizado.

### `/favoritos`

Área com mercados e ofertas salvos.

### `/entrar` e `/cadastro`

Autenticação opcional para sincronizar favoritos e preferências. Não obrigue cadastro
para consultar ofertas.

## 6. Experiência mobile para Android e iPhone

A aplicação mobile para Android e iPhone deve conter as mesmas funcionalidades
essenciais da web, adaptadas à interação nativa:

- navegação inferior com Explorar, Buscar, Favoritos e Perfil;
- telas otimizadas para uma mão;
- cards com áreas de toque grandes;
- bottom sheets para filtros;
- permissões de localização com explicação clara;
- deep links para mercados e ofertas;
- compartilhamento nativo;
- abertura de rota no Google Maps ou outro app de mapas;
- suporte a Android em telas pequenas;
- estados offline e erro amigáveis.

Implemente o mapa quando a configuração estiver disponível. Sem a chave, mantenha a
lista funcionando e exiba um fallback com distância, endereço e botão de rota externa.

Não tente reutilizar diretamente componentes DOM/shadcn/ui dentro do React Native.
Compartilhe tipos, tokens, textos e regras; adapte os componentes para cada plataforma.

## 7. Painel web para mercados e administradores

Crie uma área protegida em `/admin` com layout profissional e responsivo.

### Dashboard

Exiba: mercados ativos; ofertas ativas; encartes vigentes; visualizações; cliques em
rota; cliques em telefone/WhatsApp; alertas de conteúdo vencendo.

### Mercados

Permita: listar; buscar; criar; editar; verificar; suspender; marcar como destaque;
gerenciar filiais.

### Encartes

Permita: enviar PDF ou imagem; informar título; escolher mercado e filial; definir
período de validade; ativar, pausar e arquivar; visualizar o arquivo.

### Ofertas

Permita: cadastrar produto; definir categoria; incluir preço promocional e anterior;
informar unidade; adicionar imagem; definir validade; definir condições; destacar ou
pausar; duplicar uma oferta anterior.

### Denúncias

Permita revisar e resolver denúncias de: preço incorreto; oferta vencida; mercado
incorreto; conteúdo inadequado; encarte ilegível.

Use shadcn/ui para tabelas, filtros, dialogs, forms, badges, tabs, sheets, toasts e
estados vazios.

## 8. Modelo de dados

Use as tabelas abaixo no Supabase:

**profiles**: `id`, `name`, `role`, `created_at`, `updated_at`. Roles mínimas: `user`,
`market_manager`, `admin`.

**markets**: `id`, `name`, `slug`, `description`, `logo_url`, `phone`, `whatsapp`,
`address`, `neighborhood`, `city`, `state`, `postal_code`, `latitude`, `longitude`,
`opening_hours`, `is_verified`, `is_featured`, `created_at`, `updated_at`.

**branches**: `id`, `market_id`, `name`, `address`, `neighborhood`, `city`, `state`,
`postal_code`, `latitude`, `longitude`, `phone`, `opening_hours`, `created_at`,
`updated_at`.

**categories**: `id`, `name`, `slug`, `icon`, `sort_order`, `created_at`. Categorias
seed: alimentos, bebidas, hortifruti, carnes, padaria, higiene e limpeza.

**flyers**: `id`, `market_id`, `branch_id`, `title`, `file_url`, `file_type`,
`valid_from`, `valid_until`, `is_active`, `created_at`, `updated_at`.

**offers**: `id`, `market_id`, `branch_id`, `category_id`, `name`, `description`,
`image_url`, `promotional_price`, `regular_price`, `unit`, `conditions`, `valid_from`,
`valid_until`, `is_active`, `is_featured`, `created_at`, `updated_at`.

**favorites**: `id`, `user_id`, `device_id`, `market_id`, `offer_id`, `created_at`.

**reports**: `id`, `user_id`, `market_id`, `flyer_id`, `offer_id`, `reason`,
`description`, `status`, `created_at`, `resolved_at`.

**analytics_events**: `id`, `event_name`, `user_id`, `market_id`, `offer_id`,
`flyer_id`, `metadata`, `created_at`.

Crie migrations versionadas, índices apropriados e políticas RLS. Ofertas e encartes
vencidos devem deixar de aparecer como ativos.

## 9. Dados de demonstração

Crie modo mock funcional, sem exigir credenciais externas, com: 8 mercados fictícios;
10 filiais; 30 ofertas; 8 encartes; pelo menos 3 encartes vigentes; categorias variadas;
localizações diferentes; mercados em destaque; exemplos de ofertas vencidas para testar
a regra de expiração.

Identifique os dados como demonstração. Quando as variáveis do Supabase existirem,
permita usar o backend real.

## 10. Regras de negócio

1. Oferta sem validade não pode ser publicada.
2. Oferta vencida não aparece na experiência pública.
3. Encarte vencido não aparece como vigente.
4. Mercado precisa ter coordenadas ou endereço válido.
5. Usuário pode consultar conteúdo sem cadastro.
6. Favoritos anônimos podem ser salvos localmente.
7. Compartilhamento deve usar URL pública ou deep link válido.
8. Conteúdo patrocinado deve exibir "Patrocinado" ou "Destaque".
9. Preço e estoque devem possuir aviso de confirmação no estabelecimento.
10. Uploads devem validar tipo e tamanho.
11. Alterações administrativas devem exigir autenticação e role apropriada.
12. Exclusão deve preferir arquivamento quando houver histórico ou métricas associadas.

## 11. Testes e validação visual

Crie testes para: cálculo de distância; ordenação por distância; filtros; validade de
ofertas; favoritos; validação de formulários; publicação de encarte; criação de oferta;
permissões de role; estado sem resultados; fallback quando localização ou mapa falhar.

Depois de implementar o web:

1. inicie o servidor;
2. use Chrome DevTools MCP para acessar as páginas principais;
3. teste desktop e viewport mobile;
4. verifique console e rede;
5. confirme que não há erros visíveis;
6. teste navegação, formulários, filtros, links de rota e compartilhamento;
7. corrija problemas de layout, overflow, carregamento e acessibilidade.

Faça uma verificação manual no Android ou no Expo quando possível: tela inicial;
permissão de localização; exploração por lista; detalhes do mercado; ofertas;
favoritos; compartilhamento; abertura de rota.

## 12. Critérios de aceite

O MVP será considerado pronto quando:

- a aplicação web iniciar sem erro;
- o Android iniciar em modo desenvolvimento;
- web, Android e iPhone usarem o mesmo backend e tipos compartilhados;
- o usuário encontrar mercados por endereço ou localização;
- a lista funcionar mesmo sem chave do mapa;
- o mapa funcionar quando configurado;
- o encarte abrir no web e no Android;
- ofertas vencidas não aparecerem publicamente;
- favoritos funcionarem;
- compartilhamento e rota funcionarem;
- o painel administrativo permitir gerenciar mercados, encartes e ofertas;
- o layout for responsivo e visualmente consistente;
- o Chrome DevTools não mostrar erros críticos;
- lint, testes e build forem executados;
- não existirem segredos versionados;
- houver README completo;
- houver instruções para rodar web, Android, mock e Supabase;
- houver instruções para gerar APK/AAB com Expo EAS.

## 13. Entregáveis do repositório

Deixe no repositório: aplicação web; aplicação mobile para Android e iPhone; pacote
compartilhado; migrations Supabase; seed mock; `.env.example`; `PLAN.md`; `DESIGN.md`;
`README.md` atualizado; política de privacidade; termos de uso; testes automatizados;
componentes visuais consistentes; instruções de deploy web; instruções para executar
Android; instruções para gerar APK/AAB; limitações conhecidas e próximos passos.

O README deve incluir comandos exatos para: instalar dependências; iniciar todos os
apps; iniciar apenas a web; iniciar apenas o Android; rodar modo mock; configurar
Supabase; executar migrations; inserir seed; rodar lint; rodar testes; gerar build web;
gerar builds Android e iPhone com EAS.

## 14. Ordem de implementação

Siga esta ordem:

**Fase 1 — Fundação**: inspecionar o projeto, criar monorepo se necessário, definir
tipos compartilhados, criar `PLAN.md`, `DESIGN.md`, tokens e dados mock.

**Fase 2 — Web pública**: construir a página inicial, exploração, busca, detalhes do
mercado, oferta e encarte usando shadcn/ui e Magic MCP quando adequado.

**Fase 3 — Android**: construir as mesmas jornadas com Expo, navegação nativa,
NativeWind ou equivalente, localização, favoritos e compartilhamento.

**Fase 4 — Backend e administração**: adicionar Supabase, migrations, RLS,
autenticação e painel web administrativo.

**Fase 5 — Qualidade**: executar testes, lint, builds, validação com Chrome DevTools
MCP, revisão responsiva e correção de bugs.

Não avance deixando a etapa anterior quebrada.

## 15. Diretriz final

Priorize um produto bonito, utilizável e demonstrável. A web e o Android devem parecer
parte da mesma marca, mas cada plataforma deve respeitar seus padrões de interação.

Não crie uma coleção de telas estáticas. Crie fluxos reais, estados de carregamento,
erro, vazio e sucesso. Se uma integração externa estiver bloqueada, implemente fallback
local funcional e documente como ativar a integração real.

Comece agora inspecionando o repositório. Depois crie `PLAN.md` e `DESIGN.md`,
implemente as fases na ordem indicada, execute os testes e corrija os problemas antes
de apresentar o resultado.

## 16. Repositório GitHub e nome oficial

O repositório oficial será chamado `budega`. Preserve o nome Budega em: nome da
aplicação; título e metadados web; nome exibido no Android e iPhone; bundle/display
name quando possível; README; documentação; exemplos; seed e dados de demonstração.

Antes de começar, confirme o diretório Git atual e execute uma inspeção segura do
estado do repositório. Não apague trabalho existente. Se o repositório ainda não
estiver inicializado, documente a situação e inicialize-o somente se isso fizer parte
do ambiente disponível.

Use commits pequenos e descritivos. Não faça `git push`, publique releases ou altere
configurações remotas sem autorização explícita do usuário. O código deve ficar
preparado para ser enviado ao repositório GitHub `budega`.

## 17. Registro obrigatório de todas as mudanças feitas pela IA

Toda alteração realizada por você no sistema deve ser registrada automaticamente,
inclusive: criação de arquivos; edição de arquivos; exclusão ou renomeação; instalação
ou remoção de dependências; alteração de banco de dados; alteração de variáveis de
ambiente ou configuração; mudança de schema; mudança de interface; correção de bug;
alteração de testes; alteração de build ou deploy; decisões técnicas relevantes.

Crie esta estrutura no repositório:

```
.audit/
  README.md
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

Use o fuso horário configurado no ambiente. Registre no arquivo o fuso utilizado, por
exemplo `America/Sao_Paulo`, e não misture fusos sem informar.

### Formato de cada registro de mudança

```markdown
# Registro de mudança — <título>

- Data e hora: 2026-09-28 20:00:00 -03:00
- Agente/responsável: Claude Code
- Branch: <branch>
- Commit: <hash ou "não commitado">
- Tipo: feature | bugfix | refactor | config | database | docs | test | design
- Status: concluída | parcial | revertida

## O que foi alterado
Descrição clara dos arquivos, telas, APIs, tabelas e comportamentos modificados

## Motivo
Por que a mudança foi necessária.

## Impacto
Impacto para web, Android, iPhone, backend, banco, segurança e usuários.

## Validação executada
Comandos, testes, lint, build e verificações manuais realizados.

## Pendências e riscos
Itens que ainda precisam de atenção.
```

O registro deve ser criado no mesmo ciclo da alteração e nunca apenas no final de uma
sessão longa. Se várias alterações pequenas fizerem parte da mesma tarefa, elas podem
compartilhar um registro, mas todos os arquivos afetados precisam ser listados.

### Formato de cada registro de erro

Todo erro relevante encontrado durante implementação, teste, build, execução, lint,
integração ou validação deve possuir um arquivo separado em
`.audit/errors/YYYY-MM-DD/` contendo:

```markdown
# Erro — <título curto>

- Data e hora: 2026-09-28 20:05:00 -03:00
- Agente/responsável: Claude Code
- Ambiente: web | Android | iPhone | backend | Supabase | CI
- Comando ou ação que gerou o erro: `<comando ou descrição>`
- Status: aberto | em investigação | corrigido | conhecido | não reproduzido
- Severidade: baixa | média | alta | crítica

## Mensagem completa do erro
Cole a mensagem original sem omitir o trecho relevante.

## Sintoma
O que foi observado pelo sistema ou pelo usuário.

## Motivo provável ou causa raiz
Explique a causa confirmada ou, se ainda não confirmada, as hipóteses.

## Correção aplicada
Descreva a correção, os arquivos alterados e a decisão tomada.

## Como foi validado
Testes e comandos executados após a correção.

## Como evitar a repetição
Regra prática, teste de regressão, validação ou documentação que deve impedir a
repetição.

## Aprendizado reutilizável
Uma instrução objetiva que deve ser consultada antes de alterações futuras.
```

Nunca registre somente "corrigido". O arquivo precisa explicar data, erro, motivo,
correção, validação e prevenção.

## 18. Protocolo obrigatório de prevenção de erros

Antes de modificar qualquer arquivo ou executar uma mudança estrutural, siga
obrigatoriamente este protocolo:

1. leia `.audit/README.md`;
2. leia os registros recentes em `.audit/changes/`;
3. leia todos os registros de erro abertos ou corrigidos que sejam relacionados à área
   que será alterada;
4. pesquise nos registros por palavras-chave como nome do arquivo, componente, rota,
   tabela, comando, plataforma e mensagem de erro;
5. resuma mentalmente ou no `PLAN.md` os aprendizados aplicáveis;
6. só então altere o sistema.

Se o erro puder reaparecer, transforme o aprendizado em pelo menos uma destas
proteções: teste automatizado; validação de tipo ou schema; regra de lint; verificação
no script de build; checklist no `PLAN.md`; regra documentada em `.audit/README.md`;
abstração compartilhada para impedir implementações divergentes.

Antes de concluir qualquer etapa, releia os erros relacionados e confirme que a solução
não reintroduziu o problema.

### Importante sobre "aprender" com erros

O aprendizado persistente será implementado por meio do diário versionado de erros,
regras de prevenção, testes de regressão e leitura obrigatória antes de cada mudança.
Não alegue que o modelo treinou ou alterou seus pesos. Em vez disso, transforme cada
erro em conhecimento operacional verificável dentro do repositório.

## 19. Automatização dos registros

Implemente scripts ou hooks para reduzir o risco de esquecer os registros:

- `scripts/audit-change` para criar um modelo de mudança com data/hora;
- `scripts/audit-error` para criar um modelo de erro com data/hora;
- `scripts/preflight-audit` para ler e resumir erros relacionados antes de alterações;
- `scripts/validate-audit` para verificar se os registros têm os campos obrigatórios.

Adicione comandos ao `package.json`, por exemplo:

```json
{
  "audit:preflight": "node scripts/preflight-audit",
  "audit:change": "node scripts/audit-change",
  "audit:error": "node scripts/audit-error",
  "audit:validate": "node scripts/validate-audit"
}
```

Se hooks Git forem utilizados, eles devem ser simples, documentados e não bloquear o
trabalho de forma silenciosa. Um hook pode alertar quando houver alterações sem
registro, mas deve explicar exatamente como corrigir a situação.

Não registre segredos, tokens, senhas ou valores privados nos arquivos de auditoria.
Redija credenciais e dados pessoais antes de salvar mensagens de erro.

## 20. Entregáveis adicionais de auditoria

Além dos entregáveis anteriores, o repositório deve conter: `.audit/README.md`
explicando o protocolo; pelo menos um exemplo de registro de mudança; pelo menos um
exemplo de registro de erro corrigido; scripts de preflight, criação e validação;
testes para validar o formato dos registros; documentação de como consultar o
histórico; regra no README exigindo leitura do histórico antes de alterações; registro
inicial da criação do projeto Budega.

Ao final de cada sessão de implementação, apresente um resumo com: arquivos
modificados; data e hora da sessão; testes executados; erros encontrados; erros
corrigidos; erros ainda abertos; registro de auditoria criado; próximos passos.

## 21. Critérios adicionais de aceite

O trabalho não estará concluído se: não houver suporte planejado e documentado para
Android e iPhone; o nome Budega não estiver aplicado de forma consistente; mudanças da
IA não estiverem registradas; erros não tiverem arquivos separados com data, erro e
motivo; o sistema não ler o histórico de erros antes de uma alteração; erros corrigidos
não tiverem prevenção ou teste de regressão; os registros contiverem segredos ou dados
pessoais; o README não explicar o processo de auditoria.

Comece cada nova tarefa executando o `preflight-audit`, lendo o histórico relevante e
registrando a mudança antes de apresentar o resultado final.
