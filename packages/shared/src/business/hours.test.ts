import { describe, expect, it } from "vitest";
import { isOpenNow, isUpdatedRecently } from "./hours";
import type { OpeningHours } from "../types/index";

function hoursFor(day: number, opensAt: string, closesAt: string): OpeningHours[] {
  return [{ day, opens_at: opensAt, closes_at: closesAt, closed: false }];
}

describe("isOpenNow", () => {
  it("está aberto quando o horário atual está dentro do intervalo do dia", () => {
    const now = new Date("2026-06-15T14:30:00"); // segunda-feira, horário local
    expect(isOpenNow(hoursFor(now.getDay(), "08:00", "18:00"), now)).toBe(true);
  });

  it("está fechado fora do intervalo", () => {
    const now = new Date("2026-06-15T20:00:00");
    expect(isOpenNow(hoursFor(now.getDay(), "08:00", "18:00"), now)).toBe(false);
  });

  it("está fechado quando o dia está marcado como closed", () => {
    const now = new Date("2026-06-15T10:00:00");
    const hours: OpeningHours[] = [{ day: now.getDay(), opens_at: null, closes_at: null, closed: true }];
    expect(isOpenNow(hours, now)).toBe(false);
  });

  it("está fechado quando não há entrada para o dia atual", () => {
    const now = new Date("2026-06-15T10:00:00");
    expect(isOpenNow([], now)).toBe(false);
  });
});

describe("isUpdatedRecently", () => {
  const now = new Date("2026-06-30T00:00:00Z");

  it("é true para uma atualização de 5 dias atrás (limiar padrão de 30 dias)", () => {
    expect(isUpdatedRecently("2026-06-25T00:00:00Z", now)).toBe(true);
  });

  it("é false para uma atualização de 40 dias atrás", () => {
    expect(isUpdatedRecently("2026-05-21T00:00:00Z", now)).toBe(false);
  });
});
