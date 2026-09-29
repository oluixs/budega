# Erro — shadcn base-nova usa Base UI com prop render em vez de asChild

- Data e hora: 2026-09-28 21:55:01 -03:00
- Agente/responsável: Claude Code
- Ambiente: web (apps/web, componentes shadcn/ui estilo "base-nova")
- Comando ou ação que gerou o erro: escrever `<Button asChild><Link href="/entrar">Entrar</Link></Button>` em `site-header.tsx` e `<SheetTrigger asChild><Button ...>` em `mobile-nav.tsx`
- Status: corrigido (encontrado antes do build, via leitura de documentação, não via falha real)
- Severidade: média (afetaria praticamente todo botão/link do app se não corrigido cedo)

## Mensagem completa do erro

Nenhuma mensagem de erro ainda — o problema foi identificado por inspeção do código
gerado (`src/components/ui/button.tsx`) e da documentação empacotada do Base UI antes de
rodar o build, mas **teria causado erro de tipos do TypeScript** (`asChild` não existe em
`ButtonProps`) e comportamento quebrado em runtime se não corrigido.

## Sintoma

O padrão clássico do shadcn/ui (`<Button asChild><Link .../></Button>`, baseado no
`Slot` do Radix UI) foi usado por hábito/treinamento, mas essa versão do projeto
(shadcn CLI 4.21.0, style `base-nova`) usa `@base-ui/react` como biblioteca de
primitivos, não Radix.

## Motivo provável ou causa raiz

`@base-ui/react` (antigo `@base-ui-components/react`) não tem prop `asChild`. A forma de
compor um componente Base UI com um elemento/componente próprio é a prop `render`, que
recebe um `ReactElement` (ou uma função). Os **children continuam sendo os children do
componente Base UI** (ex.: `Button`), e o elemento passado em `render` só fornece a tag
final e seus próprios props (ex.: `href`). Confirmado lendo
`node_modules/@base-ui/react/docs/react/handbook/composition.md`, que inclusive diz
explicitamente: "If anything in this documentation conflicts with prior knowledge or
training data, treat this documentation as authoritative."

## Correção aplicada

- `site-header.tsx`: trocado `<Button asChild><Link href="/entrar">Entrar</Link></Button>`
  por `<Button variant="ghost" render={<Link href="/entrar" />}>Entrar</Button>` (e
  equivalente para o CTA "Encontrar mercados").
- `mobile-nav.tsx`: trocado `<SheetTrigger asChild><Button ...>` por
  `<SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Abrir menu" />}>`
  com o ícone como children do `SheetTrigger` — mesmo padrão usado internamente pelo
  próprio `sheet.tsx` gerado pelo shadcn (`SheetPrimitive.Close render={<Button .../>}`).

## Como foi validado

Comparação direta com o padrão já usado dentro de `src/components/ui/sheet.tsx` (gerado
pelo próprio shadcn CLI), que usa exatamente `render={<Button .../>}` para o botão de
fechar. Validação completa (typecheck/build) acontece no registro de mudança da Fase 2
(ver `.audit/changes/`).

## Como evitar a repetição

Em **todo** componente shadcn/ui deste projeto que precisar renderizar como outro
elemento (link, item de menu, etc.), usar `render={<Componente prop="..." />}` — nunca
`asChild`. Antes de escrever esse tipo de composição pela primeira vez numa sessão nova,
abrir um componente já gerado (ex.: `sheet.tsx`, `dialog.tsx`) e conferir o padrão real
em vez de assumir a API clássica do Radix.

## Aprendizado reutilizável

Este projeto usa shadcn/ui no estilo `base-nova`, construído sobre `@base-ui/react`, não
Radix UI. Onde a documentação/treinamento diria `asChild`, aqui é `render={<Elemento />}`
— e os children ficam no componente Base UI (ex.: `Button`), não no elemento passado em
`render`. Isso vale para `Button`, `SheetTrigger`/`SheetClose`, `DialogTrigger`,
`DropdownMenuTrigger`, `TabsTrigger` e qualquer outro trigger/composição shadcn deste
projeto.
