import { describe, expect, it } from "vitest";
import { regionalSnapshot } from "@budega/shared";
import nextConfig from "../../next.config";

/**
 * Regressão: a Super Lagoa foi adicionada aos dados reais sem seu domínio de imagens em
 * `next.config.ts` — `next/image` recusa qualquer host fora de `images.remotePatterns` e
 * derruba a página inteira com erro 500 (não só a imagem). Nenhum teste roda com dados
 * reais (e2e usa BUDEGA_DADOS=demo), então isso só apareceu ao navegar manualmente com o
 * Supabase real. Este teste cobre os hosts de imagem de `regional.json` diretamente, sem
 * precisar rodar o servidor.
 */
describe("hosts de imagem cobertos em next.config.ts", () => {
  const allowedHosts = new Set(
    (nextConfig.images?.remotePatterns ?? []).map((pattern) =>
      typeof pattern.hostname === "string" ? pattern.hostname : null,
    ),
  );

  function hostOf(url: string): string {
    return new URL(url).hostname;
  }

  function isAllowed(host: string): boolean {
    // next/image aceita padrão exato ou com wildcard de subdomínio (**.exemplo.com).
    return (
      allowedHosts.has(host) ||
      [...allowedHosts].some((pattern) => pattern?.startsWith("**.") && host.endsWith(pattern.slice(2)))
    );
  }

  const urls = [
    ...regionalSnapshot.markets.map((market) => market.logo_url).filter((url): url is string => Boolean(url)),
    ...regionalSnapshot.flyers.map((flyer) => flyer.cover_url).filter((url): url is string => Boolean(url)),
    ...regionalSnapshot.offers.map((offer) => offer.image_url).filter((url): url is string => Boolean(url)),
  ];

  it.each([...new Set(urls.map(hostOf))])("%s está em images.remotePatterns", (host) => {
    expect(isAllowed(host), `adicione { protocol: "https", hostname: "${host}" } em next.config.ts`).toBe(true);
  });
});
