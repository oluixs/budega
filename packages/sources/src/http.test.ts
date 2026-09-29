import { describe, expect, it } from "vitest";
import { createHttpClient, isPathAllowed, parseRobots, RobotsDisallowedError, USER_AGENT } from "./http";
import { titleCase } from "./text";

describe("robots.txt", () => {
  it("usa o grupo '*' quando não há regra específica do BudegaBot", () => {
    const rules = parseRobots("User-agent: *\nDisallow: /admin\nAllow: /admin/publico\n");
    expect(isPathAllowed(rules, "/api/encartes")).toBe(true);
    expect(isPathAllowed(rules, "/admin/painel")).toBe(false);
    expect(isPathAllowed(rules, "/admin/publico/x")).toBe(true);
  });

  it("grupo específico do BudegaBot tem prioridade", () => {
    const rules = parseRobots("User-agent: *\nDisallow:\n\nUser-agent: BudegaBot\nDisallow: /\n");
    expect(isPathAllowed(rules, "/encartes")).toBe(false);
  });

  it("o cliente não acessa caminho proibido e se identifica", async () => {
    const calls: { url: string; userAgent: string | null }[] = [];
    const fakeFetch = async (url: string, init?: RequestInit) => {
      calls.push({ url, userAgent: new Headers(init?.headers).get("User-Agent") });
      if (url.endsWith("/robots.txt")) return new Response("User-agent: *\nDisallow: /privado\n");
      return new Response(JSON.stringify({ ok: true }));
    };
    const http = createHttpClient({ fetch: fakeFetch });

    await expect(http.getJson("https://mercado.exemplo/privado/dados")).rejects.toBeInstanceOf(RobotsDisallowedError);
    await expect(http.getJson("https://mercado.exemplo/api/encartes")).resolves.toEqual({ ok: true });
    expect(calls.filter((c) => c.url.endsWith("/robots.txt"))).toHaveLength(1); // cache por site
    expect(calls.every((c) => c.userAgent === USER_AGENT)).toBe(true);
  });

  it("robots.txt ausente (página HTML de 404) não bloqueia", async () => {
    const http = createHttpClient({
      fetch: async (url) =>
        url.endsWith("/robots.txt") ? new Response("<!DOCTYPE html><html>404</html>") : new Response("[]"),
    });
    await expect(http.getJson("https://mercado.exemplo/api/x")).resolves.toEqual([]);
  });
});

describe("titleCase", () => {
  it("converte títulos em caixa alta mantendo siglas", () => {
    expect(titleCase("OFERTAS DE INAUGURAÇÃO GUARARAPES")).toBe("Ofertas de Inauguração Guararapes");
    expect(titleCase("CLUBE TEM MAIS PRA VOCÊ")).toBe("Clube Tem Mais pra Você");
    expect(titleCase("FESTIVAL DE MASSAS M DIAS E JSB")).toBe("Festival de Massas M Dias e JSB");
    expect(titleCase("Caucaia (pátio sol poente)")).toBe("Caucaia (Pátio Sol Poente)");
    expect(titleCase("RODOVIA ESTRUTURANTE - CE 085")).toBe("Rodovia Estruturante - CE 085");
  });
});
