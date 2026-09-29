import { describe, expect, it } from "vitest";
import { cn } from "./utils";

// Regressão: a escala tipográfica própria era tratada como cor e sumia no merge.
describe("cn com a escala tipográfica do Budega", () => {
  it("mantém tamanho e cor juntos", () => {
    expect(cn("text-body", "text-neutral-500")).toBe("text-body text-neutral-500");
    expect(cn("text-h1 font-bold", "text-neutral-900")).toBe("text-h1 font-bold text-neutral-900");
  });

  it("resolve conflito entre dois tamanhos (o último vence)", () => {
    expect(cn("text-body", "text-caption")).toBe("text-caption");
    expect(cn("text-caption", "text-sm")).toBe("text-sm");
  });
});
