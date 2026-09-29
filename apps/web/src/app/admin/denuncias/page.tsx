import type { Metadata } from "next";
import { getAllMarketsAdmin, getAllReportsAdmin } from "@/lib/admin-data";
import { ReportsTable } from "@/components/admin/reports-table";

export const metadata: Metadata = { title: "Denúncias — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [reports, markets] = await Promise.all([getAllReportsAdmin(), getAllMarketsAdmin()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-h1 font-bold text-neutral-900">Denúncias</h1>
        <p className="text-body text-neutral-500">
          Revise denúncias de preço incorreto, oferta vencida, mercado incorreto,
          conteúdo inadequado ou encarte ilegível.
        </p>
      </div>
      <ReportsTable reports={reports} markets={markets} />
    </div>
  );
}
