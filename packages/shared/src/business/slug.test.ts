import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("remove acentos e troca espaços/pontuação por hífen", () => {
    expect(slugify("Empório Vila Madalena")).toBe("emporio-vila-madalena");
    expect(slugify("  Mercadinho São João — Centro!  ")).toBe("mercadinho-sao-joao-centro");
  });

  it("devolve string vazia quando não sobra nenhum caractere válido", () => {
    expect(slugify("!!!")).toBe("");
  });
});
