import { describe, expect, it } from "vitest";
import type { Offer, RegionalData } from "@budega/shared";
import type { HttpClient } from "./http";
import { importRegional } from "./import";
import type { SourceAdapter } from "./types";

const http = {} as HttpClient;
const now = new Date("2026-09-29T15:00:00Z");

function adapter(id: string, behavior: "ok" | "fail", flyerIds: string[] = []): SourceAdapter {
  return {
    id,
    name: id,
    websiteUrl: `https://${id}.exemplo`,
    async fetch() {
      if (behavior === "fail") throw new Error("site fora do ar");
      return {
        source: { market_id: id, name: id, website_url: `https://${id}.exemplo`, fetched_at: now.toISOString() },
        market: { id } as RegionalData["markets"][number],
        branches: [{ id: `${id}-loja`, market_id: id } as RegionalData["branches"][number]],
        flyers: flyerIds.map((flyerId) => ({ id: flyerId, market_id: id }) as RegionalData["flyers"][number]),
        warnings: [],
      };
    },
  };
}

const offer = (id: string, flyerId: string) => ({ id, flyer_id: flyerId }) as Offer;

describe("importRegional", () => {
  it("fonte que falha mantém os dados da importação anterior e registra o erro", async () => {
    const previous = await importRegional({ http, now, adapters: [adapter("a", "ok", ["a-1"]), adapter("b", "ok", ["b-1"])] });
    const next = await importRegional({ http, now, adapters: [adapter("a", "ok", ["a-2"]), adapter("b", "fail")], previous });

    expect(next.markets.map((m) => m.id)).toEqual(["a", "b"]);
    expect(next.flyers.map((f) => f.id)).toEqual(["a-2", "b-1"]);
    expect(next.sources.find((s) => s.market_id === "b")?.error).toBe("site fora do ar");
  });

  it("ofertas: leitura nova substitui a antiga; encarte que saiu do ar leva as suas", async () => {
    const previous = {
      ...(await importRegional({ http, now, adapters: [adapter("a", "ok", ["f1", "f2", "f3"])] })),
      offers: [offer("velha-f1", "f1"), offer("velha-f2", "f2"), offer("velha-f3", "f3")],
    };
    const next = await importRegional({
      http,
      now,
      adapters: [adapter("a", "ok", ["f1", "f2"])], // f3 saiu do ar
      previous,
      offersByFlyer: new Map([["f1", [offer("nova-f1", "f1")]]]),
    });
    expect(next.offers.map((o) => o.id)).toEqual(["nova-f1", "velha-f2"]);
  });
});
