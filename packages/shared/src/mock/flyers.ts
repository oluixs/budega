import type { Flyer, FlyerStatus } from "../types/index.js";
import { daysFromNow } from "./dates.js";

const createdAt = daysFromNow(-20);

interface RawFlyer {
  id: string;
  market_id: string;
  branch_id: string | null;
  title: string;
  validFromDays: number;
  validUntilDays: number;
  status: FlyerStatus;
  color: string;
}

// Encartes reais viriam de upload (PDF/imagem) para o Supabase Storage. Em modo mock,
// usamos imagens placeholder geradas dinamicamente para simular o preview do encarte.
function placeholderFlyerUrl(title: string, color: string): string {
  const text = encodeURIComponent(title);
  return `https://placehold.co/800x1120/${color}/ffffff/png?text=${text}`;
}

const raw: RawFlyer[] = [
  { id: "fly-001", market_id: "mkt-bompreco-pinheiros", branch_id: "brh-bompreco-pinheiros-centro", title: "Ofertas da Semana - Bom Preço Pinheiros", validFromDays: -3, validUntilDays: 4, status: "active", color: "1F7A4D" },
  { id: "fly-002", market_id: "mkt-emporio-vilamadalena", branch_id: "brh-vilamadalena-unica", title: "Encarte Vinhos & Queijos", validFromDays: -1, validUntilDays: 6, status: "active", color: "175C3A" },
  { id: "fly-003", market_id: "mkt-moema-fresh", branch_id: null, title: "Encarte Moema Fresh - Todas as Lojas", validFromDays: -5, validUntilDays: 2, status: "active", color: "1F7A4D" },
  { id: "fly-004", market_id: "mkt-santana-popular", branch_id: "brh-santana-unica", title: "Encarte Santana Popular - Carnes", validFromDays: -10, validUntilDays: -3, status: "archived", color: "8A8375" },
  { id: "fly-005", market_id: "mkt-emporio-brooklin", branch_id: "brh-brooklin-unica", title: "Encarte Gourmet Brooklin", validFromDays: -15, validUntilDays: -8, status: "archived", color: "8A8375" },
  { id: "fly-006", market_id: "mkt-mercadinho-tatuape", branch_id: "brh-tatuape-unica", title: "Encarte Tatuapé - Mês do Consumidor", validFromDays: -2, validUntilDays: 5, status: "active", color: "1F7A4D" },
  { id: "fly-007", market_id: "mkt-hortifruti-liberdade", branch_id: "brh-liberdade-unica", title: "Encarte Hortifruti - Aguardando publicação", validFromDays: 3, validUntilDays: 10, status: "paused", color: "B8871E" },
  { id: "fly-008", market_id: "mkt-mercadao-itaim", branch_id: "brh-itaim-unica", title: "Encarte Itaim - Rascunho pausado", validFromDays: -4, validUntilDays: 3, status: "paused", color: "B8871E" },
];

export const mockFlyers: Flyer[] = raw.map((item) => ({
  id: item.id,
  market_id: item.market_id,
  branch_id: item.branch_id,
  title: item.title,
  file_url: placeholderFlyerUrl(item.title, item.color),
  file_type: "image",
  valid_from: daysFromNow(item.validFromDays),
  valid_until: daysFromNow(item.validUntilDays),
  is_active: item.status === "active",
  status: item.status,
  created_at: createdAt,
  updated_at: createdAt,
}));
