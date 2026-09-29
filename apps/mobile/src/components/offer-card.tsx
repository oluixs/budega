import { Pressable, Text, View } from "react-native";
import { Link } from "expo-router";
import { Tag } from "lucide-react-native";
import { formatDateBR, type Offer } from "@budega/shared";
import { PriceTag } from "@/components/price-tag";
import { FavoriteButton } from "@/components/favorite-button";

export function OfferCard({ offer, marketName }: { offer: Offer; marketName?: string }) {
  return (
    <View className="mb-3 overflow-hidden rounded-xl border border-neutral-300 bg-white">
      <Link href={`/ofertas/${offer.id}`} asChild>
        <Pressable>
          <View className="h-24 items-center justify-center bg-neutral-100">
            <Tag color="#8A8375" size={28} />
          </View>
          <View className="gap-2 p-4">
            <View className="flex-row items-start justify-between gap-2">
              <Text className="flex-1 text-lg font-semibold text-neutral-900">{offer.name}</Text>
              {offer.is_featured && (
                <View className="rounded-full bg-accent-500 px-2 py-0.5">
                  <Text className="text-xs font-semibold text-white">Oferta</Text>
                </View>
              )}
            </View>
            {marketName && <Text className="text-neutral-500">{marketName}</Text>}
            <PriceTag promotionalPrice={offer.promotional_price} regularPrice={offer.regular_price} unit={offer.unit} />
            <Text className="text-xs text-neutral-500">
              Válida até {formatDateBR(offer.valid_until)} · Confirme o preço na loja
            </Text>
          </View>
        </Pressable>
      </Link>
      <View className="absolute right-2 top-2">
        <FavoriteButton offerId={offer.id} />
      </View>
    </View>
  );
}
