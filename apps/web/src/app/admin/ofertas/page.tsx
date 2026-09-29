import type { Metadata } from "next";
import { getAllOffersAdmin, getAllMarketsAdmin } from "@/lib/admin-data";
import { getCategories } from "@/lib/data";
import { OffersTable } from "@/components/admin/offers-table";

export const metadata: Metadata = { title: "Ofertas — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  const [offers, markets, categories] = await Promise.all([
    getAllOffersAdmin(),
    getAllMarketsAdmin(),
    getCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-h1 font-bold text-neutral-900">Ofertas</h1>
        <p className="text-body text-neutral-500">
          Cadastre, destaque, pause ou duplique ofertas. Ofertas sem validade não podem
          ser publicadas.
        </p>
      </div>
      <OffersTable offers={offers} markets={markets} categories={categories} />
    </div>
  );
}
