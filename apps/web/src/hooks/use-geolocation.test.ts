import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useGeolocation } from "./use-geolocation";

describe("useGeolocation (fallback quando localização falha)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("cai no estado 'unsupported' quando o navegador não tem geolocalização", () => {
    vi.stubGlobal("navigator", {});
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());

    expect(result.current.status).toBe("unsupported");
    expect(result.current.errorMessage).toMatch(/não permite compartilhar localização/i);
  });

  it("expõe uma mensagem amigável quando a permissão é negada", async () => {
    const PERMISSION_DENIED = 1;
    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: (
          _success: PositionCallback,
          error: PositionErrorCallback,
        ) => {
          error({ code: PERMISSION_DENIED, PERMISSION_DENIED, message: "denied" } as GeolocationPositionError);
        },
      },
    });

    const { result } = renderHook(() => useGeolocation());
    act(() => result.current.request());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.errorMessage).toMatch(/permissão de localização negada/i);
  });

  it("retorna as coordenadas em caso de sucesso", async () => {
    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: { latitude: -23.56, longitude: -46.68 },
          } as GeolocationPosition);
        },
      },
    });

    const { result } = renderHook(() => useGeolocation());
    act(() => result.current.request());

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.coordinates).toEqual({ latitude: -23.56, longitude: -46.68 });
  });
});
