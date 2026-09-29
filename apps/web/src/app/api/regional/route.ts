import { getLocalData } from "@/lib/local-data";

/**
 * Dados regionais (mercados, lojas, encartes e ofertas) para o app mobile, que não lê os
 * sites dos mercados diretamente: o servidor da web já faz isso com cache. O app usa
 * esta rota quando EXPO_PUBLIC_API_URL está configurada; senão, o retrato embutido.
 */
export const revalidate = 600;

export async function GET() {
  const data = await getLocalData();
  return Response.json(
    {
      region: { name: "Fortaleza e Região Metropolitana", center: { latitude: -3.7319, longitude: -38.5267 } },
      generated_at: data.generatedAt ?? new Date().toISOString(),
      sources: data.sources,
      markets: data.markets,
      branches: data.branches,
      flyers: data.flyers,
      offers: data.offers,
    },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } },
  );
}
