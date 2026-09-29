import { describe, expect, it } from "vitest";
import { calculateDistanceKm, matchesMarketQuery, sortMarkets, withDistance } from "./distance";
import type { Branch, Market } from "../types/index";

const pinheiros = { latitude: -23.561, longitude: -46.6822 };
const moema = { latitude: -23.6003, longitude: -46.665 };

function buildMarket(overrides: Partial<Market>): Market {
  return {
    id: "m1",
    name: "Mercado Teste",
    slug: "mercado-teste",
    description: null,
    logo_url: null,
    phone: null,
    whatsapp: null,
    address: "Rua A",
    neighborhood: "Bairro",
    city: "São Paulo",
    state: "SP",
    postal_code: "00000-000",
    latitude: 0,
    longitude: 0,
    opening_hours: [],
    is_verified: false,
    is_featured: false,
    is_suspended: false,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("calculateDistanceKm", () => {
  it("calcula a distância aproximada entre Pinheiros e Moema (~4,7km em linha reta)", () => {
    const distance = calculateDistanceKm(pinheiros, moema);
    expect(distance).not.toBeNull();
    expect(distance!).toBeGreaterThan(3);
    expect(distance!).toBeLessThan(6);
  });

  it("retorna 0 para o mesmo ponto", () => {
    expect(calculateDistanceKm(pinheiros, pinheiros)).toBeCloseTo(0, 5);
  });

  it("retorna null quando falta uma coordenada", () => {
    expect(calculateDistanceKm(null, moema)).toBeNull();
    expect(calculateDistanceKm(pinheiros, undefined)).toBeNull();
  });
});

describe("sortMarkets", () => {
  const near = buildMarket({ id: "near", latitude: pinheiros.latitude, longitude: pinheiros.longitude });
  const far = buildMarket({ id: "far", latitude: -23.9, longitude: -46.9 });
  const featuredFar = buildMarket({ id: "featured-far", latitude: -23.95, longitude: -46.95, is_featured: true, is_verified: true });

  it("ordena por distância, mais perto primeiro", () => {
    const withDist = withDistance([far, near], pinheiros);
    const sorted = sortMarkets(withDist, "distance");
    expect(sorted.map((m) => m.id)).toEqual(["near", "far"]);
  });

  it("mercados sem distância calculável (localização do usuário indisponível) vão para o final", () => {
    const [withCoords] = withDistance([near], pinheiros);
    const [withoutCoords] = withDistance([far], null);
    const sorted = sortMarkets([withoutCoords!, withCoords!], "distance");
    expect(sorted.map((m) => m.id)).toEqual(["near", "far"]);
  });

  it("ordena por relevância priorizando destaque/verificado mesmo se mais longe", () => {
    const withDist = withDistance([near, featuredFar], pinheiros);
    const sorted = sortMarkets(withDist, "relevance");
    expect(sorted[0]!.id).toBe("featured-far");
  });
});

describe("redes com várias lojas", () => {
  const chain = buildMarket({ id: "rede", latitude: -23.9, longitude: -46.9 }); // matriz longe
  const branch = (id: string, latitude: number, longitude: number, neighborhood = "Centro") =>
    ({ id, market_id: "rede", name: `Loja ${id}`, neighborhood, city: "São Paulo", address: "Rua X, 1", latitude, longitude }) as Branch;
  const branches = [branch("longe", -23.95, -46.95), branch("perto", pinheiros.latitude, pinheiros.longitude, "Pinheiros")];

  it("usa a distância até a loja mais próxima", () => {
    const [result] = withDistance([chain], pinheiros, branches);
    expect(result!.distance_km).toBeLessThan(0.01);
    expect(result!.nearest_branch?.id).toBe("perto");
  });

  it("em empate com o endereço principal, informa a loja", () => {
    // Endereço principal do mercado = a própria loja nº 1 (caso do Cometa).
    const main = buildMarket({ id: "rede", latitude: pinheiros.latitude, longitude: pinheiros.longitude });
    const [result] = withDistance([main], pinheiros, branches);
    expect(result!.nearest_branch?.id).toBe("perto");
  });

  it("busca por bairro encontra a rede pelas lojas dela", () => {
    expect(matchesMarketQuery(chain, branches, "pinheiros")).toBe(true);
    expect(matchesMarketQuery(chain, branches, "Moema")).toBe(false);
    expect(matchesMarketQuery({ ...chain, name: "Empório São João" }, [], "sao joao")).toBe(true);
  });
});
