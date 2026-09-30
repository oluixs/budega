import { describe, expect, it, vi } from "vitest";

const insertMock = vi.fn(() => Promise.resolve({ error: null }));
const fromMock = vi.fn(() => ({ insert: insertMock }));
const getBrowserSupabaseMock = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getBrowserSupabase: () => getBrowserSupabaseMock(),
}));

describe("trackEvent", () => {
  it("não faz nada em modo mock (getBrowserSupabase retorna null)", async () => {
    getBrowserSupabaseMock.mockReturnValue(null);
    const { trackEvent } = await import("./track-event");

    expect(() => trackEvent("market_view", { market_id: "mkt-1" })).not.toThrow();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("grava o evento com Supabase configurado, sem informar user_id", async () => {
    getBrowserSupabaseMock.mockReturnValue({ from: fromMock });
    const { trackEvent } = await import("./track-event");

    trackEvent("route_click", { market_id: "mkt-1", offer_id: null });

    expect(fromMock).toHaveBeenCalledWith("analytics_events");
    expect(insertMock).toHaveBeenCalledWith({
      event_name: "route_click",
      market_id: "mkt-1",
      offer_id: null,
      flyer_id: null,
      metadata: null,
    });
  });
});
