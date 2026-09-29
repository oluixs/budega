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
