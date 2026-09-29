import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Share, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FileText, Navigation, Phone, Store } from "lucide-react-native";
import {
  buildExternalRouteUrl,
  buildMarketShareUrl,
  buildWhatsAppUrl,
  formatDateBR,
  formatOpeningHoursToday,
  formatRelativeUpdate,
  isOpenNow,
  type Branch,
  type Flyer,
  type Market,
  type Offer,
} from "@budega/shared";
import { getActiveFlyers, getActiveOffers, getBranchesByMarket, getMarketBySlug } from "@/lib/data";
import { MarketsMap } from "@/components/markets-map";
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
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showAllBranches, setShowAllBranches] = useState(false);

  useEffect(() => {
    (async () => {
      const found = await getMarketBySlug(slug);
      if (!found) {
        setLoading(false);
        return;
      }
      const [marketFlyers, marketOffers, marketBranches] = await Promise.all([
        getActiveFlyers(found.id),
        getActiveOffers({ marketId: found.id }),
        getBranchesByMarket(found.id),
      ]);
      setBranches(marketBranches);
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
        {market.description && <Text className="text-base text-neutral-700">{market.description}</Text>}
        <Text className="text-neutral-500">
          {branches.length > 1 ? "Endereço principal: " : ""}
          {[market.address, market.neighborhood].filter(Boolean).join(", ")} — {market.city}/{market.state}
        </Text>
        <Text className="text-sm text-neutral-500">Atualizado {formatRelativeUpdate(market.updated_at)}</Text>
        {branches.length <= 1 && (
          <Text className="font-medium text-brand-600">
            {isOpenNow(market.opening_hours) ? "Aberto agora" : "Fechado agora"}
          </Text>
        )}
        {market.website_url && (
          <Text
            accessibilityRole="link"
            onPress={() => Linking.openURL(market.website_url!)}
            className="text-sm font-medium text-brand-600 underline"
          >
            Informações e encartes do site oficial
          </Text>
        )}

        <View className="mt-2 flex-row flex-wrap gap-2">
          <Pressable
            onPress={() => Linking.openURL(buildExternalRouteUrl(market.latitude, market.longitude))}
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
          <Text className="mb-3 text-lg font-semibold text-neutral-900">
            {flyers.length === 1 ? "Encarte atual" : `Encartes atuais (${flyers.length})`}
          </Text>
          {flyers.map((flyer) => {
            const branchName = branches.find((branch) => branch.id === flyer.branch_id)?.name;
            return (
              <Pressable
                key={flyer.id}
                onPress={() => router.push(`/encartes/${flyer.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Encarte ${flyer.title}`}
                className="mb-3 flex-row gap-3 rounded-xl border border-neutral-300 bg-white p-3"
              >
                {flyer.cover_url ? (
                  <Image source={{ uri: flyer.cover_url }} className="h-28 w-20 rounded-lg bg-neutral-100" resizeMode="cover" />
                ) : (
                  <FileText size={28} color="#175C3A" />
                )}
                <View className="flex-1 gap-1">
                  <Text className="font-semibold text-neutral-900">{flyer.title}</Text>
                  <Text className="text-sm text-neutral-500">
                    {formatDateBR(flyer.valid_from)} até {formatDateBR(flyer.valid_until)}
                  </Text>
                  {branchName ? (
                    <Text className="text-sm font-medium text-neutral-900">Somente na loja {branchName}</Text>
                  ) : flyer.description ? (
                    <Text numberOfLines={2} className="text-xs text-neutral-500">
                      {flyer.description}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {branches.length > 1 && (
        <View className="gap-3">
          <Text className="text-lg font-semibold text-neutral-900">{branches.length} lojas</Text>
          <MarketsMap
            height={300}
            fallbackCenter={market}
            points={branches.map((branch) => ({
              id: branch.id,
              latitude: branch.latitude,
              longitude: branch.longitude,
              title: branch.name,
              subtitle: [branch.address, branch.neighborhood].filter(Boolean).join(" — "),
              routeUrl: buildExternalRouteUrl(branch.latitude, branch.longitude),
            }))}
          />
          {(showAllBranches ? branches : branches.slice(0, 5)).map((branch) => (
            <View key={branch.id} className="gap-1 rounded-xl border border-neutral-300 bg-white p-3">
              <Text className="font-medium text-neutral-900">{branch.name}</Text>
              <Text className="text-sm text-neutral-500">
                {[branch.address, branch.neighborhood, branch.city].filter(Boolean).join(" — ")}
              </Text>
              {branch.opening_hours.length > 0 && (
                <Text className="text-sm text-neutral-700">{formatOpeningHoursToday(branch.opening_hours)}</Text>
              )}
              <View className="mt-1 flex-row gap-4">
                <Text
                  accessibilityRole="link"
                  onPress={() => Linking.openURL(buildExternalRouteUrl(branch.latitude, branch.longitude))}
                  className="py-2 font-medium text-brand-600"
                >
                  Como chegar
                </Text>
                {branch.phone && (
                  <Text
                    accessibilityRole="link"
                    onPress={() => Linking.openURL(`tel:${branch.phone}`)}
                    className="py-2 font-medium text-brand-600"
                  >
                    Ligar
                  </Text>
                )}
              </View>
            </View>
          ))}
          {branches.length > 5 && (
            <Pressable
              onPress={() => setShowAllBranches((value) => !value)}
              accessibilityRole="button"
              className="min-h-11 items-center justify-center rounded-full border border-neutral-300 bg-white"
            >
              <Text className="font-medium text-neutral-900">
                {showAllBranches ? "Mostrar menos" : `Ver todas as ${branches.length} lojas`}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <View>
        <Text className="mb-3 text-lg font-semibold text-neutral-900">Ofertas</Text>
        {offers.length === 0 ? (
          <EmptyState
            icon={Store}
            title={flyers.length ? "Ofertas deste mercado estão nos encartes" : "Nenhuma oferta ativa neste mercado"}
            description={flyers.length ? "Abra um dos encartes acima para ver os produtos e preços da semana." : undefined}
          />
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
