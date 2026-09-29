import type { OpeningHours } from "../types/index";

/** Verifica se um mercado/filial está aberto agora, a partir de opening_hours. */
export function isOpenNow(openingHours: OpeningHours[], now: Date = new Date()): boolean {
  const today = openingHours.find((entry) => entry.day === now.getDay());
  if (!today || today.closed || !today.opens_at || !today.closes_at) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMinute] = today.opens_at.split(":").map(Number);
  const [closeHour, closeMinute] = today.closes_at.split(":").map(Number);
  const opensAtMinutes = (openHour ?? 0) * 60 + (openMinute ?? 0);
  const closesAtMinutes = (closeHour ?? 0) * 60 + (closeMinute ?? 0);

  return currentMinutes >= opensAtMinutes && currentMinutes <= closesAtMinutes;
}

const WEEKDAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function formatOpeningHoursToday(openingHours: OpeningHours[], now: Date = new Date()): string {
  const today = openingHours.find((entry) => entry.day === now.getDay());
  if (!today || today.closed || !today.opens_at || !today.closes_at) return "Fechado hoje";
  return `Aberto hoje das ${today.opens_at} às ${today.closes_at}`;
}

export function weekdayLabel(day: number): string {
  return WEEKDAY_LABELS[day] ?? "";
}

/** Usado no filtro "Atualizado recentemente" de /explorar. */
export function isUpdatedRecently(updatedAt: string, now: Date = new Date(), thresholdDays = 30): boolean {
  const updatedAtMs = new Date(updatedAt).getTime();
  const thresholdMs = now.getTime() - thresholdDays * 24 * 60 * 60 * 1000;
  return updatedAtMs >= thresholdMs;
}

/**
 * Monta opening_hours para os 7 dias com o mesmo horário, marcando `closedDays`
 * (0 = domingo ... 6 = sábado) como fechados. Usado no cadastro de filiais do admin.
 */
export function weeklyHours(opensAt: string, closesAt: string, closedDays: number[] = []): OpeningHours[] {
  return Array.from({ length: 7 }, (_, day) => {
    const closed = closedDays.includes(day);
    return {
      day,
      opens_at: closed ? null : opensAt,
      closes_at: closed ? null : closesAt,
      closed,
    };
  });
}
