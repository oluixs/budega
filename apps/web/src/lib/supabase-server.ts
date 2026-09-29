import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isMockMode } from "@/lib/env";

/**
 * Cliente anônimo, sem cookies, para as páginas públicas (lib/data.ts). Não ler cookies
 * mantém essas páginas estáticas/cacheáveis; o RLS devolve só o que é público.
 */
export const publicSupabase: SupabaseClient | null = isMockMode
  ? null
  : createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

/**
 * Cliente do request atual, autenticado com a sessão do cookie. Use no /admin e em
 * qualquer Server Action que dependa de quem é o usuário — é assim que auth.uid() chega
 * às políticas RLS. Precisa ser criado por request (nunca reutilizar entre requests).
 */
export async function createServerSupabase(): Promise<SupabaseClient | null> {
  if (isMockMode) return null;
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components não podem gravar cookies; o proxy (src/proxy.ts) já
          // renova a sessão antes da renderização, então é seguro ignorar aqui.
        }
      },
    },
  });
}
