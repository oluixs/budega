import { createSupabaseConnection } from "@budega/supabase";
import { env } from "@/lib/env";

export const { client: supabase, isMock } = createSupabaseConnection(
  env.supabaseUrl,
  env.supabaseAnonKey,
);
