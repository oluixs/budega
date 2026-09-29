import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseConnection {
  client: SupabaseClient | null;
  /** true quando não há credenciais configuradas e o app deve usar dados mock. */
  isMock: boolean;
}

/** Storage mínimo compatível com o que o supabase-js espera (ex.: AsyncStorage do RN). */
export interface AuthStorageAdapter {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
}

/**
 * Cria o cliente Supabase a partir de credenciais já resolvidas pelo app chamador
 * (Next.js usa `NEXT_PUBLIC_*`, Expo usa `EXPO_PUBLIC_*` — cada app lê suas próprias
 * variáveis e repassa aqui, para este pacote não depender do bundler usado).
 *
 * Se `url`/`anonKey` não forem informados, retorna `isMock: true` em vez de lançar erro,
 * para que o app caia graciosamente em modo de demonstração (dados de
 * `@budega/shared`'s mock) sem exigir credenciais externas.
 *
 * `authStorage` é opcional e usado pelo app mobile (Expo/React Native não tem
 * `localStorage`) para persistir a sessão via `@react-native-async-storage/async-storage`.
 * Na web, omitir esse parâmetro deixa o supabase-js usar o `localStorage` do navegador.
 */
export function createSupabaseConnection(
  url: string | undefined,
  anonKey: string | undefined,
  authStorage?: AuthStorageAdapter,
): SupabaseConnection {
  if (!url || !anonKey) {
    return { client: null, isMock: true };
  }

  return {
    client: createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        ...(authStorage ? { storage: authStorage, detectSessionInUrl: false } : {}),
      },
    }),
    isMock: false,
  };
}
