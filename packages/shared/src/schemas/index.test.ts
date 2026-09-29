import { describe, expect, it } from "vitest";
import { offerFormSchema, flyerFormSchema, branchFormSchema, reportFormSchema, validateUpload, ALLOWED_IMAGE_TYPES } from "./index";
import { mockBranches, mockCategories, mockMarkets, mockOffers } from "../mock/index";

const validOffer = {
  market_id: "11111111-1111-4111-8111-111111111111",
  branch_id: null,
  category_id: "22222222-2222-4222-8222-222222222222",
  name: "Banana Prata",
  description: null,
  image_url: null,
  promotional_price: 3.49,
  regular_price: 5.99,
  unit: "kg",
  conditions: null,
  valid_from: "2026-06-01",
  valid_until: "2026-06-30",
  is_featured: false,
};

describe("offerFormSchema", () => {
  it("aceita uma oferta válida", () => {
    expect(offerFormSchema.safeParse(validOffer).success).toBe(true);
  });

  it("rejeita quando a validade termina antes de começar", () => {
    const result = offerFormSchema.safeParse({ ...validOffer, valid_from: "2026-06-30", valid_until: "2026-06-01" });
    expect(result.success).toBe(false);
  });

  it("rejeita quando o preço anterior é menor ou igual ao promocional", () => {
    const result = offerFormSchema.safeParse({ ...validOffer, regular_price: 2.0 });
    expect(result.success).toBe(false);
  });

  it("rejeita nome vazio", () => {
    const result = offerFormSchema.safeParse({ ...validOffer, name: "" });
    expect(result.success).toBe(false);
  });
});

describe("flyerFormSchema (publicação de encarte)", () => {
  const validFlyer = {
    market_id: "11111111-1111-4111-8111-111111111111",
    branch_id: null,
    title: "Ofertas da semana",
    file_url: "https://example.com/encarte.pdf",
    file_type: "pdf" as const,
    valid_from: "2026-06-01",
    valid_until: "2026-06-10",
    status: "active" as const,
  };

  it("aceita um encarte válido", () => {
    expect(flyerFormSchema.safeParse(validFlyer).success).toBe(true);
  });

  it("rejeita encarte sem período de validade coerente", () => {
    const result = flyerFormSchema.safeParse({ ...validFlyer, valid_until: "2026-05-01" });
    expect(result.success).toBe(false);
  });
});

describe("validateUpload", () => {
  it("aceita imagem dentro do limite de tamanho", () => {
    expect(validateUpload({ type: "image/png", size: 1024 }, ALLOWED_IMAGE_TYPES)).toEqual({ valid: true });
  });

  it("rejeita tipo de arquivo não permitido", () => {
    const result = validateUpload({ type: "application/zip", size: 1024 }, ALLOWED_IMAGE_TYPES);
    expect(result.valid).toBe(false);
  });

  it("rejeita arquivo maior que o limite", () => {
    const result = validateUpload({ type: "image/png", size: 999_999_999 }, ALLOWED_IMAGE_TYPES);
    expect(result.valid).toBe(false);
  });
});

// Regressão: os formulários do admin usam os IDs dos dados mock (ex.:
// "mkt-bompreco-pinheiros"), que não são UUIDs. Com `.uuid()` no schema, criar oferta ou
// encarte em modo mock era impossível (ver .audit/errors/2026-09-29/).
describe("schemas aceitam os IDs reais dos dados mock", () => {
  const market = mockMarkets[0]!;
  const branch = mockBranches.find((b) => b.market_id === market.id)!;

  it("offerFormSchema", () => {
    const result = offerFormSchema.safeParse({
      ...validOffer,
      market_id: market.id,
      branch_id: branch.id,
      category_id: mockCategories[0]!.id,
    });
    expect(result.success).toBe(true);
  });

  it("flyerFormSchema", () => {
    const result = flyerFormSchema.safeParse({
      market_id: market.id,
      branch_id: branch.id,
      title: "Ofertas da semana",
      file_url: "https://example.com/encarte.pdf",
      file_type: "pdf",
      valid_from: "2026-06-01",
      valid_until: "2026-06-10",
    });
    expect(result.success).toBe(true);
  });

  it("branchFormSchema", () => {
    const result = branchFormSchema.safeParse({
      market_id: branch.market_id,
      name: branch.name,
      address: branch.address,
      neighborhood: branch.neighborhood,
      city: branch.city,
      state: branch.state,
      postal_code: branch.postal_code,
      latitude: branch.latitude,
      longitude: branch.longitude,
      phone: branch.phone,
      opening_hours: branch.opening_hours,
    });
    expect(result.success).toBe(true);
  });

  it("reportFormSchema", () => {
    const result = reportFormSchema.safeParse({
      market_id: market.id,
      offer_id: mockOffers[0]!.id,
      reason: "preco_incorreto",
    });
    expect(result.success).toBe(true);
  });

  it("continua exigindo que um mercado seja selecionado", () => {
    const result = offerFormSchema.safeParse({ ...validOffer, market_id: "" });
    expect(result.success).toBe(false);
  });
});
