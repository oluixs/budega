import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { buildPlaceRouteUrl } from "@budega/shared";
import { REGION } from "@budega/sources";
import { getAllBranches, getMarkets } from "@/lib/data";
import { MarketsMap, type MapPoint } from "@/components/map/markets-map";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Mapa de mercados",
  description: "Todos os supermercados de Fortaleza e região num só mapa.",
};

export const revalidate = 3600;

/**
 * Mapa geral com todas as lojas cadastradas — um "raio-x" de Fortaleza, sem filtro nem
 * busca (para isso existe /explorar). Centrado na cidade e não encolhe o zoom por causa
 * de uma loja distante (ex.: Sobral, Juazeiro do Norte): quem quiser ver essas, arrasta o
 * mapa ou usa a lista abaixo.
 */
export default async function MapaPage() {
  const [markets, branches] = await Promise.all([getMarkets(), getAllBranches()]);
  const marketById = new Map(markets.map((market) => [market.id, market]));

  // Cada loja é um ponto; mercado sem filial cadastrada usa o endereço do próprio mercado.
  const branchMarketIds = new Set(branches.map((branch) => branch.market_id));
  const marketsWithoutBranches = markets.filter((market) => !branchMarketIds.has(market.id));

  const points: MapPoint[] = [
    ...branches.map((branch) => ({
      id: branch.id,
      latitude: branch.latitude,
      longitude: branch.longitude,
      title: `${marketById.get(branch.market_id)?.name ?? branch.name} — ${branch.name}`,
      subtitle: [branch.address, branch.neighborhood].filter(Boolean).join(" — "),
      href: `/mercados/${marketById.get(branch.market_id)?.slug ?? ""}`,
      routeUrl: buildPlaceRouteUrl(branch),
    })),
    ...marketsWithoutBranches.map((market) => ({
      id: market.id,
      latitude: market.latitude,
      longitude: market.longitude,
      title: market.name,
      subtitle: [market.address, market.neighborhood].filter(Boolean).join(" — "),
      href: `/mercados/${market.slug}`,
      routeUrl: buildPlaceRouteUrl(market),
    })),
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-display text-h1 font-bold text-neutral-900">Mapa de mercados</h1>
        <p className="mt-2 text-body-lg text-neutral-500">
          {points.length} loja(s) de {markets.length} rede(s) em Fortaleza e região, num só mapa.
        </p>
      </div>

      <MarketsMap
        points={points}
        fallbackCenter={REGION.center}
        zoom={12}
        fitToPoints={false}
        label="Mapa com todas as lojas cadastradas no Budega"
        className="h-[480px] sm:h-[620px]"
      />

      <div className="rounded-xl border border-neutral-300 bg-neutral-0 p-6">
        <h2 className="mb-2 flex items-center gap-2 font-display text-h3 font-semibold text-neutral-900">
          <MapPin className="h-5 w-5 text-brand-600" aria-hidden="true" />
          Todas as lojas
        </h2>
        <ul className="divide-y divide-neutral-100">
          {points.map((point) => (
            <li key={point.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="font-medium text-neutral-900">{point.title}</p>
                {point.subtitle && <p className="text-body text-neutral-500">{point.subtitle}</p>}
              </div>
              {point.routeUrl && (
                <Button variant="outline" size="sm" render={<a href={point.routeUrl} target="_blank" rel="noreferrer" />}>
                  Rota
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
