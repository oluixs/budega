import type { Metadata } from "next";
import { AlertCircle, Flag, Store, Tag } from "lucide-react";
import { getDashboardStats } from "@/lib/admin-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard administrativo" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Mercados ativos", value: stats.activeMarkets, icon: Store },
    { label: "Ofertas ativas", value: stats.activeOffers, icon: Tag },
    { label: "Encartes vigentes", value: stats.activeFlyers, icon: Tag },
    { label: "Denúncias pendentes", value: stats.pendingReports, icon: Flag },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-h1 font-bold text-neutral-900">Dashboard</h1>
        <p className="text-body text-neutral-500">Visão geral do Budega.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-body text-neutral-500">
                {card.label}
                <card.icon className="h-4 w-4" aria-hidden="true" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-h1 font-bold text-neutral-900">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(stats.expiringOffers > 0 || stats.expiringFlyers > 0) && (
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-900">
              <AlertCircle className="h-4 w-4 text-warning" /> Conteúdo vencendo em breve
            </CardTitle>
          </CardHeader>
          <CardContent className="text-body text-neutral-700">
            {stats.expiringOffers > 0 && <p>{stats.expiringOffers} oferta(s) vencem nos próximos 3 dias.</p>}
            {stats.expiringFlyers > 0 && <p>{stats.expiringFlyers} encarte(s) vencem nos próximos 3 dias.</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-neutral-900">Métricas de engajamento</CardTitle>
        </CardHeader>
        <CardContent className="text-body text-neutral-500">
          Visualizações, cliques em rota e cliques em telefone/WhatsApp dependem da
          tabela <code className="rounded bg-neutral-100 px-1">analytics_events</code> em
          um Supabase real — configure as credenciais para ver os números aqui.
        </CardContent>
      </Card>
    </div>
  );
}
