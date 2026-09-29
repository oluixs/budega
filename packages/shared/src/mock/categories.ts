import type { Category } from "../types/index.js";

export const mockCategories: Category[] = [
  { id: "cat-alimentos", name: "Alimentos", slug: "alimentos", icon: "package", sort_order: 1, created_at: "2026-01-01T00:00:00.000Z" },
  { id: "cat-bebidas", name: "Bebidas", slug: "bebidas", icon: "cup-soda", sort_order: 2, created_at: "2026-01-01T00:00:00.000Z" },
  { id: "cat-hortifruti", name: "Hortifruti", slug: "hortifruti", icon: "carrot", sort_order: 3, created_at: "2026-01-01T00:00:00.000Z" },
  { id: "cat-carnes", name: "Carnes", slug: "carnes", icon: "beef", sort_order: 4, created_at: "2026-01-01T00:00:00.000Z" },
  { id: "cat-padaria", name: "Padaria", slug: "padaria", icon: "croissant", sort_order: 5, created_at: "2026-01-01T00:00:00.000Z" },
  { id: "cat-higiene-limpeza", name: "Higiene e Limpeza", slug: "higiene-e-limpeza", icon: "sparkles", sort_order: 6, created_at: "2026-01-01T00:00:00.000Z" },
];
