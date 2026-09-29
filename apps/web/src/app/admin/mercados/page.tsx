import type { Metadata } from "next";
import { getAllMarketsAdmin } from "@/lib/admin-data";
import { MarketsTable } from "@/components/admin/markets-table";

export const metadata: Metadata = { title: "Mercados — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminMarketsPage() {
  const markets = await getAllMarketsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-h1 font-bold text-neutral-900">Mercados</h1>
        <p className="text-body text-neutral-500">
          Verifique, destaque ou suspenda mercados cadastrados. A criação/edição
          completa de mercados e filiais usa o mesmo formulário (
          <code className="rounded bg-neutral-100 px-1">marketFormSchema</code> /{" "}
          <code className="rounded bg-neutral-100 px-1">branchFormSchema</code> de{" "}
          <code className="rounded bg-neutral-100 px-1">@budega/shared</code>).
        </p>
      </div>
      <MarketsTable markets={markets} />
    </div>
  );
}
