import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { mock } from "@budega/shared";
import { UsersTable } from "./users-table";

const users = mock.mockUsers;
const admin = users.find((user) => user.role === "admin")!;
const manager = users.find((user) => user.role === "market_manager")!;
const customer = users.find((user) => user.role === "user")!;
const markets = mock.mockMarkets.map((market, index) => (index === 0 ? { ...market, owner_id: manager.id } : market));

describe("UsersTable (admin — usuários)", () => {
  it("mostra a permissão pelo nome e trava a própria conta", () => {
    render(<UsersTable users={users} markets={markets} currentUserId={admin.id} />);

    const own = screen.getByLabelText(`Permissão de ${admin.name}`);
    expect(own).toHaveTextContent("Administrador");
    expect(own).toHaveAttribute("data-disabled");
    expect(screen.getByLabelText(`Permissão de ${manager.name}`)).not.toHaveAttribute("data-disabled");
  });

  it("lista os mercados do responsável e só oferece atribuição para quem pode ter mercado", () => {
    render(<UsersTable users={users} markets={markets} currentUserId={admin.id} />);

    expect(screen.getByRole("button", { name: `Remover ${manager.name} de ${markets[0]!.name}` })).toBeInTheDocument();
    expect(screen.getByLabelText(`Atribuir mercado a ${manager.name}`)).toBeInTheDocument();
    expect(screen.queryByLabelText(`Atribuir mercado a ${customer.name}`)).not.toBeInTheDocument();
  });

  it("busca por e-mail", async () => {
    const user = userEvent.setup();
    render(<UsersTable users={users} markets={markets} currentUserId={admin.id} />);

    await user.type(screen.getByLabelText(/buscar usuário/i), customer.email);

    expect(screen.getByText(customer.name)).toBeInTheDocument();
    expect(screen.queryByText(manager.name)).not.toBeInTheDocument();
  });
});
