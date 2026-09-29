import type { AdminUser } from "../types/index";

/** Usuários de demonstração para a tela /admin/usuarios em modo mock. */
export const mockUsers: AdminUser[] = [
  {
    id: "usr-admin-demo",
    name: "Equipe Budega",
    email: "admin@budega.exemplo",
    role: "admin",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "usr-gerente-demo",
    name: "Carla Souza",
    email: "carla@bompreco.exemplo",
    role: "market_manager",
    created_at: "2026-02-10T00:00:00.000Z",
  },
  {
    id: "usr-cliente-demo",
    name: "João Pereira",
    email: "joao@exemplo.com",
    role: "user",
    created_at: "2026-03-05T00:00:00.000Z",
  },
];
