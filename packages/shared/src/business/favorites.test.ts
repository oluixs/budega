import { describe, expect, it } from "vitest";
import { addLocalFavorite, isFavorited, mergeFavorites, removeLocalFavorite, toggleLocalFavorite } from "./favorites";

describe("favoritos locais (anônimos)", () => {
  it("adiciona um favorito sem exigir cadastro", () => {
    const favorites = addLocalFavorite([], { market_id: "mkt-1" });
    expect(isFavorited(favorites, { market_id: "mkt-1" })).toBe(true);
  });

  it("não duplica o mesmo favorito", () => {
    let favorites = addLocalFavorite([], { offer_id: "off-1" });
    favorites = addLocalFavorite(favorites, { offer_id: "off-1" });
    expect(favorites).toHaveLength(1);
  });

  it("remove um favorito existente", () => {
    const favorites = addLocalFavorite([], { market_id: "mkt-1" });
    const afterRemove = removeLocalFavorite(favorites, { market_id: "mkt-1" });
    expect(isFavorited(afterRemove, { market_id: "mkt-1" })).toBe(false);
  });

  it("toggle adiciona e depois remove", () => {
    let favorites = toggleLocalFavorite([], { offer_id: "off-2" });
    expect(isFavorited(favorites, { offer_id: "off-2" })).toBe(true);
    favorites = toggleLocalFavorite(favorites, { offer_id: "off-2" });
    expect(isFavorited(favorites, { offer_id: "off-2" })).toBe(false);
  });

  it("mescla favoritos remotos (conta) com locais (dispositivo) sem duplicar", () => {
    const remote = [
      { id: "r1", user_id: "u1", device_id: null, market_id: "mkt-1", offer_id: null, created_at: "2026-01-01T00:00:00.000Z" },
    ];
    const local = [
      { market_id: "mkt-1", offer_id: null, created_at: "2026-01-02T00:00:00.000Z" },
      { market_id: "mkt-2", offer_id: null, created_at: "2026-01-02T00:00:00.000Z" },
    ];
    const merged = mergeFavorites(remote, local);
    expect(merged).toHaveLength(2);
    expect(isFavorited(merged, { market_id: "mkt-2" })).toBe(true);
  });
});
