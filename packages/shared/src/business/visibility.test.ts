import { describe, expect, it } from "vitest";
import { filterByPublicMarkets, filterPublicMarkets } from "./visibility";

const markets = [
  { id: "mkt-a", is_suspended: false },
  { id: "mkt-b", is_suspended: true },
];

describe("visibilidade de mercados suspensos", () => {
  it("remove mercados suspensos", () => {
    expect(filterPublicMarkets(markets).map((m) => m.id)).toEqual(["mkt-a"]);
  });

  it("remove ofertas/encartes/filiais de mercados suspensos ou desconhecidos", () => {
    const items = [
      { id: "1", market_id: "mkt-a" },
      { id: "2", market_id: "mkt-b" },
      { id: "3", market_id: "mkt-inexistente" },
    ];
    expect(filterByPublicMarkets(items, markets).map((i) => i.id)).toEqual(["1"]);
  });
});
