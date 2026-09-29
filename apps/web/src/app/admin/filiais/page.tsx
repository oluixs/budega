import type { Metadata } from "next";
import { getAllBranchesAdmin, getAllMarketsAdmin } from "@/lib/admin-data";
import { BranchesTable } from "@/components/admin/branches-table";

export const metadata: Metadata = { title: "Filiais — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminBranchesPage() {
  const [branches, markets] = await Promise.all([getAllBranchesAdmin(), getAllMarketsAdmin()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-h1 font-bold text-neutral-900">Filiais</h1>
        <p className="text-body text-neutral-500">
          Cadastre as unidades de cada mercado com endereço, localização e horário. Ofertas e
          encartes podem ser vinculados a uma filial específica.
        </p>
      </div>
      <BranchesTable branches={branches} markets={markets} />
    </div>
  );
}
