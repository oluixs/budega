"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  marketId?: string;
  offerId?: string;
  className?: string;
  label?: boolean;
}

export function FavoriteButton({ marketId, offerId, className, label = false }: FavoriteButtonProps) {
  const { toggle, isFavorited, hydrated } = useFavorites();
  const target = { market_id: marketId ?? null, offer_id: offerId ?? null };
  const active = hydrated && isFavorited(target);

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    toggle(target);
    toast.success(active ? "Removido dos favoritos" : "Adicionado aos favoritos", {
      description: "Você pode ver seus salvos em Favoritos, sem precisar de cadastro.",
    });
  }

  return (
    <Button
      variant={label ? "outline" : "ghost"}
      size={label ? "default" : "icon"}
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={cn(!label && "text-neutral-500 hover:text-accent-500", className)}
    >
      <Heart className={cn("h-4 w-4", active && "fill-accent-500 text-accent-500")} />
      {label && (active ? "Salvo" : "Salvar")}
    </Button>
  );
}
