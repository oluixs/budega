import { Text, View } from "react-native";
import { formatPercentOff, formatPriceBRL } from "@budega/shared";

interface PriceTagProps {
  promotionalPrice: number;
  regularPrice?: number | null;
  unit?: string;
}

export function PriceTag({ promotionalPrice, regularPrice, unit }: PriceTagProps) {
  const hasDiscount = Boolean(regularPrice && regularPrice > promotionalPrice);

  return (
    <View className="flex-row flex-wrap items-baseline gap-2">
      <Text className="text-xl font-bold text-brand-700">{formatPriceBRL(promotionalPrice)}</Text>
      {unit && <Text className="text-neutral-500">/{unit}</Text>}
      {hasDiscount && regularPrice && (
        <>
          <Text className="text-neutral-500 line-through">{formatPriceBRL(regularPrice)}</Text>
          <View className="rounded-full bg-accent-500 px-2 py-0.5">
            <Text className="text-xs font-semibold text-white">
              -{formatPercentOff(regularPrice, promotionalPrice)}%
            </Text>
          </View>
        </>
      )}
    </View>
  );
}
