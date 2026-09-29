import { describe, expect, it } from "vitest";
import type { Branch } from "@budega/shared";
import {
  findRestrictedBranch,
  normalizePhone,
  parseAddress,
  parseCoordinates,
  parseOpeningHours,
  parseValidity,
} from "./parse";

// Textos reais publicados no site do Cometa Supermercados (set/2026).

describe("parseValidity", () => {
  const published = "2026-09-29T03:00:00.000Z";

  it("dd/mm a dd/mm", () => {
    expect(parseValidity("Ofertas válidas de 29/09 a 05/10 somente para a loja Montese.", published)).toEqual({
      valid_from: "2026-09-29T03:00:00.000Z", // 00:00 em Brasília
      valid_until: "2026-10-06T02:59:59.000Z", // 23:59:59 em Brasília
    });
  });

  it("dd a dd/mm (mesmo mês)", () => {
    expect(parseValidity("Ofertas válidas de 27 a 29/09 em todas as lojas", "2026-09-27T03:00:00.000Z")).toEqual({
      valid_from: "2026-09-27T03:00:00.000Z",
      valid_until: "2026-09-30T02:59:59.000Z",
    });
  });

  it("mês por extenso", () => {
    expect(parseValidity("Válido de 16 a 30 de setembro", published)?.valid_until).toBe("2026-10-01T02:59:59.000Z");
  });

  it("período que cruza o ano", () => {
    expect(parseValidity("de 28/12 a 03/01", "2026-12-27T12:00:00Z")).toEqual({
      valid_from: "2026-12-28T03:00:00.000Z",
      valid_until: "2027-01-04T02:59:59.000Z",
    });
    // Publicado já em janeiro: o início é do ano anterior.
    expect(parseValidity("de 28/12 a 03/01", "2027-01-02T12:00:00Z")?.valid_from).toBe("2026-12-28T03:00:00.000Z");
  });

  it("formatos com ponto da Frangolândia", () => {
    expect(parseValidity("De 28.09 a 04.10.2026", "2026-09-27T17:00:48Z")).toEqual({
      valid_from: "2026-09-28T03:00:00.000Z",
      valid_until: "2026-10-05T02:59:59.000Z",
    });
    expect(parseValidity("26 a 29.09 de 2026", "2026-09-26T15:00:22Z")).toEqual({
      valid_from: "2026-09-26T03:00:00.000Z",
      valid_until: "2026-09-30T02:59:59.000Z",
    });
    expect(parseValidity("De 28.12 a 03.01.2027", "2026-12-27T12:00:00Z")?.valid_from).toBe("2026-12-28T03:00:00.000Z");
  });

  it("texto sem período → null", () => {
    expect(parseValidity("Ofertas imperdíveis!", published)).toBeNull();
    expect(parseValidity("de 31/02 a 05/03", published)).toBeNull(); // 31 de fevereiro não existe
    expect(parseValidity("de 10/13 a 12/13", published)).toBeNull();
  });
});

describe("parseOpeningHours", () => {
  it("Diariamente, fechando à meia-noite", () => {
    const hours = parseOpeningHours("Diariamente das 06h às 00h");
    expect(hours).toHaveLength(7);
    expect(hours.every((h) => h.opens_at === "06:00" && h.closes_at === "23:59" && !h.closed)).toBe(true);
  });

  it("Segunda a sábado • Domingo", () => {
    const hours = parseOpeningHours("Segunda a sábado das 7h às 22h • Domingo das 7h às 18h");
    expect(hours[0]).toEqual({ day: 0, opens_at: "07:00", closes_at: "18:00", closed: false });
    expect(hours[6]).toEqual({ day: 6, opens_at: "07:00", closes_at: "22:00", closed: false });
  });

  it("minutos na abertura (6h45)", () => {
    expect(parseOpeningHours("Diariamente das 6h45 às 22h")[3]).toEqual({
      day: 3, opens_at: "06:45", closes_at: "22:00", closed: false,
    });
  });

  it("formato da Frangolândia (dias abreviados, HH:MM, fechado)", () => {
    const hours = parseOpeningHours("Seg à Sab: 06:00 às 00:00 Domingos e Feriados: 06:00 às 22:00");
    expect(hours[1]).toEqual({ day: 1, opens_at: "06:00", closes_at: "23:59", closed: false });
    expect(hours[6]!.closes_at).toBe("23:59");
    expect(hours[0]).toEqual({ day: 0, opens_at: "06:00", closes_at: "22:00", closed: false });

    const office = parseOpeningHours("SEG À SAB: 08:00 ÀS 17:00 DOMINGOS E FERIADOS: FECHADO");
    expect(office[0]).toEqual({ day: 0, opens_at: null, closes_at: null, closed: true });
    expect(office[3]!.opens_at).toBe("08:00");
  });

  it("dias não citados ficam fechados; texto ilegível → []", () => {
    const weekdays = parseOpeningHours("Segunda a sexta das 8h às 18h");
    expect(weekdays[0]!.closed).toBe(true);
    expect(weekdays[6]!.closed).toBe(true);
    expect(weekdays[1]!.closed).toBe(false);
    expect(parseOpeningHours("Consulte a loja")).toEqual([]);
  });
});

describe("parseAddress", () => {
  it("separa endereço e bairro (travessão ou hífen)", () => {
    expect(parseAddress("Rua Ildefonso Albano, 2260 – Aldeota", "Fortaleza")).toEqual({
      address: "Rua Ildefonso Albano, 2260", neighborhood: "Aldeota", city: "Fortaleza",
    });
    expect(parseAddress("Av. Silas Munguba, 4301 -Passaré", "Fortaleza").neighborhood).toBe("Passaré");
  });

  it("cidade da região metropolitana no lugar do bairro", () => {
    expect(parseAddress("Rua Cap. Valdemar de Lima, 140 - Maracanaú", "Fortaleza")).toEqual({
      address: "Rua Cap. Valdemar de Lima, 140", neighborhood: "", city: "Maracanaú",
    });
  });

  it("sem bairro", () => {
    expect(parseAddress("Av. 13 de Maio, 1060", "Fortaleza")).toEqual({
      address: "Av. 13 de Maio, 1060", neighborhood: "", city: "Fortaleza",
    });
  });
});

describe("coordenadas e telefone", () => {
  it("parseCoordinates", () => {
    expect(parseCoordinates("-3.740611194601686, -38.51615591974627")).toEqual({
      latitude: -3.740611194601686, longitude: -38.51615591974627,
    });
    expect(parseCoordinates("0, 0")).toBeNull();
    expect(parseCoordinates("abc")).toBeNull();
  });

  it("normalizePhone", () => {
    expect(normalizePhone("(85) 3262.1710")).toBe("8532621710");
    expect(normalizePhone("(85) 3512 - 1738")).toBe("8535121738");
    expect(normalizePhone("")).toBeNull();
  });
});

describe("findRestrictedBranch", () => {
  const branch = (id: string, name: string, neighborhood: string) => ({ id, name, neighborhood }) as Branch;
  const branches = [
    branch("gomes", "Loja Gomes de Matos", "Montese"),
    branch("kennedy", "Loja Kennedy", "Presidente Kennedy"),
  ];

  it("encarte exclusivo de uma loja → filial", () => {
    expect(findRestrictedBranch("Ofertas válidas de 29/09 a 05/10 somente para a loja Montese.", branches)).toBe("gomes");
    expect(
      findRestrictedBranch("somente na loja Cometa Presentes - Rua Franceses, 350 - Presidente Kennedy.", branches),
    ).toBe("kennedy");
  });

  it("todas as lojas (inclusive 'exceto') ou loja desconhecida → null", () => {
    expect(findRestrictedBranch("em todas as lojas, exceto Osório de Paiva e Gomes de Matos", branches)).toBeNull();
    expect(findRestrictedBranch("somente para a loja Guararapes.", branches)).toBeNull();
  });
});
