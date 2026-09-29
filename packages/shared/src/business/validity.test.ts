import { describe, expect, it } from "vitest";
import {
  canPublishOffer,
  filterActiveFlyers,
  filterActiveOffers,
  isExpiringSoon,
  isFlyerActive,
  isOfferActive,
} from "./validity";

const now = new Date("2026-06-15T12:00:00.000Z");

describe("isOfferActive", () => {
  it("é ativa quando dentro do período de validade e is_active=true", () => {
    expect(
      isOfferActive({ is_active: true, valid_from: "2026-06-01", valid_until: "2026-06-30" }, now),
    ).toBe(true);
  });

  it("é inativa quando a validade já passou (oferta vencida)", () => {
    expect(
      isOfferActive({ is_active: true, valid_from: "2026-05-01", valid_until: "2026-06-10" }, now),
    ).toBe(false);
  });

  it("é inativa quando ainda não começou", () => {
    expect(
      isOfferActive({ is_active: true, valid_from: "2026-07-01", valid_until: "2026-07-10" }, now),
    ).toBe(false);
  });

  it("é inativa quando is_active=false mesmo dentro do período", () => {
    expect(
      isOfferActive({ is_active: false, valid_from: "2026-06-01", valid_until: "2026-06-30" }, now),
    ).toBe(false);
  });
});

describe("isFlyerActive", () => {
  it("segue a mesma regra de vigência dos encartes", () => {
    expect(isFlyerActive({ is_active: true, valid_from: "2026-06-01", valid_until: "2026-06-30" }, now)).toBe(true);
    expect(isFlyerActive({ is_active: true, valid_from: "2026-01-01", valid_until: "2026-02-01" }, now)).toBe(false);
  });
});

describe("filterActiveOffers / filterActiveFlyers", () => {
  it("remove itens vencidos da lista pública", () => {
    const offers = [
      { is_active: true, valid_from: "2026-06-01", valid_until: "2026-06-30" },
      { is_active: true, valid_from: "2026-01-01", valid_until: "2026-02-01" },
    ];
    expect(filterActiveOffers(offers, now)).toHaveLength(1);
  });

  it("encartes vencidos não aparecem como vigentes", () => {
    const flyers = [
      { is_active: true, valid_from: "2026-06-01", valid_until: "2026-06-30" },
      { is_active: false, valid_from: "2026-06-01", valid_until: "2026-06-30" },
    ];
    expect(filterActiveFlyers(flyers, now)).toHaveLength(1);
  });
});

describe("canPublishOffer", () => {
  it("oferta sem validade não pode ser publicada", () => {
    expect(canPublishOffer({ valid_from: null, valid_until: null })).toBe(false);
    expect(canPublishOffer({ valid_from: "2026-06-01", valid_until: null })).toBe(false);
    expect(canPublishOffer({ valid_from: "2026-06-01", valid_until: "2026-06-30" })).toBe(true);
  });
});

describe("isExpiringSoon", () => {
  it("identifica conteúdo vencendo dentro do limiar padrão de 3 dias", () => {
    expect(isExpiringSoon("2026-06-17", now)).toBe(true);
    expect(isExpiringSoon("2026-06-25", now)).toBe(false);
    expect(isExpiringSoon("2026-06-10", now)).toBe(false);
  });
});
