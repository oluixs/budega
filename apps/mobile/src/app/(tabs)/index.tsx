import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { FileText, Locate, Store } from "lucide-react-native";
import { formatDateBR, type Category, type Flyer, type Market, type Offer } from "@budega/shared";
import { getActiveFlyers, getActiveOffers, getCategories, getFeaturedMarkets, getMarkets } from "@/lib/data";
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
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [marketNames, setMarketNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    (async () => {
      const [featuredMarkets, allMarkets, activeOffers, allCategories, activeFlyers] = await Promise.all([
        getFeaturedMarkets(6),
        getMarkets(),
        getActiveOffers(),
        getCategories(),
        getActiveFlyers(),
      ]);
      const featuredOffers = activeOffers.filter((offer) => offer.is_featured);
      setMarkets(featuredMarkets);
      setOffers(featuredOffers.length ? featuredOffers : activeOffers);
      setCategories(allCategories);
      // Encartes que vencem antes primeiro.
      setFlyers([...activeFlyers].sort((a, b) => a.valid_until.localeCompare(b.valid_until)));
      setMarketNames(new Map(allMarkets.map((market) => [market.id, market.name])));
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
        {geolocation.errorMessage && <Text className="text-sm text-neutral-700">{geolocation.errorMessage}</Text>}
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
        <Text className="text-lg font-semibold text-neutral-900">Encartes da semana</Text>
        <Text className="mb-3 text-sm text-neutral-500">Direto dos sites oficiais dos mercados.</Text>
        {flyers.length === 0 ? (
          <EmptyState icon={FileText} title="Nenhum encarte vigente agora" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {flyers.map((flyer) => (
                <Pressable
                  key={flyer.id}
                  onPress={() => router.push(`/encartes/${flyer.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Encarte ${flyer.title}`}
                  className="w-40 overflow-hidden rounded-xl border border-neutral-300 bg-white"
                >
                  {flyer.cover_url ? (
                    <Image source={{ uri: flyer.cover_url }} className="h-52 w-40 bg-neutral-100" resizeMode="cover" />
                  ) : (
                    <View className="h-52 w-40 items-center justify-center bg-neutral-100">
                      <FileText size={32} color="#175C3A" />
                    </View>
                  )}
                  <View className="gap-1 p-2">
                    <Text className="text-xs font-medium text-brand-600">{marketNames.get(flyer.market_id)}</Text>
                    <Text numberOfLines={2} className="text-sm font-semibold text-neutral-900">
                      {flyer.title}
                    </Text>
                    <Text className="text-xs text-neutral-500">Até {formatDateBR(flyer.valid_until)}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      <View>
        <Text className="mb-3 text-lg font-semibold text-neutral-900">
          {markets.some((market) => market.is_featured) ? "Mercados em destaque" : "Mercados da região"}
        </Text>
        {markets.length === 0 ? (
          <EmptyState icon={Store} title="Nenhum mercado cadastrado ainda" />
        ) : (
          markets.map((market) => <MarketCard key={market.id} market={{ ...market, distance_km: null }} />)
        )}
      </View>

      {offers.length > 0 && (
        <View>
          <Text className="mb-3 text-lg font-semibold text-neutral-900">Ofertas da semana</Text>
          {offers.slice(0, 6).map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
