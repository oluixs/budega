import type { Metadata } from "next";
import { getAllMarketsAdmin } from "@/lib/admin-data";
import { requireAdminAccess } from "@/lib/auth";
import { MarketsTable } from "@/components/admin/markets-table";

export const metadata: Metadata = { title: "Mercados — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminMarketsPage() {
  const [markets, access] = await Promise.all([getAllMarketsAdmin(), requireAdminAccess()]);
  const canModerate = access.status === "mock" || access.isAdmin;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-h1 font-bold text-neutral-900">Mercados</h1>
        <p className="text-body text-neutral-500">
          {canModerate
            ? "Cadastre e edite mercados; verifique, destaque ou suspenda. Mercado suspenso some do site e do app, com suas ofertas e encartes."
            : "Cadastre e mantenha atualizados os dados dos seus mercados. Verificação e destaque são feitos pela equipe do Budega."}
        </p>
      </div>
      <MarketsTable markets={markets} canModerate={canModerate} />
    </div>
  );
}
