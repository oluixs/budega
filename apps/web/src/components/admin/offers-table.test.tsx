import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { Category, Market, Offer } from "@budega/shared";
import { OffersTable } from "./offers-table";

const markets: Market[] = [
  {
    id: "mkt-1",
    name: "Bom Preço Pinheiros",
    slug: "bom-preco-pinheiros",
    description: null,
    logo_url: null,
    phone: null,
    whatsapp: null,
    address: "Rua A, 1",
    neighborhood: "Pinheiros",
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
  },
];

const categories: Category[] = [
  { id: "cat-1", name: "Hortifruti", slug: "hortifruti", icon: "carrot", sort_order: 1, created_at: "2026-01-01T00:00:00.000Z" },
];

function buildOffer(overrides: Partial<Offer>): Offer {
  return {
    id: "off-1",
    market_id: "mkt-1",
    branch_id: null,
    category_id: "cat-1",
    name: "Banana Prata",
    description: null,
    image_url: null,
    promotional_price: 3.49,
    regular_price: 5.99,
    unit: "kg",
    conditions: null,
    valid_from: "2026-01-01T00:00:00.000Z",
    valid_until: "2026-12-31T00:00:00.000Z",
    is_active: true,
    is_featured: false,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const offers: Offer[] = [
  buildOffer({ id: "off-1", name: "Banana Prata" }),
  buildOffer({ id: "off-2", name: "Picanha Bovina" }),
];

describe("OffersTable (admin — filtros por nome e estado vazio)", () => {
  it("lista todas as ofertas sem filtro", () => {
    render(<OffersTable offers={offers} markets={markets} categories={categories} />);
    expect(screen.getByText("Banana Prata")).toBeInTheDocument();
    expect(screen.getByText("Picanha Bovina")).toBeInTheDocument();
  });

  it("filtra ofertas pelo nome digitado", async () => {
    const user = userEvent.setup();
    render(<OffersTable offers={offers} markets={markets} categories={categories} />);

    await user.type(screen.getByPlaceholderText(/buscar oferta por nome/i), "Picanha");

    expect(screen.getByText("Picanha Bovina")).toBeInTheDocument();
    expect(screen.queryByText("Banana Prata")).not.toBeInTheDocument();
  });

  it("mostra estado vazio quando nenhuma oferta corresponde à busca", async () => {
    const user = userEvent.setup();
    render(<OffersTable offers={offers} markets={markets} categories={categories} />);

    await user.type(screen.getByPlaceholderText(/buscar oferta por nome/i), "produto inexistente");

    expect(screen.getByText(/nenhuma oferta encontrada/i)).toBeInTheDocument();
  });
});
