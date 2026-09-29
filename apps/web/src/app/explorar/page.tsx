import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import {
  buildExternalRouteUrl,
  isOpenNow,
  isUpdatedRecently,
  matchesMarketQuery,
  sortMarkets,
  withDistance,
  type MarketSortOrder,
} from "@budega/shared";
import { REGION } from "@budega/sources";
import { getActiveOffers, getAllBranches, getCategories, getMarkets } from "@/lib/data";
import { MarketsMap, type MapPoint } from "@/components/map/markets-map";
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
  const [markets, categories, offers, branches] = await Promise.all([
    getMarkets(),
    getCategories(),
    getActiveOffers(),
    getAllBranches(),
  ]);

  const origin =
    params.lat && params.lng
      ? { latitude: Number(params.lat), longitude: Number(params.lng) }
      : null;

  // Distância até a loja mais próxima de cada rede; a busca também olha os bairros das lojas.
  let results = withDistance(markets, origin, branches);

  if (params.q) {
    const query = params.q;
    results = results.filter((market) => matchesMarketQuery(market, branches, query));
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
    results = results.filter((market) => isUpdatedRecently(market.updated_at));
  }

  const sortOrder: MarketSortOrder = params.ordenar === "relevance" ? "relevance" : "distance";
  results = sortMarkets(results, sortOrder);

  const view = params.view === "mapa" ? "mapa" : "lista";

  // No mapa, cada loja é um ponto (mercado sem filiais cadastradas = o endereço dele).
  const mapPoints: MapPoint[] = results.flatMap((market) => {
    const places = branches.filter((branch) => branch.market_id === market.id);
    const locations = places.length ? places : [market];
    return locations.map((place) => ({
      id: `${market.id}:${place.id}`,
      latitude: place.latitude,
      longitude: place.longitude,
      title: place === market ? market.name : place.name,
      subtitle: [place.address, place.neighborhood].filter(Boolean).join(" — "),
      href: `/mercados/${market.slug}`,
      routeUrl: buildExternalRouteUrl(place.latitude, place.longitude),
    }));
  });

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
        <div className="flex flex-col gap-6">
          <MarketsMap
            points={mapPoints}
            userLocation={origin}
            fallbackCenter={REGION.center}
            label="Mapa com as lojas dos mercados encontrados"
            className="h-[420px] sm:h-[520px]"
          />
          {/* A mesma informação em lista, para quem não usa o mapa. */}
          <MapFallback markets={results} />
        </div>
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
