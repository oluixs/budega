export { cn } from "cn"

/**
 * Destino pós-login vindo da URL (`?next=`). Aceita só caminhos internos: "//site.com"
 * ou "https://..." virariam um redirecionamento aberto para fora do Budega.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
