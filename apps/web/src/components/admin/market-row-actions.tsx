"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { Market } from "@budega/shared";
import { Button } from "@/components/ui/button";
import { setMarketFlag } from "@/lib/admin-actions";

export function MarketRowActions({ market }: { market: Market }) {
  const [isPending, startTransition] = useTransition();

  function toggle(flag: "is_verified" | "is_featured" | "is_suspended", current: boolean) {
    startTransition(async () => {
      const result = await setMarketFlag(market.id, flag, !current);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant={market.is_verified ? "default" : "outline"}
        disabled={isPending}
        onClick={() => toggle("is_verified", market.is_verified)}
      >
        {market.is_verified ? "Verificado" : "Verificar"}
      </Button>
      <Button
        size="sm"
        variant={market.is_featured ? "default" : "outline"}
        disabled={isPending}
        onClick={() => toggle("is_featured", market.is_featured)}
      >
        {market.is_featured ? "Em destaque" : "Destacar"}
      </Button>
      <Button
        size="sm"
        variant={market.is_suspended ? "destructive" : "ghost"}
        disabled={isPending}
        onClick={() => toggle("is_suspended", market.is_suspended)}
      >
        {market.is_suspended ? "Reativar" : "Suspender"}
      </Button>
    </div>
  );
}
