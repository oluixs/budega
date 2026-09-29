import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Heart } from "lucide-react-native";
import type { Market, Offer } from "@budega/shared";
import { getActiveOffers, getMarkets } from "@/lib/data";
import { useFavorites } from "@/hooks/use-favorites";
import { MarketCard } from "@/components/market-card";
import { OfferCard } from "@/components/offer-card";
import { EmptyState } from "@/components/empty-state";

export default function FavoritosScreen() {
  const { favorites, hydrated } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [allMarkets, setAllMarkets] = useState<Market[]>([]);
  const [allOffers, setAllOffers] = useState<Offer[]>([]);

  useEffect(() => {
    (async () => {
      const [markets, offers] = await Promise.all([getMarkets(), getActiveOffers()]);
      setAllMarkets(markets);
      setAllOffers(offers);
      setLoading(false);
    })();
  }, []);

  if (loading || !hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 pt-14">
        <ActivityIndicator color="#1F7A4D" />
      </View>
    );
  }

  const favoriteMarketIds = new Set(favorites.filter((f) => f.market_id).map((f) => f.market_id));
  const favoriteOfferIds = new Set(favorites.filter((f) => f.offer_id).map((f) => f.offer_id));
  const markets = allMarkets.filter((market) => favoriteMarketIds.has(market.id));
  const offers = allOffers.filter((offer) => favoriteOfferIds.has(offer.id));

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="gap-6 p-4 pb-10 pt-14">
      <Text className="text-2xl font-bold text-neutral-900">Favoritos</Text>

      {markets.length === 0 && offers.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Você ainda não salvou nada"
          description="Favorite mercados e ofertas enquanto explora — fica salvo neste aparelho, sem cadastro."
        />
      ) : (
        <>
          {markets.length > 0 && (
            <View>
              <Text className="mb-3 text-lg font-semibold text-neutral-900">Mercados salvos</Text>
              {markets.map((market) => (
                <MarketCard key={market.id} market={{ ...market, distance_km: null }} />
              ))}
            </View>
          )}
          {offers.length > 0 && (
            <View>
              <Text className="mb-3 text-lg font-semibold text-neutral-900">Ofertas salvas</Text>
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
