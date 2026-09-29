import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseConnection {
  client: SupabaseClient | null;
  /** true quando não há credenciais configuradas e o app deve usar dados mock. */
  isMock: boolean;
}

/**
 * Cria o cliente Supabase a partir de credenciais já resolvidas pelo app chamador
 * (Next.js usa `NEXT_PUBLIC_*`, Expo usa `EXPO_PUBLIC_*` — cada app lê suas próprias
 * variáveis e repassa aqui, para este pacote não depender do bundler usado).
 *
 * Se `url`/`anonKey` não forem informados, retorna `isMock: true` em vez de lançar erro,
 * para que o app caia graciosamente em modo de demonstração (dados de
 * `@budega/shared`'s mock) sem exigir credenciais externas.
 */
export function createSupabaseConnection(url: string | undefined, anonKey: string | undefined): SupabaseConnection {
  if (!url || !anonKey) {
    return { client: null, isMock: true };
  }

  return {
    client: createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }),
    isMock: false,
  };
}
