import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env, isMockMode } from "@/lib/env";

/** true quando não há credenciais Supabase: o app usa os dados de packages/shared/src/mock. */
export const isMock = isMockMode;

let browserClient: SupabaseClient | null = null;

/**
 * Cliente para componentes client-side (login, cadastro, sair). Usa @supabase/ssr, que
 * guarda a sessão em cookies — assim o servidor (proxy, Server Components e Server
 * Actions do /admin) enxerga o mesmo usuário. Com o supabase-js puro a sessão ficava só
 * no localStorage e toda ação do admin chegava ao banco como anônima (ver
 * .audit/errors/2026-09-29/).
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (isMock) return null;
  browserClient ??= createBrowserClient(env.supabaseUrl!, env.supabaseAnonKey!);
  return browserClient;
}
