export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
};

export const isMockMode = !env.supabaseUrl || !env.supabaseAnonKey;
export const hasMapsKey = Boolean(env.googleMapsApiKey);

/**
 * Painel, login e denúncia de demonstração sem Supabase: só em desenvolvimento ou com
 * NEXT_PUBLIC_BUDEGA_PAINEL_DEMO=1 (testes e2e). Nada disso guarda dados de verdade.
 */
export const isDemoPanelEnabled =
  isMockMode && (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_BUDEGA_PAINEL_DEMO === "1");

/**
 * Site publicado sem Supabase: catálogo sem contas, sem painel e sem guardar dados
 * pessoais. Correções e pedidos de remoção vão para o GitHub do projeto.
 */
export const isCatalogMode = isMockMode && !isDemoPanelEnabled;
