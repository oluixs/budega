import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Share, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FileText, Navigation, Phone, Store } from "lucide-react-native";
import {
  buildExternalRouteUrl,
  buildMarketShareUrl,
  buildWhatsAppUrl,
  formatRelativeUpdate,
  isOpenNow,
  type Flyer,
  type Market,
  type Offer,
} from "@budega/shared";
import { getActiveFlyers, getActiveOffers, getMarketBySlug } from "@/lib/data";
import { FavoriteButton } from "@/components/favorite-button";
import { OfferCard } from "@/components/offer-card";
import { EmptyState } from "@/components/empty-state";
import { ReportModal } from "@/components/report-modal";

export default function MarketDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState<Market | null>(null);
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    (async () => {
      const found = await getMarketBySlug(slug);
      if (!found) {
        setLoading(false);
        return;
      }
      const [marketFlyers, marketOffers] = await Promise.all([
        getActiveFlyers(found.id),
        getActiveOffers({ marketId: found.id }),
      ]);
      setMarket(found);
      setFlyers(marketFlyers);
      setOffers(marketOffers);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator color="#1F7A4D" />
      </View>
    );
  }

  if (!market) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 p-4">
        <EmptyState icon={Store} title="Mercado não encontrado" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="gap-6 p-4 pb-10">
      <View className="gap-2 rounded-xl border border-neutral-300 bg-white p-4">
        <View className="flex-row items-start justify-between">
          <Text className="flex-1 text-2xl font-bold text-neutral-900">{market.name}</Text>
          <FavoriteButton marketId={market.id} />
        </View>
        <Text className="text-neutral-500">
          {market.address}, {market.neighborhood} — {market.city}/{market.state}
        </Text>
        <Text className="text-sm text-neutral-500">Atualizado {formatRelativeUpdate(market.updated_at)}</Text>
        <Text className="font-medium text-brand-600">
          {isOpenNow(market.opening_hours) ? "Aberto agora" : "Fechado agora"}
        </Text>

        <View className="mt-2 flex-row flex-wrap gap-2">
          <Pressable
            onPress={() => Linking.openURL(buildExternalRouteUrl(market.latitude, market.longitude, market.name))}
            className="flex-row items-center gap-2 rounded-full border border-neutral-300 px-4 py-2"
          >
            <Navigation size={16} color="#124A2F" />
            <Text className="font-medium text-neutral-900">Rota</Text>
          </Pressable>
          {market.phone && (
            <Pressable
              onPress={() => Linking.openURL(`tel:${market.phone}`)}
              className="flex-row items-center gap-2 rounded-full border border-neutral-300 px-4 py-2"
            >
              <Phone size={16} color="#124A2F" />
              <Text className="font-medium text-neutral-900">Ligar</Text>
            </Pressable>
          )}
          {market.whatsapp && (
            <Pressable
              onPress={() => Linking.openURL(buildWhatsAppUrl(market.whatsapp!))}
              className="flex-row items-center gap-2 rounded-full bg-brand-500 px-4 py-2"
            >
              <Text className="font-medium text-white">WhatsApp</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => Share.share({ message: market.name, url: buildMarketShareUrl(market.slug) })}
            className="flex-row items-center gap-2 rounded-full border border-neutral-300 px-4 py-2"
          >
            <Text className="font-medium text-neutral-900">Compartilhar</Text>
          </Pressable>
          <ReportModal marketId={market.id} defaultReason="mercado_incorreto" />
        </View>
      </View>

      {flyers.length > 0 && (
        <View>
          <Text className="mb-3 text-lg font-semibold text-neutral-900">Encarte atual</Text>
          {flyers.map((flyer) => (
            <Pressable
              key={flyer.id}
              onPress={() => router.push(`/encartes/${flyer.id}`)}
              className="mb-2 flex-row items-center gap-3 rounded-xl border border-neutral-300 bg-white p-4"
            >
              <FileText size={28} color="#175C3A" />
              <Text className="flex-1 font-medium text-neutral-900">{flyer.title}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View>
        <Text className="mb-3 text-lg font-semibold text-neutral-900">Ofertas</Text>
        {offers.length === 0 ? (
          <EmptyState icon={Store} title="Nenhuma oferta ativa neste mercado" />
        ) : (
          offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)
        )}
        <Text className="mt-2 text-xs text-neutral-500">
          Preço e disponibilidade devem ser confirmados no estabelecimento.
        </Text>
      </View>
    </ScrollView>
  );
}
