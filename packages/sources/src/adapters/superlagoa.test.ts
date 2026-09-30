import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { HttpClient } from "../http";
import { parseStoreDetail, parseStoreList, superlagoaAdapter } from "./superlagoa";

// Fixtures = HTML real de https://www.superlagoa.com.br/{lojas.php,loja.php?id=1} (29/09/2026).
const fixture = (name: string) => fs.readFileSync(path.join(__dirname, "__fixtures__", name), "utf8");
const listHtml = fixture("superlagoa-lojas.html");
const detailHtml = fixture("superlagoa-loja-detalhe.html");

const now = new Date("2026-09-29T15:00:00Z");

describe("Super Lagoa — leitura do HTML", () => {
  it("lê a lista de lojas (id e nome) de /lojas.php", () => {
    const stores = parseStoreList(listHtml);
    expect(stores).toEqual([
      { id: "1", name: "Loja Parangaba" },
      { id: "2", name: "Loja Centro" },
      { id: "3", name: "Loja Juazeiro do Norte" },
      { id: "4", name: "Loja Barra do Ceará" },
      { id: "5", name: "Loja Sobral" },
      { id: "7", name: "Loja North Shopping" },
      { id: "9", name: "Loja Luciano Cavalcante" },
      { id: "10", name: "Loja Cidade 2000" },
    ]);
  });

  it("lê endereço, cidade, CEP, telefone, horário e coordenadas exatas de /loja.php?id=1", () => {
    const detail = parseStoreDetail(detailHtml);
    expect(detail).toEqual({
      address: "Av. Gomes Brasil 201",
      city: "Fortaleza",
      postalCode: "60720-150",
      phone: "(85) 3017-3069",
      hoursText: "SEGUNDA A SÁBADO: 07h00 às 22h00\nDOMINGOS E FERIADOS: 07h00 às 21h00",
      latitude: -3.774064,
      longitude: -38.567685,
    });
  });
});

const detailFor: Record<string, string> = {
  "1": detailHtml,
  // Segunda loja sintética (Juazeiro do Norte) só para testar a agregação de várias
  // lojas em cidades diferentes — o parser já é testado a fundo acima com dado real.
  "3": `<div class="info"><p>Cidade: Juazeiro do Norte - CE<br>CEP: 63010-220<br>Telefone: (88) 3512-4242<br></p></div>
    <div class="endereco-container"><strong>R. Conceição, 498</strong></div>
    <div class="horarios"><p>SEGUNDA A SÁBADO<br>07h00 às 22h00</p></div>
    <input id="localizacao_latitude" value="-7.2033077">
    <input id="localizacao_longitude" value="-39.315461">`,
};

const http: HttpClient = {
  async getText(url) {
    if (url.endsWith("/lojas.php")) return listHtml;
    const id = url.match(/id=(\d+)/)?.[1];
    if (id && detailFor[id]) return detailFor[id]!;
    // Demais lojas da lista real: sem detalhe sintético, tratadas como "sem coordenadas".
    return "<div></div>";
  },
  async getJson() {
    throw new Error("não usado");
  },
  async getBuffer() {
    throw new Error("não usado");
  },
};

describe("superlagoaAdapter", () => {
  it("monta o mercado com as lojas encontradas e nenhum encarte (revista desatualizada)", async () => {
    const result = await superlagoaAdapter.fetch({ http, now, geocode: { async lookup() { return null; } } });

    expect(result.market).toMatchObject({ id: "superlagoa", slug: "super-lagoa", state: "CE", is_verified: false });
    expect(result.branches).toHaveLength(2);
    expect(result.branches.map((b) => b.city)).toEqual(["Fortaleza", "Juazeiro do Norte"]);
    expect(result.branches[0]).toMatchObject({
      id: "superlagoa-1",
      name: "Super Lagoa Parangaba",
      phone: "8530173069",
      latitude: -3.774064,
      longitude: -38.567685,
    });
    expect(result.branches[0]!.opening_hours[1]).toEqual({ day: 1, opens_at: "07:00", closes_at: "22:00", closed: false });
    // 6 das 8 lojas da lista real não tinham detalhe sintético neste teste — viram aviso, não erro.
    expect(result.warnings.filter((w) => /sem coordenadas/.test(w))).toHaveLength(6);
    expect(result.warnings.some((w) => /Revista de Ofertas/.test(w))).toBe(true);
    expect(result.flyers).toEqual([]);
  });
});
