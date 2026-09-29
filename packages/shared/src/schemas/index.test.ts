import { describe, expect, it } from "vitest";
import { offerFormSchema, flyerFormSchema, validateUpload, ALLOWED_IMAGE_TYPES } from "./index.js";

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
