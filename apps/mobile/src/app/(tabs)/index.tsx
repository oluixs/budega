import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Locate, Sparkles, Store } from "lucide-react-native";
import type { Category, Market, Offer } from "@budega/shared";
import { getActiveOffers, getCategories, getFeaturedMarkets, getMarkets } from "@/lib/data";
import { useGeolocation } from "@/hooks/use-geolocation";
import { MarketCard } from "@/components/market-card";
import { OfferCard } from "@/components/offer-card";
import { EmptyState } from "@/components/empty-state";

export default function ExplorarScreen() {
  const router = useRouter();
  const geolocation = useGeolocation();
  const [loading, setLoading] = useState(true);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    (async () => {
      const [featuredMarkets, allMarkets, featuredOffers, allCategories] = await Promise.all([
        getFeaturedMarkets(6),
        getMarkets(),
        getActiveOffers({ featuredOnly: true }),
        getCategories(),
      ]);
      setMarkets(featuredMarkets.length > 0 ? featuredMarkets : allMarkets.slice(0, 6));
      setOffers(featuredOffers);
      setCategories(allCategories);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (geolocation.status === "success" && geolocation.coordinates) {
      router.push({
        pathname: "/buscar",
        params: { lat: String(geolocation.coordinates.latitude), lng: String(geolocation.coordinates.longitude) },
      });
    }
  }, [geolocation.status, geolocation.coordinates, router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator color="#1F7A4D" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="gap-6 p-4 pb-10 pt-14">
      <View className="gap-2">
        <Text className="text-2xl font-bold text-neutral-900">Perto de você</Text>
        <Text className="text-neutral-500">
          Encontre mercados próximos e as melhores ofertas do seu bairro.
        </Text>
        <Pressable
          onPress={geolocation.request}
          disabled={geolocation.status === "loading"}
          className="mt-2 flex-row items-center justify-center gap-2 self-start rounded-full border border-brand-500 px-4 py-3"
        >
          <Locate size={16} color="#1F7A4D" />
          <Text className="font-medium text-brand-600">
            {geolocation.status === "loading" ? "Localizando..." : "Usar minha localização"}
          </Text>
        </Pressable>
        {geolocation.errorMessage && <Text className="text-sm text-warning">{geolocation.errorMessage}</Text>}
      </View>

      {categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
          <View className="flex-row gap-2">
            {categories.map((category) => (
              <View key={category.id} className="rounded-full border border-neutral-300 bg-white px-4 py-2">
                <Text className="font-medium text-neutral-700">{category.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <View>
        <Text className="mb-3 text-lg font-semibold text-neutral-900">Mercados em destaque</Text>
        {markets.length === 0 ? (
          <EmptyState icon={Store} title="Nenhum mercado cadastrado ainda" />
        ) : (
          markets.map((market) => <MarketCard key={market.id} market={{ ...market, distance_km: null }} />)
        )}
      </View>

      <View>
        <Text className="mb-3 text-lg font-semibold text-neutral-900">Ofertas em destaque</Text>
        {offers.length === 0 ? (
          <EmptyState icon={Sparkles} title="Nenhuma oferta em destaque agora" />
        ) : (
          offers.slice(0, 6).map((offer) => <OfferCard key={offer.id} offer={offer} />)
        )}
      </View>
    </ScrollView>
  );
}
