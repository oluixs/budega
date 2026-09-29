import { Image, Pressable, Text, View } from "react-native";
import { Link } from "expo-router";
import { BadgeCheck, MapPin, Store } from "lucide-react-native";
import { formatDistance, type MarketWithDistance } from "@budega/shared";

export function MarketCard({ market }: { market: MarketWithDistance }) {
  return (
    <Link href={`/mercados/${market.slug}`} asChild>
      <Pressable className="mb-3 overflow-hidden rounded-xl border border-neutral-300 bg-white">
        <View className="h-24 items-center justify-center bg-brand-50">
          {market.logo_url ? (
            <Image source={{ uri: market.logo_url }} accessibilityLabel={`Logo ${market.name}`} className="h-16 w-32" resizeMode="contain" />
          ) : (
            <Store color="#175C3A" size={32} />
          )}
        </View>
        <View className="gap-2 p-4">
          <View className="flex-row items-start justify-between gap-2">
            <Text className="flex-1 text-lg font-semibold text-neutral-900">{market.name}</Text>
            {market.is_featured && (
              <View className="rounded-full bg-accent-500 px-2 py-0.5">
                <Text className="text-xs font-semibold text-white">Destaque</Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center gap-1">
            <MapPin size={14} color="#706A5F" />
            <Text className="text-neutral-500">
              {market.nearest_branch
                ? `Mais perto: ${market.nearest_branch.name}`
                : [market.neighborhood, market.city].filter(Boolean).join(", ")}
            </Text>
          </View>
          <View className="flex-row items-center justify-between pt-1">
            {/* Sem localização não há distância: omitir em vez de "indisponível". */}
            {market.distance_km !== null ? (
              <Text className="font-medium text-brand-600">{formatDistance(market.distance_km)}</Text>
            ) : (
              <View />
            )}
            {market.is_verified && (
              <View className="flex-row items-center gap-1">
                <BadgeCheck size={14} color="#1F7A4D" />
                <Text className="text-xs font-medium text-neutral-500">Verificado</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
