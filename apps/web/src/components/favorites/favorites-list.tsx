"use client";

import { Heart } from "lucide-react";
import type { Market, Offer } from "@budega/shared";
import { useFavorites } from "@/hooks/use-favorites";
import { MarketCard } from "@/components/market/market-card";
import { OfferCard } from "@/components/offer/offer-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

interface FavoritesListProps {
  allMarkets: Market[];
  allOffers: Offer[];
}

export function FavoritesList({ allMarkets, allOffers }: FavoritesListProps) {
  const { favorites, hydrated } = useFavorites();

  if (!hydrated) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  const favoriteMarketIds = new Set(favorites.filter((f) => f.market_id).map((f) => f.market_id));
  const favoriteOfferIds = new Set(favorites.filter((f) => f.offer_id).map((f) => f.offer_id));

  const markets = allMarkets
    .filter((market) => favoriteMarketIds.has(market.id))
    .map((market) => ({ ...market, distance_km: null }));
  const offers = allOffers.filter((offer) => favoriteOfferIds.has(offer.id));

  if (markets.length === 0 && offers.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Você ainda não salvou nada"
        description="Favorite mercados e ofertas enquanto explora — tudo fica salvo neste navegador, sem precisar de cadastro."
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {markets.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-h2 font-semibold text-neutral-900">Mercados salvos</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {markets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </section>
      )}

      {offers.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-h2 font-semibold text-neutral-900">Ofertas salvas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
