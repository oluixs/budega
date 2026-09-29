import { createCn } from "cn/config";

/**
 * Junta classes Tailwind resolvendo conflitos. Precisa conhecer a escala tipográfica
 * própria (globals.css > --text-*): sem isso, `text-body` era tratado como **cor** e
 * `cn("text-body", "text-neutral-500")` descartava o tamanho.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "h1", "h2", "h3", "body-lg", "body", "caption"] }],
    },
  },
});

/**
 * Destino pós-login vindo da URL (`?next=`). Aceita só caminhos internos: "//site.com"
 * ou "https://..." virariam um redirecionamento aberto para fora do Budega.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
