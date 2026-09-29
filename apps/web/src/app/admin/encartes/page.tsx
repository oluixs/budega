import type { Metadata } from "next";
import { getAllFlyersAdmin, getAllMarketsAdmin } from "@/lib/admin-data";
import { FlyersTable } from "@/components/admin/flyers-table";

export const metadata: Metadata = { title: "Encartes — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminFlyersPage() {
  const [flyers, markets] = await Promise.all([getAllFlyersAdmin(), getAllMarketsAdmin()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-h1 font-bold text-neutral-900">Encartes</h1>
        <p className="text-body text-neutral-500">
          Publique, pause ou arquive encartes em PDF ou imagem.
        </p>
      </div>
      <FlyersTable flyers={flyers} markets={markets} />
    </div>
  );
}
