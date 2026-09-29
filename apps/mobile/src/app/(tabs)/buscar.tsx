import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SearchX } from "lucide-react-native";
import {
  buildExternalRouteUrl,
  isOpenNow,
  matchesMarketQuery,
  regionalSnapshot,
  sortMarkets,
  withDistance,
  type Branch,
  type Coordinates,
  type MarketWithDistance,
} from "@budega/shared";
import { getAllBranches, getMarkets } from "@/lib/data";
import { MarketCard } from "@/components/market-card";
import { EmptyState } from "@/components/empty-state";
import { MarketsMap, type MapPoint } from "@/components/markets-map";

type View_ = "lista" | "mapa";

function Chip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={`min-h-11 justify-center rounded-full border px-4 ${
        active ? "border-brand-500 bg-brand-500" : "border-neutral-300 bg-white"
      }`}
    >
      <Text className={`text-sm font-medium ${active ? "text-white" : "text-neutral-700"}`}>{label}</Text>
    </Pressable>
  );
}

export default function BuscarScreen() {
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();
  const [loading, setLoading] = useState(true);
  const [markets, setMarkets] = useState<MarketWithDistance[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [query, setQuery] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [view, setView] = useState<View_>("lista");

  const origin: Coordinates | null = useMemo(() => {
    if (!params.lat || !params.lng) return null;
    return { latitude: Number(params.lat), longitude: Number(params.lng) };
  }, [params.lat, params.lng]);

  useEffect(() => {
    (async () => {
      const [all, allBranches] = await Promise.all([getMarkets(), getAllBranches()]);
      // Distância até a loja mais próxima de cada rede.
      setMarkets(sortMarkets(withDistance(all, origin, allBranches), origin ? "distance" : "relevance"));
      setBranches(allBranches);
      setLoading(false);
    })();
  }, [origin]);

  // A busca também olha os bairros das lojas ("Aldeota" encontra o Cometa).
  const filtered = markets.filter(
    (market) => matchesMarketQuery(market, branches, query) && (!onlyOpen || isOpenNow(market.opening_hours)),
  );

  const mapPoints: MapPoint[] = useMemo(
    () =>
      filtered.flatMap((market) => {
        const places = branches.filter((branch) => branch.market_id === market.id);
        return (places.length ? places : [market]).map((place) => ({
          id: `${market.id}:${place.id}`,
          latitude: place.latitude,
          longitude: place.longitude,
          title: place.name,
          subtitle: [place.address, place.neighborhood].filter(Boolean).join(" — "),
          href: `/mercados/${market.slug}`,
          routeUrl: buildExternalRouteUrl(place.latitude, place.longitude),
        }));
      }),
    [filtered, branches],
  );

  return (
    <View className="flex-1 bg-neutral-50 pt-14">
      <View className="gap-3 px-4 pb-3">
        <Text className="text-2xl font-bold text-neutral-900">Buscar mercados</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Nome, bairro ou cidade"
          accessibilityLabel="Buscar por nome, bairro ou cidade"
          className="rounded-full border border-neutral-300 bg-white px-4 py-3"
        />
        <View className="flex-row flex-wrap gap-2">
          <Chip label="Aberto agora" active={onlyOpen} onPress={() => setOnlyOpen((value) => !value)} />
          <Chip label="Lista" active={view === "lista"} onPress={() => setView("lista")} />
          <Chip label="Mapa" active={view === "mapa"} onPress={() => setView("mapa")} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator className="mt-10" color="#1F7A4D" />
      ) : (
        <ScrollView className="flex-1 px-4" contentContainerClassName="gap-4 pb-10">
          {filtered.length === 0 ? (
            <EmptyState icon={SearchX} title="Nenhum mercado encontrado" description="Tente outro termo de busca." />
          ) : (
            <>
              {view === "mapa" && (
                <MarketsMap points={mapPoints} userLocation={origin} fallbackCenter={regionalSnapshot.region.center} />
              )}
              {filtered.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
