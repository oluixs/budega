import { describe, expect, it } from "vitest";
import { buildExternalRouteUrl, buildWebUrl, buildWhatsAppUrl } from "./links";

describe("links externos", () => {
  // Regressão: o nome da loja ia em destination_place_id, que só aceita Place ID do Google.
  it("rota do Google Maps usa só as coordenadas", () => {
    const url = new URL(buildExternalRouteUrl(-3.7406, -38.5161));
    expect(url.origin + url.pathname).toBe("https://www.google.com/maps/dir/");
    expect(url.searchParams.get("destination")).toBe("-3.7406,-38.5161");
    expect(url.searchParams.has("destination_place_id")).toBe(false);
  });

  it("WhatsApp só com dígitos", () => {
    expect(buildWhatsAppUrl("(85) 99999-0000", "Oi")).toBe("https://wa.me/85999990000?text=Oi");
  });

  it("páginas do site", () => {
    expect(buildWebUrl("/privacidade")).toMatch(/\/privacidade$/);
    expect(buildWebUrl("termos")).toMatch(/\/termos$/);
  });
});
