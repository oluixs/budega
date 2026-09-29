import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Share, Text, View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { Navigation, Store, Tag } from "lucide-react-native";
import { buildExternalRouteUrl, buildOfferShareUrl, formatDateBR, type Market, type Offer } from "@budega/shared";
import { getMarketById, getOfferById } from "@/lib/data";
import { PriceTag } from "@/components/price-tag";
import { FavoriteButton } from "@/components/favorite-button";
import { EmptyState } from "@/components/empty-state";

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [market, setMarket] = useState<Market | null>(null);

  useEffect(() => {
    (async () => {
      const found = await getOfferById(id);
      setOffer(found);
      if (found) setMarket(await getMarketById(found.market_id));
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator color="#1F7A4D" />
      </View>
    );
  }

  if (!offer) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 p-4">
        <EmptyState icon={Tag} title="Oferta não encontrada" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="pb-10">
      <View className="h-48 items-center justify-center bg-neutral-100">
        <Tag size={48} color="#706A5F" />
      </View>
      <View className="gap-4 p-4">
        <View className="flex-row items-start justify-between gap-2">
          <Text className="flex-1 text-2xl font-bold text-neutral-900">{offer.name}</Text>
          <FavoriteButton offerId={offer.id} />
        </View>

        {market && (
          <Link href={`/mercados/${market.slug}`} asChild>
            <Pressable className="flex-row items-center gap-1">
              <Store size={16} color="#175C3A" />
              <Text className="font-medium text-brand-600">{market.name}</Text>
            </Pressable>
          </Link>
        )}

        <PriceTag promotionalPrice={offer.promotional_price} regularPrice={offer.regular_price} unit={offer.unit} />

        <View className="flex-row gap-6 rounded-lg bg-neutral-100 p-4">
          <View>
            <Text className="text-neutral-500">Válida de</Text>
            <Text className="font-medium text-neutral-900">{formatDateBR(offer.valid_from)}</Text>
          </View>
          <View>
            <Text className="text-neutral-500">Válida até</Text>
            <Text className="font-medium text-neutral-900">{formatDateBR(offer.valid_until)}</Text>
          </View>
        </View>

        {offer.description && <Text className="text-base text-neutral-700">{offer.description}</Text>}
        {offer.conditions && (
          <View className="rounded-lg border border-warning/40 bg-warning/10 p-3">
            <Text className="text-neutral-700">
              <Text className="font-semibold">Condições: </Text>
              {offer.conditions}
            </Text>
          </View>
        )}

        <View className="flex-row flex-wrap gap-2 pt-2">
          <Pressable
            onPress={() => Share.share({ message: offer.name, url: buildOfferShareUrl(offer.id) })}
            className="flex-row items-center gap-2 rounded-full border border-neutral-300 px-4 py-2"
          >
            <Text className="font-medium text-neutral-900">Compartilhar</Text>
          </Pressable>
          {market && (
            <Pressable
              onPress={() => Linking.openURL(buildExternalRouteUrl(market.latitude, market.longitude))}
              className="flex-row items-center gap-2 rounded-full bg-brand-500 px-4 py-2"
            >
              <Navigation size={16} color="#fff" />
              <Text className="font-medium text-white">Rota até o mercado</Text>
            </Pressable>
          )}
        </View>

        <Text className="text-xs text-neutral-500">
          Preço e disponibilidade devem ser confirmados no estabelecimento.
        </Text>
      </View>
    </ScrollView>
  );
}
