import { Pressable } from "react-native";
import { Heart } from "lucide-react-native";
import { useFavorites } from "@/hooks/use-favorites";

interface FavoriteButtonProps {
  marketId?: string;
  offerId?: string;
  size?: number;
}

export function FavoriteButton({ marketId, offerId, size = 20 }: FavoriteButtonProps) {
  const { toggle, isFavorited, hydrated } = useFavorites();
  const target = { market_id: marketId ?? null, offer_id: offerId ?? null };
  const active = hydrated && isFavorited(target);

  return (
    <Pressable
      onPress={() => toggle(target)}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className="h-10 w-10 items-center justify-center rounded-full bg-white/90"
    >
      <Heart size={size} color={active ? "#E2612E" : "#8A8375"} fill={active ? "#E2612E" : "transparent"} />
    </Pressable>
  );
}
