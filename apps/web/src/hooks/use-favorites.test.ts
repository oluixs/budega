import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useFavorites } from "./use-favorites";

describe("useFavorites (web, localStorage)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("começa vazio e hidratado após o efeito inicial", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.favorites).toHaveLength(0);
  });

  it("adiciona um favorito e persiste em localStorage sem exigir cadastro", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.toggle({ market_id: "mkt-1" });
    });

    await waitFor(() => expect(result.current.isFavorited({ market_id: "mkt-1" })).toBe(true));

    const stored = JSON.parse(window.localStorage.getItem("budega:favorites") ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].market_id).toBe("mkt-1");
  });

  it("toggle remove um favorito já salvo", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.toggle({ offer_id: "off-1" }));
    await waitFor(() => expect(result.current.isFavorited({ offer_id: "off-1" })).toBe(true));

    act(() => result.current.toggle({ offer_id: "off-1" }));
    await waitFor(() => expect(result.current.isFavorited({ offer_id: "off-1" })).toBe(false));
  });

  it("recupera uma nova instância do hook a partir do localStorage já preenchido", async () => {
    window.localStorage.setItem(
      "budega:favorites",
      JSON.stringify([{ market_id: "mkt-2", offer_id: null, created_at: new Date().toISOString() }]),
    );

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.isFavorited({ market_id: "mkt-2" })).toBe(true);
  });
});
