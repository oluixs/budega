export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
};

export const hasMapsKey = Boolean(env.googleMapsApiKey);
