export function formatPriceBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatPercentOff(regularPrice: number, promotionalPrice: number): number {
  if (regularPrice <= 0) return 0;
  const off = ((regularPrice - promotionalPrice) / regularPrice) * 100;
  return Math.round(Math.max(0, off));
}

/**
 * Fuso fixo: sem ele, a data dependia do fuso de quem renderiza — um servidor em UTC
 * mostrava "10/10" onde o navegador mostrava "09/10" (texto errado + erro de hidratação).
 */
export const APP_TIME_ZONE = "America/Sao_Paulo";

export function formatDateBR(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(isoDate));
}

export function formatRelativeUpdate(isoDate: string, now: Date = new Date()): string {
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "agora mesmo";
  if (diffMinutes < 60) return `há ${diffMinutes} min`;
  if (diffHours < 24) return `há ${diffHours} h`;
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;
  return formatDateBR(isoDate);
}
