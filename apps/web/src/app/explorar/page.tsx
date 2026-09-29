import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import {
  isOpenNow,
  sortMarkets,
  withDistance,
  type MarketSortOrder,
} from "@budega/shared";
import { getActiveOffers, getCategories, getMarkets } from "@/lib/data";
import { FiltersBar } from "@/components/explore/filters-bar";
import { ViewToggle } from "@/components/explore/view-toggle";
import { MapFallback } from "@/components/explore/map-fallback";
import { MarketCard } from "@/components/market/market-card";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Explorar mercados",
};

interface ExplorarPageProps {
  searchParams: Promise<{
    q?: string;
    lat?: string;
    lng?: string;
    categoria?: string;
    distancia?: string;
    abertoAgora?: string;
    atualizado?: string;
    ordenar?: string;
    view?: string;
  }>;
}

export default async function ExplorarPage({ searchParams }: ExplorarPageProps) {
  const params = await searchParams;
  const [markets, categories, offers] = await Promise.all([
    getMarkets(),
    getCategories(),
    getActiveOffers(),
  ]);

  const origin =
    params.lat && params.lng
      ? { latitude: Number(params.lat), longitude: Number(params.lng) }
      : null;

  let results = withDistance(markets, origin);

  if (params.q) {
    const query = params.q.toLowerCase();
    results = results.filter((market) =>
      [market.name, market.neighborhood, market.city, market.address]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }

  if (params.categoria) {
    const marketIdsWithCategory = new Set(
      offers
        .filter((offer) => {
          const category = categories.find((item) => item.slug === params.categoria);
          return category && offer.category_id === category.id;
        })
        .map((offer) => offer.market_id),
    );
    results = results.filter((market) => marketIdsWithCategory.has(market.id));
  }

  if (params.distancia && origin) {
    const maxKm = Number(params.distancia);
    results = results.filter((market) => market.distance_km !== null && market.distance_km <= maxKm);
  }

  if (params.abertoAgora === "true") {
    results = results.filter((market) => isOpenNow(market.opening_hours));
  }

  if (params.atualizado === "true") {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    results = results.filter((market) => new Date(market.updated_at).getTime() >= thirtyDaysAgo);
  }

  const sortOrder: MarketSortOrder = params.ordenar === "relevance" ? "relevance" : "distance";
  results = sortMarkets(results, sortOrder);

  const view = params.view === "mapa" ? "mapa" : "lista";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="font-display text-h1 font-bold text-neutral-900">Explorar mercados</h1>
        <p className="text-body-lg text-neutral-500">
          {origin
            ? `${results.length} mercado(s) encontrados perto de você.`
            : "Use sua localização ou digite um endereço para ver a distância até cada mercado."}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <FiltersBar categories={categories} />
        <ViewToggle />
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nenhum mercado encontrado"
          description="Tente ajustar os filtros ou aumentar a distância de busca."
        />
      ) : view === "mapa" ? (
        // Integração real com Google Maps ainda não implementada nesta sessão (ver
        // README > Limitações conhecidas) — o fallback funcional cobre o requisito do
        // brief mesmo quando NEXT_PUBLIC_GOOGLE_MAPS_API_KEY está configurada.
        <MapFallback markets={results} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </div>
  );
}
