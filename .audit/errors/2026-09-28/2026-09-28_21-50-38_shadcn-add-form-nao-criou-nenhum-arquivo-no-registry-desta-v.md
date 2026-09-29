# Erro — shadcn add form nao criou nenhum arquivo no registry desta versao

- Data e hora: 2026-09-28 21:50:38 -03:00
- Agente/responsável: Claude Code
- Ambiente: web (apps/web, shadcn CLI 4.21.0, style "base-nova")
- Comando ou ação que gerou o erro: `pnpm dlx shadcn@latest add form -y` (dentro de `apps/web`, e também como parte de um `add` em lote com outros componentes)
- Status: corrigido (com alternativa local)
- Severidade: baixa

## Mensagem completa do erro

Não houve mensagem de erro — o comando terminou com sucesso (`Done in 2s`), mas não
criou `src/components/ui/form.tsx` nem imprimiu "Created N files" como fez para os
outros 17 componentes pedidos no mesmo lote (`card`, `input`, `badge`, `tabs`, `select`,
`dialog`, `sheet`, `dropdown-menu`, etc.).

## Sintoma

`src/components/ui/form.tsx` nunca foi criado, apesar de dois comandos `shadcn add`
diferentes pedirem explicitamente o componente `form`.

## Motivo provável ou causa raiz

A versão do shadcn CLI usada neste projeto (`4.21.0`, style `base-nova`) parece não
registrar mais um componente chamado exatamente `form` no registry padrão — o CLI trata
o nome como "nada a fazer" em vez de erro. Não confirmamos a causa raiz exata (pode ser
rename do componente, remoção, ou exigir um registry adicional não configurado em
`components.json` → `registries`), só confirmamos que o nome `form` não resolve para
nenhum arquivo nesta versão.

## Correção aplicada

Em vez de investigar further a fundo o novo registry (o que consumiria tempo
desproporcional ao MVP), recriamos localmente o padrão clássico do shadcn/ui para
formulários em `src/components/ui/form.tsx`: `Form` (= `FormProvider` do
react-hook-form), `FormField` (wrapper de `Controller`), `FormItem`, `FormLabel`,
`FormControl`, `FormDescription`, `FormMessage`, usando apenas dependências já
instaladas (`react-hook-form` e o `Label` do shadcn). A API é idêntica à do componente
"form" clássico do shadcn/ui, então qualquer formulário do projeto pode seguir a
documentação pública normalmente.

## Como foi validado

Usado nos formulários de `/entrar`, `/cadastro` e no painel `/admin` (oferta, encarte,
mercado) — ver registros de mudança correspondentes. `tsc --noEmit` não acusa erro de
tipos no wrapper.

## Como evitar a repetição

Ao adicionar um componente shadcn novo, sempre conferir a saída do comando (`Created N
files` vs. silêncio) em vez de assumir que "terminou sem erro" significa "criou o
arquivo". Se um componente esperado não aparecer em `src/components/ui/`, não insistir
tentando o mesmo nome — verificar `components.json` → `registries` ou construir uma
alternativa local mínima e documentar aqui.

## Aprendizado reutilizável

Neste projeto, o formulário do shadcn/ui **não** vem do registry — é o wrapper local em
`apps/web/src/components/ui/form.tsx`, com a mesma API pública da documentação oficial
do shadcn/ui (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`,
`FormDescription`, `FormMessage`). Não tentar rodar `shadcn add form` de novo neste
projeto sem antes investigar `registries` em `components.json`.
