# Erro — rotulos das abas do app cortados pela altura fixa

- Data e hora: 2026-09-29 14:08:56 -03:00
- Agente/responsável: Claude Code
- Ambiente: Android | iPhone (visto na versão web do app, Pixel 7)
- Comando ou ação que gerou o erro: screenshots da versão web do app (`expo export --platform web` + Playwright)
- Status: corrigido
- Severidade: média

## Mensagem completa do erro

Medição no DOM: rótulo "Perfil" com **4 px** de altura (depois 9–11 px nas tentativas
intermediárias) numa barra de 42–62 px; texto visivelmente cortado.

## Sintoma

"Explorar", "Buscar", "Favoritos" e "Perfil" apareciam cortados embaixo dos ícones.

## Motivo provável ou causa raiz

Confirmada, duas partes:
1. `tabBarStyle: { height: 60, paddingBottom: 8 }` fixava a altura e anulava o espaço que o
   React Navigation reserva para a área segura (barra de gestos do Android, indicador do
   iPhone) — nesses aparelhos, os rótulos seriam cortados.
2. Rótulos de 12 px (mínimo do DESIGN.md) + a caixa fixa de ~28 px que o navegador reserva
   para o ícone não cabem na altura padrão (pensada para rótulos de 10 px).

## Correção aplicada

`apps/mobile/src/app/(tabs)/_layout.tsx`: altura `70 + insets.bottom` e
`paddingBottom: 8 + insets.bottom` (`useSafeAreaInsets`), ícones de 22 px e
`lineHeight: 16` no rótulo.

## Como foi validado

Medição: rótulos com 16 px de altura; screenshot mostra os quatro inteiros.

## Como evitar a repetição

Nunca fixar altura de barra inferior sem somar `insets.bottom`. Conferir a barra em
screenshot de celular (versão web do app) antes de dar a UI por pronta.

## Aprendizado reutilizável

Altura fixa em componente que encosta na borda da tela precisa considerar a área segura.
