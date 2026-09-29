import type { Report } from "../types/index";
import { daysFromNow } from "./dates";

export const mockReports: Report[] = [
  {
    id: "rep-001",
    user_id: null,
    market_id: "mkt-mercadinho-tatuape",
    flyer_id: null,
    offer_id: "off-017",
    reason: "preco_incorreto",
    description: "O preço do refrigerante na loja está R$ 1 mais caro que o anunciado.",
    status: "pending",
    created_at: daysFromNow(-2),
    resolved_at: null,
  },
  {
    id: "rep-002",
    user_id: null,
    market_id: "mkt-mercadao-itaim",
    flyer_id: null,
    offer_id: null,
    reason: "mercado_incorreto",
    description: "O endereço no mapa está desatualizado, a loja mudou de rua.",
    status: "pending",
    created_at: daysFromNow(-1),
    resolved_at: null,
  },
  {
    id: "rep-003",
    user_id: null,
    market_id: "mkt-santana-popular",
    flyer_id: "fly-004",
    offer_id: null,
    reason: "encarte_ilegivel",
    description: null,
    status: "resolved",
    created_at: daysFromNow(-10),
    resolved_at: daysFromNow(-9),
  },
];
