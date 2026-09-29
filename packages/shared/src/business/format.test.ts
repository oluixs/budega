import { describe, expect, it } from "vitest";
import { formatDateBR, formatRelativeUpdate } from "./format";

describe("formatDateBR", () => {
  // Regressão: sem fuso fixo, um servidor em UTC mostrava o dia seguinte.
  it("usa o horário de Brasília independentemente do fuso de quem renderiza", () => {
    expect(formatDateBR("2026-10-10T02:00:00.000Z")).toBe("09/10/2026"); // 23h do dia 09 em SP
    expect(formatDateBR("2026-10-10T12:00:00.000Z")).toBe("10/10/2026");
  });
});

describe("formatRelativeUpdate", () => {
  const now = new Date("2026-06-30T12:00:00Z");

  it("descreve atualizações recentes de forma relativa", () => {
    expect(formatRelativeUpdate("2026-06-30T11:30:00Z", now)).toBe("há 30 min");
    expect(formatRelativeUpdate("2026-06-29T11:00:00Z", now)).toBe("ontem");
  });
});
