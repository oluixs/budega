# DESIGN.md — Direção visual do Budega

## Personalidade da marca

Budega é a "vendinha do bairro" digital: um jeito rápido de saber onde comprar mais
barato perto de você. A marca deve transmitir **economia, confiança, proximidade,
praticidade e a alegria de achar uma boa oferta** — sem parecer um dashboard SaaS
genérico nem um catálogo promocional gritante.

Referências de tom: mercado de bairro bem cuidado, não hipermercado corporativo;
confiável como um aplicativo bancário, mas caloroso como uma feira de bairro.

### O que evitar (do brief)
- Visual genérico de template SaaS.
- Excesso de gradientes.
- Excesso de cards sem hierarquia.
- Textos pequenos.
- Telas com muita informação competindo entre si.
- Uso exagerado de cores promocionais (vermelho/amarelo em tudo).
- Componentes diferentes para a mesma função (sempre shadcn/ui como base).

## Paleta de cores

Base neutra quente (não cinza puro de dashboard) + verde como cor de marca
(economia/confiança/frescor) + terracota como cor de destaque pontual para ofertas.

| Token                  | Hex       | Uso                                           |
|------------------------|-----------|------------------------------------------------|
| `--color-brand-50`     | `#F1F8F3` | fundos suaves de destaque da marca             |
| `--color-brand-100`    | `#DCEEE1` | hover sutil, chips                             |
| `--color-brand-500`    | `#1F7A4D` | cor primária (botões, links, ícones ativos)    |
| `--color-brand-600`    | `#175C3A` | hover/active de botões primários               |
| `--color-brand-700`    | `#124A2F` | texto sobre `brand-50`, títulos de destaque    |
| `--color-accent-500`   | `#E2612E` | selo de oferta/destaque, preço promocional     |
| `--color-accent-600`   | `#C24E20` | hover do accent                                |
| `--color-neutral-0`    | `#FFFFFF` | superfícies (cards, inputs)                    |
| `--color-neutral-50`   | `#FAF8F5` | fundo de página (branco quente)                |
| `--color-neutral-100`  | `#F0ECE6` | fundo alternado, bordas suaves                 |
| `--color-neutral-300`  | `#D8D2C7` | bordas padrão                                  |
| `--color-neutral-500`  | `#706A5F` | texto secundário (5,4:1 no branco — AA; era `#8A8375`, 3,8:1, reprovado em 29/09/2026) |
| `--color-neutral-700`  | `#4A463D` | texto padrão                                   |
| `--color-neutral-900`  | `#211F1A` | títulos, texto de alto contraste               |

### Cores semânticas

| Token                | Hex       | Uso                                  |
|----------------------|-----------|----------------------------------------|
| `--color-success`    | `#1F7A4D` | confirmações (reaproveita `brand-500`) |
| `--color-warning`    | `#B8871E` | avisos ("confirme na loja", vencendo)  |
| `--color-danger`     | `#C0392B` | erros, ofertas vencidas, exclusão      |
| `--color-info`       | `#2563A3` | informativo neutro                     |

Regra: cor de destaque (`accent`) só aparece em **preço promocional, badge de
"Oferta"/"Destaque" e CTAs de conversão pontuais** (ex.: "Ver oferta"). Nunca usar accent
em navegação, ícones neutros ou fundos grandes — isso é o que causa poluição visual.

## Tipografia

- **Display/títulos**: `Sora` (600/700) — geométrica, amigável, boa em tamanhos grandes.
- **Texto/UI**: `Inter` (400/500/600) — alta legibilidade em telas pequenas.
- Ambas via `next/font` (web) e `expo-font`/Google Fonts (mobile) para consistência.

Escala (baseada em 16px):

| Token         | Tamanho | Peso | Uso                              |
|---------------|---------|------|-----------------------------------|
| `text-display`| 36–44px | 700  | Hero da home                      |
| `text-h1`     | 28–32px | 700  | Título de página                  |
| `text-h2`     | 22–24px | 600  | Título de seção                   |
| `text-h3`     | 18px    | 600  | Título de card                    |
| `text-body-lg`| 16px    | 400  | Corpo padrão (nunca menor em texto de leitura) |
| `text-body`   | 14px    | 400  | Texto secundário, metadados       |
| `text-caption`| 12px    | 500  | Badges, legendas, timestamps      |

Nunca usar menos que 12px para texto informativo real (spec proíbe "textos pequenos").

## Espaçamento

Escala em múltiplos de 4px: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.
Padding interno mínimo de cards: `16px` (mobile) / `20px` (desktop).
Espaço entre seções da home/explorar: `48px` (mobile) / `64px` (desktop).

## Raio, bordas e sombras

- Raio padrão de componentes: `12px` (`--radius-md`). Botões pequenos/badges: `8px`.
  Cards de destaque (hero, banners): `20px`.
- Bordas: `1px solid var(--color-neutral-300)` em superfícies claras; nunca combinar
  borda + sombra forte no mesmo componente (poluição visual).
- Sombra única e sutil para elevação (`--shadow-card`): `0 1px 2px rgba(33,31,26,0.06),
  0 2px 8px rgba(33,31,26,0.06)`. Não usar múltiplas sombras diferentes por tela.

## Estados de interação

| Estado    | Regra                                                             |
|-----------|--------------------------------------------------------------------|
| Hover     | Escurece 1 nível na escala de cor (ex.: `brand-500` → `brand-600`) |
| Pressed   | Escurece 2 níveis + leve `scale(0.98)` (mobile)                    |
| Focus     | Anel de foco 2px `brand-500` com offset 2px — obrigatório p/ teclado |
| Disabled  | Opacidade 40%, cursor `not-allowed`, sem hover                     |
| Loading   | Skeleton (shadcn `Skeleton`) — nunca spinner isolado em listas     |

## Responsividade

- Mobile-first. Breakpoints Tailwind padrão: `sm 640` `md 768` `lg 1024` `xl 1280`.
- Grid de cards: 1 coluna (`<640px`), 2 colunas (`md`), 3 colunas (`lg`), 4 colunas (`xl`).
- Navegação: header com busca (web) ↔ bottom navigation com 4 itens (mobile nativo).
- Alvo de toque mínimo: 44×44px em qualquer elemento interativo mobile.

## Acessibilidade

- Contraste mínimo AA (4.5:1 para texto normal, 3:1 para texto grande/ícones).
  Atenção: `--color-warning` (#B8871E, 3,2:1 no branco) **não** serve para texto comum —
  use-o só em ícones/bordas/fundos com texto em `neutral-700`/`neutral-900`. Calcule o
  contraste de qualquer cor nova antes de usá-la em texto.
- Todo ícone interativo isolado precisa de `aria-label` (web) / `accessibilityLabel` (RN).
- Foco visível sempre (nunca `outline: none` sem substituto).
- Preço promocional nunca comunicado só por cor — sempre com o texto "Oferta"/"-XX%".

## Consistência entre plataformas (web, Android, iPhone)

Os tokens acima (cores, tipografia, espaçamento, raio) vivem em `packages/shared` como
valores de referência e são espelhados em:
- Web: `apps/web` via Tailwind CSS variables (`globals.css` + `tailwind.config`).
- Mobile: `apps/mobile` via NativeWind (`tailwind.config` compartilhando a mesma paleta).

Componentes **não são compartilhados como código de UI** entre web e mobile (DOM vs.
Native), mas usam os mesmos tokens, os mesmos textos (pt-BR) e as mesmas regras de
negócio de `packages/shared`, garantindo a mesma marca com interações nativas de cada
plataforma.

## Idioma

Todo texto visível em português do Brasil, tom direto e amigável (ex.: "Perto de você",
"Confirme o preço na loja", "Nenhum mercado encontrado por aqui ainda").

## Iconografia

`lucide-react` (web) / `lucide-react-native` (mobile) exclusivamente — nunca misturar
bibliotecas de ícones diferentes para o mesmo conceito.
