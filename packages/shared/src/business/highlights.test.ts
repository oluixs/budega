import { describe, expect, it } from "vitest";
import type { Offer } from "../types/index";
import { discountRatio, pickHighlightOffers } from "./highlights";

const offer = (id: string, market_id: string, promotional_price: number, regular_price: number | null, is_featured = false) =>
  ({ id, market_id, promotional_price, regular_price, is_featured }) as Offer;

describe("pickHighlightOffers", () => {
  it("usa os destaques do admin quando existem", () => {
    const offers = [offer("a", "cometa", 5, 10), offer("b", "cometa", 5, null, true)];
    expect(pickHighlightOffers(offers, 8).map((o) => o.id)).toEqual(["b"]);
  });

  it("sem destaque, alterna mercados e ordena por desconto", () => {
    const offers = [
      offer("c1", "cometa", 9, 10), // 10%
      offer("c2", "cometa", 5, 10), // 50%
      offer("c3", "cometa", 8, 10), // 20%
      offer("f1", "frangolandia", 5, null),
    ];
    expect(pickHighlightOffers(offers, 3).map((o) => o.id)).toEqual(["c2", "f1", "c3"]);
  });

  it("desconto só com preço anterior maior", () => {
    expect(discountRatio({ promotional_price: 5, regular_price: null })).toBe(0);
    expect(discountRatio({ promotional_price: 5, regular_price: 4 })).toBe(0);
    expect(discountRatio({ promotional_price: 5, regular_price: 10 })).toBe(0.5);
  });
});
