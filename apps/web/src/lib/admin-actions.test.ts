import { describe, expect, it } from "vitest";
import { mock, weeklyHours } from "@budega/shared";
import { createBranch, createOffer, deleteBranch, setMarketFlag } from "./admin-actions";

/**
 * Sem credenciais Supabase no ambiente de teste, isMock é sempre true — então estas
 * ações devem simular sucesso e deixar claro que nada foi persistido, em vez de
 * quebrar ou fingir que gravaram de verdade (regra de negócio 10.11: mutações
 * administrativas dependem de autenticação/role real, que só existe com Supabase
 * configurado).
 */
describe("admin-actions em modo mock (sem Supabase configurado)", () => {
  it("createOffer rejeita dados inválidos (oferta sem nome)", async () => {
    const result = await createOffer({
      market_id: "11111111-1111-4111-8111-111111111111",
      branch_id: null,
      category_id: "22222222-2222-4222-8222-222222222222",
      name: "",
      description: "",
      image_url: "",
      promotional_price: 10,
      regular_price: undefined,
      unit: "un",
      conditions: "",
      valid_from: "2026-06-01",
      valid_until: "2026-06-30",
      is_featured: false,
    });

    expect(result.success).toBe(false);
  });

  it("createOffer com dados válidos simula sucesso e avisa que é modo demonstração", async () => {
    const result = await createOffer({
      market_id: "11111111-1111-4111-8111-111111111111",
      branch_id: null,
      category_id: "22222222-2222-4222-8222-222222222222",
      name: "Banana Prata",
      description: "",
      image_url: null,
      promotional_price: 3.49,
      regular_price: 5.99,
      unit: "kg",
      conditions: "",
      valid_from: "2026-06-01",
      valid_until: "2026-06-30",
      is_featured: false,
    });

    expect(result.success).toBe(true);
    expect(result.message).toMatch(/modo demonstração/i);
  });

  it("setMarketFlag em modo mock não lança erro e explica a limitação", async () => {
    const result = await setMarketFlag("mkt-1", "is_verified", true);
    expect(result.success).toBe(true);
    expect(result.message).toMatch(/modo demonstração/i);
  });

  it("createBranch aceita o ID de mercado do modo mock e avisa que é demonstração", async () => {
    const result = await createBranch({
      market_id: mock.mockMarkets[0]!.id,
      name: "Filial Centro",
      address: "Rua Teste, 10",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      postal_code: "01000-000",
      latitude: -23.55,
      longitude: -46.63,
      phone: null,
      opening_hours: weeklyHours("08:00", "20:00", [0]),
    });

    expect(result.success).toBe(true);
    expect(result.message).toMatch(/modo demonstração/i);
  });

  it("createBranch rejeita filial sem mercado ou com coordenada inválida", async () => {
    const base = {
      market_id: mock.mockMarkets[0]!.id,
      name: "Filial Centro",
      address: "Rua Teste, 10",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      postal_code: "01000-000",
      latitude: -23.55,
      longitude: -46.63,
      phone: null,
      opening_hours: [],
    };

    expect((await createBranch({ ...base, market_id: "" })).success).toBe(false);
    expect((await createBranch({ ...base, latitude: 123 })).success).toBe(false);
  });

  it("deleteBranch em modo mock não lança erro e explica a limitação", async () => {
    const result = await deleteBranch(mock.mockBranches[0]!.id);
    expect(result.success).toBe(true);
    expect(result.message).toMatch(/modo demonstração/i);
  });
});
