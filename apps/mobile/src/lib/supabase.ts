import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSupabaseConnection } from "@budega/supabase";
import { env } from "./env";

export const { client: supabase, isMock } = createSupabaseConnection(
  env.supabaseUrl,
  env.supabaseAnonKey,
  AsyncStorage,
);
