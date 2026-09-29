import { render, screen } from "@testing-library/react";
import { SearchX } from "lucide-react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState (estado sem resultados)", () => {
  it("mostra título e descrição quando não há resultados", () => {
    render(
      <EmptyState
        icon={SearchX}
        title="Nenhum mercado encontrado"
        description="Tente ajustar os filtros."
      />,
    );

    expect(screen.getByText("Nenhum mercado encontrado")).toBeInTheDocument();
    expect(screen.getByText("Tente ajustar os filtros.")).toBeInTheDocument();
  });

  it("funciona sem descrição opcional", () => {
    render(<EmptyState icon={SearchX} title="Vazio" />);
    expect(screen.getByText("Vazio")).toBeInTheDocument();
  });
});
