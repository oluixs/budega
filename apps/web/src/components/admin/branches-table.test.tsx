import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { mock } from "@budega/shared";
import { BranchesTable } from "./branches-table";

// Usa os dados mock reais (IDs legíveis, não UUIDs) — os mesmos que o painel recebe em
// modo demonstração.
const markets = mock.mockMarkets;
const branches = mock.mockBranches;
const firstBranch = branches[0]!;
const marketWithBranch = markets.find((market) => market.id === firstBranch.market_id)!;

describe("BranchesTable (admin — filiais)", () => {
  it("lista todas as filiais com o nome do mercado, não o ID", () => {
    render(<BranchesTable branches={branches} markets={markets} />);

    expect(screen.getAllByRole("row")).toHaveLength(branches.length + 1); // + cabeçalho
    const row = screen.getByText(firstBranch.name).closest("tr")!;
    expect(within(row).getByText(marketWithBranch.name)).toBeInTheDocument();
    expect(screen.queryByText(firstBranch.market_id)).not.toBeInTheDocument();
  });

  it("filtra filiais pelo texto digitado", async () => {
    const user = userEvent.setup();
    render(<BranchesTable branches={branches} markets={markets} />);

    await user.type(screen.getByLabelText(/buscar filial/i), firstBranch.name);

    expect(screen.getByText(firstBranch.name)).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });

  it("mostra estado vazio quando nada corresponde à busca", async () => {
    const user = userEvent.setup();
    render(<BranchesTable branches={branches} markets={markets} />);

    await user.type(screen.getByLabelText(/buscar filial/i), "filial inexistente");

    expect(screen.getByText(/nenhuma filial encontrada/i)).toBeInTheDocument();
  });

  it("o filtro de mercado mostra o rótulo, não o valor cru do Select", () => {
    render(<BranchesTable branches={branches} markets={markets} />);

    const trigger = screen.getByLabelText(/filtrar por mercado/i);
    expect(trigger).toHaveTextContent("Todos os mercados");
    expect(trigger).not.toHaveTextContent(/^all$/);
  });

  it("pede confirmação antes de excluir uma filial", async () => {
    const user = userEvent.setup();
    render(<BranchesTable branches={branches} markets={markets} />);

    await user.click(screen.getByRole("button", { name: `Excluir ${firstBranch.name}` }));

    expect(await screen.findByRole("dialog")).toHaveTextContent(/não pode ser desfeita/i);
  });
});
