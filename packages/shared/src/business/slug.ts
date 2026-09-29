/**
 * Gera o slug usado na URL pública do mercado (/mercados/<slug>) a partir do nome:
 * sem acentos, minúsculo, só letras/números separados por hífen.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
