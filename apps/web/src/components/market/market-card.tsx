import Link from "next/link";
import { BadgeCheck, MapPin, Store } from "lucide-react";
import type { MarketWithDistance } from "@budega/shared";
import { formatDistance } from "@budega/shared";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface MarketCardProps {
  market: MarketWithDistance;
}

export function MarketCard({ market }: MarketCardProps) {
  return (
    <Link href={`/mercados/${market.slug}`} className="group block h-full">
      <Card className="h-full gap-0 py-0 shadow-[var(--shadow-card)] ring-neutral-300 transition-transform group-hover:-translate-y-0.5">
        <div className="flex h-28 items-center justify-center bg-brand-50 text-brand-600">
          <Store className="h-10 w-10" aria-hidden="true" />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-h3 font-semibold text-neutral-900">{market.name}</h3>
            {market.is_featured && (
              <Badge className="shrink-0 bg-accent-500 text-neutral-0">Destaque</Badge>
            )}
          </div>

          <p className="flex items-center gap-1 text-body text-neutral-500">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            {market.neighborhood}, {market.city}
          </p>

          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-body font-medium text-brand-600">
              {formatDistance(market.distance_km)}
            </span>
            {market.is_verified && (
              <span className="flex items-center gap-1 text-caption font-medium text-neutral-500">
                <BadgeCheck className="h-4 w-4 text-brand-500" aria-hidden="true" />
                Verificado
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function MarketCardSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-xl border border-neutral-300 bg-neutral-100" />
  );
}
