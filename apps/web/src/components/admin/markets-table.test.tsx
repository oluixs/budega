import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { Market } from "@budega/shared";
import { MarketsTable } from "./markets-table";

function buildMarket(overrides: Partial<Market>): Market {
  return {
    id: "mkt-1",
    name: "Mercado Teste",
    slug: "mercado-teste",
    description: null,
    logo_url: null,
    phone: null,
    whatsapp: null,
    address: "Rua A, 1",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    postal_code: "00000-000",
    latitude: -23.5,
    longitude: -46.6,
    opening_hours: [],
    is_verified: false,
    is_featured: false,
    is_suspended: false,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const markets: Market[] = [
  buildMarket({ id: "mkt-1", name: "Bom Preço Pinheiros", neighborhood: "Pinheiros" }),
  buildMarket({ id: "mkt-2", name: "Empório Vila Madalena", neighborhood: "Vila Madalena" }),
];

describe("MarketsTable (admin — filtros e busca)", () => {
  it("lista todos os mercados quando não há busca", () => {
    render(<MarketsTable markets={markets} />);
    expect(screen.getByText("Bom Preço Pinheiros")).toBeInTheDocument();
    expect(screen.getByText("Empório Vila Madalena")).toBeInTheDocument();
  });

  it("filtra por nome ao digitar na busca", async () => {
    const user = userEvent.setup();
    render(<MarketsTable markets={markets} />);

    await user.type(screen.getByPlaceholderText(/buscar por nome/i), "Pinheiros");

    expect(screen.getByText("Bom Preço Pinheiros")).toBeInTheDocument();
    expect(screen.queryByText("Empório Vila Madalena")).not.toBeInTheDocument();
  });

  it("responsável por mercado edita, mas não vê verificar/destacar/suspender", () => {
    render(<MarketsTable markets={markets} />);
    expect(screen.getByRole("button", { name: "Editar Bom Preço Pinheiros" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /suspender/i })).not.toBeInTheDocument();
  });

  it("admin vê as ações de moderação", () => {
    render(<MarketsTable markets={markets} canModerate />);
    expect(screen.getAllByRole("button", { name: /suspender/i })).toHaveLength(markets.length);
  });

  it("mostra estado vazio quando a busca não encontra nada", async () => {
    const user = userEvent.setup();
    render(<MarketsTable markets={markets} />);

    await user.type(screen.getByPlaceholderText(/buscar por nome/i), "mercado que não existe");

    expect(screen.getByText(/nenhum mercado encontrado/i)).toBeInTheDocument();
  });
});
