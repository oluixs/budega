import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { buildPlaceRouteUrl, regionalSnapshot, type Branch, type Market } from "@budega/shared";
import { getAllBranches, getMarkets } from "@/lib/data";
import { MarketsMap, type MapPoint } from "@/components/markets-map";

/**
 * Mapa geral com todas as lojas cadastradas — sem filtro nem busca (para isso existe a
 * aba Buscar). Centrado em Fortaleza e não encolhe o zoom por causa de uma loja distante
 * (ex.: Sobral, Juazeiro do Norte).
 */
export default function MapaScreen() {
  const [loading, setLoading] = useState(true);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    (async () => {
      const [allMarkets, allBranches] = await Promise.all([getMarkets(), getAllBranches()]);
      setMarkets(allMarkets);
      setBranches(allBranches);
      setLoading(false);
    })();
  }, []);

  const points: MapPoint[] = useMemo(() => {
    const marketById = new Map(markets.map((market) => [market.id, market]));
    const branchMarketIds = new Set(branches.map((branch) => branch.market_id));
    return [
      ...branches.map((branch) => ({
        id: branch.id,
        latitude: branch.latitude,
        longitude: branch.longitude,
        title: `${marketById.get(branch.market_id)?.name ?? branch.name} — ${branch.name}`,
        subtitle: [branch.address, branch.neighborhood].filter(Boolean).join(" — "),
        href: `/mercados/${marketById.get(branch.market_id)?.slug ?? ""}`,
        routeUrl: buildPlaceRouteUrl(branch),
      })),
      ...markets
        .filter((market) => !branchMarketIds.has(market.id))
        .map((market) => ({
          id: market.id,
          latitude: market.latitude,
          longitude: market.longitude,
          title: market.name,
          subtitle: [market.address, market.neighborhood].filter(Boolean).join(" — "),
          href: `/mercados/${market.slug}`,
          routeUrl: buildPlaceRouteUrl(market),
        })),
    ];
  }, [markets, branches]);

  return (
    <View className="flex-1 bg-neutral-50 pt-14">
      <View className="gap-1 px-4 pb-3">
        <Text className="text-2xl font-bold text-neutral-900">Mapa de mercados</Text>
        <Text className="text-sm text-neutral-500">
          {points.length} loja(s) de {markets.length} rede(s) em Fortaleza e região.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator className="mt-10" color="#1F7A4D" />
      ) : (
        <ScrollView className="flex-1 px-4" contentContainerClassName="gap-4 pb-10">
          <MarketsMap
            points={points}
            fallbackCenter={regionalSnapshot.region.center}
            zoom={12}
            fitToPoints={false}
            height={480}
          />
        </ScrollView>
      )}
    </View>
  );
}
