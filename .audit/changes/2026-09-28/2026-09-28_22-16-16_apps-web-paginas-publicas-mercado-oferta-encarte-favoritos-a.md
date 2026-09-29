# Registro de mudança — apps-web paginas publicas mercado oferta encarte favoritos auth e paginas legais

- Data e hora: 2026-09-28 22:16:15 -03:00
- Agente/responsável: Claude Code
- Branch: master
- Commit: c150e9f
- Tipo: feature
- Status: concluída

## O que foi alterado

- `/explorar`: busca por texto (endereço/bairro, comparado contra nome/endereço/bairro/
  cidade dos mercados — sem geocoding real, documentado como limitação), filtros por
  distância, categoria (via ofertas ativas do mercado), "aberto agora"
  (`isOpenNow` novo em `packages/shared/src/business/hours.ts`) e "atualizado
  recentemente" (30 dias), ordenação por distância/relevância, alternância lista/mapa,
  estado vazio. Mapa real não implementado — `MapFallback` cobre o requisito do brief de
  "lista funcionando mesmo sem mapa" também quando o usuário escolhe a aba "Mapa".
- `/mercados/[slug]`: header com nome/selo de destaque/verificado, endereço, horário de
  hoje + semana completa (`MarketHours`, usa `isOpenNow`/`formatOpeningHoursToday`),
  telefone/WhatsApp/rota, favoritar, encartes vigentes do mercado, ofertas ativas com
  filtro por categoria, aviso de confirmação de preço, `notFound()` para slug inexistente.
- `/ofertas/[id]`: preço promocional/anterior, unidade, validade, condições,
  mercado+link, compartilhar (Web Share API com fallback de copiar link), favoritar,
  botão de rota até o mercado.
- `/encartes/[id]`: visualizador de imagem com zoom (toggle de escala), navegação entre
  os outros encartes vigentes do mesmo mercado (anterior/próximo), validade,
  compartilhamento, denúncia de conteúdo desatualizado (`ReportDialog` + Server Action
  `submitReport`, que grava no Supabase quando configurado ou só confirma em modo mock).
- `/favoritos`: lê todos os mercados/ofertas no servidor e filtra no cliente pelos IDs
  salvos em `localStorage` (`useFavorites`), sem exigir cadastro.
- `/entrar` e `/cadastro`: formulários com `react-hook-form` + Zod (`authSchema`/
  `signUpSchema` de `@budega/shared`) usando `supabase.auth.signInWithPassword`/`signUp`
  quando configurado; em modo mock, mostra toast explicando como habilitar autenticação
  real em vez de falhar silenciosamente.
- `/privacidade` e `/termos`: conteúdo real (não placeholder vazio) cobrindo LGPD,
  preço/disponibilidade sujeitos a confirmação na loja, conteúdo patrocinado, uso
  aceitável — com aviso de que precisa de revisão jurídica antes de produção.
- **Correção de RLS** em `packages/supabase/migrations/0001_init.sql`: a policy de
  inserção em `reports` exigia `auth.uid() is not null`, o que impediria denúncias
  anônimas — corrigida para `with check (true)` (qualquer pessoa pode denunciar,
  autenticada ou não; select/update continuam restritos a dono/admin). Encontrado por
  revisão antes de qualquer execução real, não por falha em runtime.

## Motivo

Completar a Fase 2 (web pública) do `PLAN.md` com todas as páginas de consumidor
listadas na seção 5 do brief.

## Impacto

- App web público funcionalmente completo em modo mock (sem necessidade de
  credenciais). Painel `/admin` (Fase 4) ainda não existe.
- Denúncias e autenticação reais dependem de Supabase configurado — documentado no
  `.env.example` e explicado via toast na própria UI quando ausente.

## Validação executada

- `pnpm --filter @budega/web exec tsc --noEmit` → sem erros.
- `pnpm --filter @budega/web build` → build de produção completo; rotas estáticas
  (`/`, `/entrar`, `/cadastro`, `/privacidade`, `/termos`, `/favoritos`) e dinâmicas
  (`/explorar`, `/mercados/[slug]`, `/ofertas/[id]`, `/encartes/[id]`) geradas sem erro.
- Servidor `next dev` iniciado e todas as rotas acima testadas com requisições reais
  (`Invoke-WebRequest`), incluindo variações de query string em `/explorar`
  (`q`, `lat`/`lng`, `categoria`, `abertoAgora`, `view=mapa`) e um slug inexistente
  (`/mercados/nao-existe` → 404 correto). Nenhum erro no log do servidor. Isso substitui
  a validação com Chrome DevTools MCP, indisponível nesta sessão (ver decisão
  registrada) — inspeção visual manual num navegador real ainda não foi feita.

## Pendências e riscos

- Falta o painel `/admin` (Fase 4) — mercados/encartes/ofertas/denúncias ainda só podem
  ser vistos, não gerenciados.
- Mapa real (Google Maps) não implementado; sempre usa `MapFallback`, mesmo com chave
  configurada — limitação documentada, não um bug.
- Testes automatizados (Vitest/Playwright) para os fluxos desta página ainda não
  escritos — ficam para a Fase 5 (Qualidade).
- Nenhuma verificação visual num navegador real (só HTTP + logs do servidor) — Chrome
  DevTools MCP indisponível nesta sessão.
