export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
};

export const isMockMode = !env.supabaseUrl || !env.supabaseAnonKey;
export const hasMapsKey = Boolean(env.googleMapsApiKey);
