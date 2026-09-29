import { describe, expect, it } from "vitest";
import { safeNextPath } from "./utils";

describe("safeNextPath (evita redirecionamento aberto após login)", () => {
  it("aceita caminhos internos", () => {
    expect(safeNextPath("/admin")).toBe("/admin");
    expect(safeNextPath("/admin/ofertas?x=1")).toBe("/admin/ofertas?x=1");
  });

  it("recusa URLs externas e caminhos protocol-relative", () => {
    expect(safeNextPath("https://malicioso.com")).toBe("/");
    expect(safeNextPath("//malicioso.com")).toBe("/");
    // Navegadores tratam "/\" como "//": também é um destino externo.
    expect(safeNextPath("/\\malicioso.com")).toBe("/");
  });

  it("usa o fallback quando não há destino", () => {
    expect(safeNextPath(undefined)).toBe("/");
    expect(safeNextPath(null, "/admin")).toBe("/admin");
  });
});
