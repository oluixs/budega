import Link from "next/link";
import { Tag } from "lucide-react";
import type { Offer } from "@budega/shared";
import { formatDateBR } from "@budega/shared";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PriceTag } from "@/components/shared/price-tag";
import { FavoriteButton } from "@/components/shared/favorite-button";

interface OfferCardProps {
  offer: Offer;
  marketName?: string;
}

export function OfferCard({ offer, marketName }: OfferCardProps) {
  return (
    <Card className="group relative h-full gap-0 py-0 shadow-[var(--shadow-card)] ring-neutral-300">
      <Link href={`/ofertas/${offer.id}`} className="flex h-full flex-col">
        <div className="flex h-32 items-center justify-center bg-neutral-100 text-neutral-500">
          <Tag className="h-9 w-9" aria-hidden="true" />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-h3 font-semibold leading-snug text-neutral-900">
              {offer.name}
            </h3>
            {offer.is_featured && (
              <Badge className="shrink-0 bg-accent-500 text-neutral-0">Oferta</Badge>
            )}
          </div>

          {marketName && <p className="text-body text-neutral-500">{marketName}</p>}
          {offer.description && <p className="text-body text-neutral-500">{offer.description}</p>}

          <PriceTag
            promotionalPrice={offer.promotional_price}
            regularPrice={offer.regular_price}
            unit={offer.unit}
            className="mt-1"
          />

          <p className="mt-auto pt-2 text-caption text-neutral-500">
            Válida até {formatDateBR(offer.valid_until)} ·{" "}
            {offer.origin === "encarte" ? "Lida do encarte — confira no original" : "Confirme o preço na loja"}
          </p>
        </div>
      </Link>
      <FavoriteButton offerId={offer.id} className="absolute right-2 top-2 bg-neutral-0/90 backdrop-blur" />
    </Card>
  );
}

export function OfferCardSkeleton() {
  return <div className="h-64 animate-pulse rounded-xl border border-neutral-300 bg-neutral-100" />;
}
