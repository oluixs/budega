import { describe, expect, it } from "vitest";
import { buildExternalRouteUrl, buildIssueUrl, buildPlaceRouteUrl, buildWebUrl, buildWhatsAppUrl } from "./links";

describe("links externos", () => {
  // Regressão: o nome da loja ia em destination_place_id, que só aceita Place ID do Google.
  it("rota do Google Maps usa só as coordenadas", () => {
    const url = new URL(buildExternalRouteUrl(-3.7406, -38.5161));
    expect(url.origin + url.pathname).toBe("https://www.google.com/maps/dir/");
    expect(url.searchParams.get("destination")).toBe("-3.7406,-38.5161");
    expect(url.searchParams.has("destination_place_id")).toBe(false);
  });

  it("coordenadas aproximadas → rota pelo endereço em texto", () => {
    const place = { latitude: -3.73, longitude: -38.5, address: "Av. Santos Dumont, 2680", neighborhood: "Aldeota", city: "Fortaleza", state: "CE" };
    expect(new URL(buildPlaceRouteUrl(place)).searchParams.get("destination")).toBe("-3.73,-38.5");
    expect(new URL(buildPlaceRouteUrl({ ...place, coordinates_approximate: true })).searchParams.get("destination")).toBe(
      "Av. Santos Dumont, 2680, Aldeota, Fortaleza - CE",
    );
  });

  it("WhatsApp só com dígitos", () => {
    expect(buildWhatsAppUrl("(85) 99999-0000", "Oi")).toBe("https://wa.me/85999990000?text=Oi");
  });

  it("páginas do site", () => {
    expect(buildWebUrl("/privacidade")).toMatch(/\/privacidade$/);
    expect(buildWebUrl("termos")).toMatch(/\/termos$/);
  });
});

describe("buildIssueUrl", () => {
  it("abre um aviso preenchido no GitHub do projeto", () => {
    const url = new URL(buildIssueUrl({ title: "Correção: Preço incorreto", body: "Página: /ofertas/1" }));
    expect(`${url.origin}${url.pathname}`).toBe("https://github.com/oluixs/budega/issues/new");
    expect(url.searchParams.get("title")).toBe("Correção: Preço incorreto");
    expect(url.searchParams.get("body")).toBe("Página: /ofertas/1");
  });
});
