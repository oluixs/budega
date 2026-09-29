import type { Offer } from "../types/index";
import { daysFromNow } from "./dates";

const createdAt = daysFromNow(-30);

interface RawOffer {
  id: string;
  market_id: string;
  branch_id: string | null;
  category_id: string;
  name: string;
  unit: string;
  promotional_price: number;
  regular_price: number | null;
  validFromDays: number;
  validUntilDays: number;
  is_active: boolean;
  is_featured: boolean;
  conditions?: string;
}

const raw: RawOffer[] = [
  // Bom Preço Pinheiros
  { id: "off-001", market_id: "mkt-bompreco-pinheiros", branch_id: "brh-bompreco-pinheiros-centro", category_id: "cat-hortifruti", name: "Banana Prata", unit: "kg", promotional_price: 3.49, regular_price: 5.99, validFromDays: -3, validUntilDays: 10, is_active: true, is_featured: true },
  { id: "off-002", market_id: "mkt-bompreco-pinheiros", branch_id: "brh-bompreco-pinheiros-centro", category_id: "cat-carnes", name: "Picanha Bovina", unit: "kg", promotional_price: 49.9, regular_price: 69.9, validFromDays: -1, validUntilDays: 6, is_active: true, is_featured: true, conditions: "Limite de 2kg por cliente" },
  { id: "off-003", market_id: "mkt-bompreco-pinheiros", branch_id: "brh-bompreco-pinheiros-farialima", category_id: "cat-bebidas", name: "Suco de Laranja 1L", unit: "un", promotional_price: 6.99, regular_price: 9.49, validFromDays: -5, validUntilDays: 5, is_active: true, is_featured: false },
  { id: "off-004", market_id: "mkt-bompreco-pinheiros", branch_id: "brh-bompreco-pinheiros-centro", category_id: "cat-padaria", name: "Pão Francês", unit: "kg", promotional_price: 12.9, regular_price: 15.9, validFromDays: -2, validUntilDays: 12, is_active: true, is_featured: false },
  { id: "off-005", market_id: "mkt-bompreco-pinheiros", branch_id: "brh-bompreco-pinheiros-farialima", category_id: "cat-higiene-limpeza", name: "Detergente Neutro 500ml", unit: "un", promotional_price: 2.29, regular_price: 3.19, validFromDays: -10, validUntilDays: -1, is_active: true, is_featured: false },

  // Empório Vila Madalena
  { id: "off-006", market_id: "mkt-emporio-vilamadalena", branch_id: "brh-vilamadalena-unica", category_id: "cat-bebidas", name: "Vinho Tinto Reserva", unit: "un", promotional_price: 39.9, regular_price: 59.9, validFromDays: -2, validUntilDays: 15, is_active: true, is_featured: true, conditions: "Válido para maiores de 18 anos" },
  { id: "off-007", market_id: "mkt-emporio-vilamadalena", branch_id: "brh-vilamadalena-unica", category_id: "cat-padaria", name: "Croissant Artesanal", unit: "un", promotional_price: 8.5, regular_price: 11.0, validFromDays: -1, validUntilDays: 8, is_active: true, is_featured: true },
  { id: "off-008", market_id: "mkt-emporio-vilamadalena", branch_id: "brh-vilamadalena-unica", category_id: "cat-alimentos", name: "Azeite Extra Virgem 500ml", unit: "un", promotional_price: 24.9, regular_price: 32.9, validFromDays: -4, validUntilDays: 9, is_active: true, is_featured: false },
  { id: "off-009", market_id: "mkt-emporio-vilamadalena", branch_id: "brh-vilamadalena-unica", category_id: "cat-hortifruti", name: "Mix de Folhas Orgânicas", unit: "pct", promotional_price: 7.9, regular_price: 10.9, validFromDays: -8, validUntilDays: -2, is_active: true, is_featured: false },

  // Moema Fresh
  { id: "off-010", market_id: "mkt-moema-fresh", branch_id: "brh-moema-ibirapuera", category_id: "cat-carnes", name: "Filé de Frango", unit: "kg", promotional_price: 14.9, regular_price: 19.9, validFromDays: -3, validUntilDays: 11, is_active: true, is_featured: true },
  { id: "off-011", market_id: "mkt-moema-fresh", branch_id: "brh-moema-ibirapuera", category_id: "cat-hortifruti", name: "Tomate Italiano", unit: "kg", promotional_price: 4.99, regular_price: 7.49, validFromDays: -2, validUntilDays: 7, is_active: true, is_featured: false },
  { id: "off-012", market_id: "mkt-moema-fresh", branch_id: "brh-moema-santoamaro", category_id: "cat-bebidas", name: "Cerveja Puro Malte 6un", unit: "cx", promotional_price: 22.9, regular_price: 29.9, validFromDays: -1, validUntilDays: 13, is_active: true, is_featured: true },
  { id: "off-013", market_id: "mkt-moema-fresh", branch_id: "brh-moema-santoamaro", category_id: "cat-higiene-limpeza", name: "Sabão em Pó 1,6kg", unit: "un", promotional_price: 18.9, regular_price: 24.9, validFromDays: -6, validUntilDays: 4, is_active: true, is_featured: false },
  { id: "off-014", market_id: "mkt-moema-fresh", branch_id: "brh-moema-ibirapuera", category_id: "cat-alimentos", name: "Arroz Tipo 1 5kg", unit: "un", promotional_price: 21.9, regular_price: 27.9, validFromDays: -3, validUntilDays: 17, is_active: true, is_featured: false },

  // Mercadinho Tatuapé
  { id: "off-015", market_id: "mkt-mercadinho-tatuape", branch_id: "brh-tatuape-unica", category_id: "cat-alimentos", name: "Feijão Carioca 1kg", unit: "un", promotional_price: 6.49, regular_price: 8.99, validFromDays: -2, validUntilDays: 10, is_active: true, is_featured: false },
  { id: "off-016", market_id: "mkt-mercadinho-tatuape", branch_id: "brh-tatuape-unica", category_id: "cat-padaria", name: "Bolo de Fubá", unit: "un", promotional_price: 9.9, regular_price: 13.9, validFromDays: -1, validUntilDays: 5, is_active: true, is_featured: false },
  { id: "off-017", market_id: "mkt-mercadinho-tatuape", branch_id: "brh-tatuape-unica", category_id: "cat-bebidas", name: "Refrigerante 2L", unit: "un", promotional_price: 6.99, regular_price: 8.99, validFromDays: -4, validUntilDays: 6, is_active: true, is_featured: false },
  { id: "off-018", market_id: "mkt-mercadinho-tatuape", branch_id: "brh-tatuape-unica", category_id: "cat-higiene-limpeza", name: "Papel Higiênico 12 rolos", unit: "pct", promotional_price: 16.9, regular_price: 21.9, validFromDays: -12, validUntilDays: -3, is_active: true, is_featured: false },

  // Hortifruti Liberdade
  { id: "off-019", market_id: "mkt-hortifruti-liberdade", branch_id: "brh-liberdade-unica", category_id: "cat-hortifruti", name: "Shimeji Fresco", unit: "pct", promotional_price: 5.9, regular_price: 8.5, validFromDays: -1, validUntilDays: 6, is_active: true, is_featured: true },
  { id: "off-020", market_id: "mkt-hortifruti-liberdade", branch_id: "brh-liberdade-unica", category_id: "cat-hortifruti", name: "Gengibre", unit: "kg", promotional_price: 8.9, regular_price: 12.9, validFromDays: -2, validUntilDays: 9, is_active: true, is_featured: false },
  { id: "off-021", market_id: "mkt-hortifruti-liberdade", branch_id: "brh-liberdade-unica", category_id: "cat-alimentos", name: "Molho Shoyu 500ml", unit: "un", promotional_price: 7.5, regular_price: 9.9, validFromDays: -3, validUntilDays: 14, is_active: true, is_featured: false },

  // Santana Popular
  { id: "off-022", market_id: "mkt-santana-popular", branch_id: "brh-santana-unica", category_id: "cat-carnes", name: "Linguiça Toscana", unit: "kg", promotional_price: 16.9, regular_price: 22.9, validFromDays: -2, validUntilDays: 8, is_active: true, is_featured: true },
  { id: "off-023", market_id: "mkt-santana-popular", branch_id: "brh-santana-unica", category_id: "cat-padaria", name: "Pão de Queijo Congelado 1kg", unit: "un", promotional_price: 15.9, regular_price: 19.9, validFromDays: -1, validUntilDays: 12, is_active: true, is_featured: false },
  { id: "off-024", market_id: "mkt-santana-popular", branch_id: "brh-santana-unica", category_id: "cat-bebidas", name: "Água Mineral 1,5L (fardo c/6)", unit: "cx", promotional_price: 12.9, regular_price: 16.9, validFromDays: -5, validUntilDays: 5, is_active: true, is_featured: false },
  { id: "off-025", market_id: "mkt-santana-popular", branch_id: "brh-santana-unica", category_id: "cat-higiene-limpeza", name: "Amaciante 2L", unit: "un", promotional_price: 13.9, regular_price: 18.9, validFromDays: -15, validUntilDays: -5, is_active: true, is_featured: false },

  // Empório Brooklin
  { id: "off-026", market_id: "mkt-emporio-brooklin", branch_id: "brh-brooklin-unica", category_id: "cat-alimentos", name: "Queijo Brie Importado", unit: "kg", promotional_price: 79.9, regular_price: 99.9, validFromDays: -1, validUntilDays: 9, is_active: true, is_featured: true },
  { id: "off-027", market_id: "mkt-emporio-brooklin", branch_id: "brh-brooklin-unica", category_id: "cat-bebidas", name: "Espumante Brut", unit: "un", promotional_price: 34.9, regular_price: 44.9, validFromDays: -3, validUntilDays: 20, is_active: true, is_featured: true, conditions: "Válido para maiores de 18 anos" },
  { id: "off-028", market_id: "mkt-emporio-brooklin", branch_id: "brh-brooklin-unica", category_id: "cat-padaria", name: "Pão Australiano", unit: "un", promotional_price: 11.9, regular_price: 15.9, validFromDays: -2, validUntilDays: 7, is_active: true, is_featured: false },

  // Mercadão do Itaim
  { id: "off-029", market_id: "mkt-mercadao-itaim", branch_id: "brh-itaim-unica", category_id: "cat-carnes", name: "Costela Bovina", unit: "kg", promotional_price: 26.9, regular_price: 34.9, validFromDays: -2, validUntilDays: 11, is_active: true, is_featured: false },
  { id: "off-030", market_id: "mkt-mercadao-itaim", branch_id: "brh-itaim-unica", category_id: "cat-hortifruti", name: "Abacate", unit: "kg", promotional_price: 5.49, regular_price: 7.99, validFromDays: -1, validUntilDays: 6, is_active: true, is_featured: false },
];

export const mockOffers: Offer[] = raw.map((item) => ({
  id: item.id,
  market_id: item.market_id,
  branch_id: item.branch_id,
  category_id: item.category_id,
  name: item.name,
  description: null,
  image_url: null,
  promotional_price: item.promotional_price,
  regular_price: item.regular_price,
  unit: item.unit,
  conditions: item.conditions ?? "Preço válido enquanto durarem os estoques.",
  valid_from: daysFromNow(item.validFromDays),
  valid_until: daysFromNow(item.validUntilDays),
  is_active: item.is_active,
  is_featured: item.is_featured,
  created_at: createdAt,
  updated_at: createdAt,
}));
