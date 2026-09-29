import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAllMarketsAdmin, getAllUsersAdmin } from "@/lib/admin-data";
import { requireAdminAccess } from "@/lib/auth";
import { UsersTable } from "@/components/admin/users-table";

export const metadata: Metadata = { title: "Usuários — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const access = await requireAdminAccess();
  if (access.status === "granted" && !access.isAdmin) redirect("/admin");

  const [users, markets] = await Promise.all([getAllUsersAdmin(), getAllMarketsAdmin()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-h1 font-bold text-neutral-900">Usuários</h1>
        <p className="text-body text-neutral-500">
          Libere o painel para quem cuida de um mercado: mude a permissão para
          “Responsável por mercado” e atribua os mercados da pessoa. Ela passa a ver e
          editar só esses mercados, com suas filiais, ofertas e encartes.
        </p>
      </div>
      <UsersTable
        users={users}
        markets={markets}
        currentUserId={access.status === "granted" ? access.user.id : null}
      />
    </div>
  );
}
