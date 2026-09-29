import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SearchX } from "lucide-react-native";
import {
  isOpenNow,
  sortMarkets,
  withDistance,
  type Coordinates,
  type MarketWithDistance,
} from "@budega/shared";
import { getMarkets } from "@/lib/data";
import { MarketCard } from "@/components/market-card";
import { EmptyState } from "@/components/empty-state";

export default function BuscarScreen() {
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();
  const [loading, setLoading] = useState(true);
  const [markets, setMarkets] = useState<MarketWithDistance[]>([]);
  const [query, setQuery] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const origin: Coordinates | null = useMemo(() => {
    if (!params.lat || !params.lng) return null;
    return { latitude: Number(params.lat), longitude: Number(params.lng) };
  }, [params.lat, params.lng]);

  useEffect(() => {
    (async () => {
      const all = await getMarkets();
      setMarkets(sortMarkets(withDistance(all, origin), origin ? "distance" : "relevance"));
      setLoading(false);
    })();
  }, [origin]);

  const filtered = markets.filter((market) => {
    const matchesQuery = query.trim()
      ? [market.name, market.neighborhood, market.city].join(" ").toLowerCase().includes(query.toLowerCase())
      : true;
    const matchesOpen = onlyOpen ? isOpenNow(market.opening_hours) : true;
    return matchesQuery && matchesOpen;
  });

  return (
    <View className="flex-1 bg-neutral-50 pt-14">
      <View className="gap-3 px-4 pb-3">
        <Text className="text-2xl font-bold text-neutral-900">Buscar mercados</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Nome, bairro ou cidade"
          className="rounded-full border border-neutral-300 bg-white px-4 py-3"
        />
        <View className="flex-row gap-2">
          <Text
            onPress={() => setOnlyOpen((value) => !value)}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              onlyOpen ? "border-brand-500 bg-brand-500 text-white" : "border-neutral-300 bg-white text-neutral-700"
            }`}
          >
            Aberto agora
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator className="mt-10" color="#1F7A4D" />
      ) : (
        <ScrollView className="flex-1 px-4" contentContainerClassName="pb-10">
          {filtered.length === 0 ? (
            <EmptyState icon={SearchX} title="Nenhum mercado encontrado" description="Tente outro termo de busca." />
          ) : (
            filtered.map((market) => <MarketCard key={market.id} market={market} />)
          )}
        </ScrollView>
      )}
    </View>
  );
}
