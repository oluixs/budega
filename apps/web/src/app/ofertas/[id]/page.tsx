import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navigation, Store, Tag } from "lucide-react";
import { buildPlaceRouteUrl, buildOfferShareUrl, formatDateBR } from "@budega/shared";
import { getMarketById, getOfferById } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/components/shared/price-tag";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { ShareButton } from "@/components/shared/share-button";
import { ReportDialog } from "@/components/shared/report-dialog";
import { TrackedActionButton } from "@/components/shared/tracked-action-button";
import { ViewTracker } from "@/components/shared/view-tracker";

interface OfferPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: OfferPageProps): Promise<Metadata> {
  const { id } = await params;
  const offer = await getOfferById(id);
  return { title: offer?.name ?? "Oferta não encontrada" };
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { id } = await params;
  const offer = await getOfferById(id);
  if (!offer) notFound();

  const market = await getMarketById(offer.market_id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <ViewTracker eventName="offer_view" target={{ offer_id: offer.id, market_id: offer.market_id }} />
      <div className="overflow-hidden rounded-xl border border-neutral-300 bg-neutral-0">
        <div className="flex h-48 items-center justify-center bg-neutral-100 text-neutral-500">
          <Tag className="h-14 w-14" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="font-display text-h1 font-bold text-neutral-900">{offer.name}</h1>
              {market && (
                <Link href={`/mercados/${market.slug}`} className="mt-1 flex items-center gap-1 text-body text-brand-600 hover:underline">
                  <Store className="h-4 w-4" /> {market.name}
                </Link>
              )}
            </div>
            {offer.is_featured && <Badge className="bg-accent-500 text-neutral-0">Oferta em destaque</Badge>}
          </div>

          <PriceTag
            promotionalPrice={offer.promotional_price}
            regularPrice={offer.regular_price}
            unit={offer.unit}
            className="text-2xl"
          />

          <dl className="grid grid-cols-2 gap-4 rounded-lg bg-neutral-50 p-4 text-body">
            <div>
              <dt className="text-neutral-500">Válida de</dt>
              <dd className="font-medium text-neutral-900">{formatDateBR(offer.valid_from)}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Válida até</dt>
              <dd className="font-medium text-neutral-900">{formatDateBR(offer.valid_until)}</dd>
            </div>
          </dl>

          {offer.description && <p className="text-body-lg text-neutral-700">{offer.description}</p>}
          {offer.conditions && (
            <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-body text-neutral-700">
              <strong>Condições:</strong> {offer.conditions}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <FavoriteButton offerId={offer.id} label />
            <ShareButton
              url={buildOfferShareUrl(offer.id)}
              title={offer.name}
              text={`Confira essa oferta no Budega: ${offer.name}`}
              offer_id={offer.id}
              market_id={offer.market_id}
            />
            {market && (
              <TrackedActionButton
                eventName="route_click"
                market_id={market.id}
                offer_id={offer.id}
                href={buildPlaceRouteUrl(market)}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation className="h-4 w-4" /> Rota até o mercado
              </TrackedActionButton>
            )}
            <ReportDialog offerId={offer.id} marketId={offer.market_id} defaultReason="preco_incorreto" />
          </div>

          {offer.origin === "encarte" && offer.flyer_id && (
            <p className="rounded-lg border border-neutral-300 bg-neutral-100 p-3 text-body text-neutral-700">
              Esta oferta foi lida automaticamente do encarte do mercado e pode conter erros de
              leitura. O{" "}
              <Link href={`/encartes/${offer.flyer_id}`} className="font-medium text-brand-600 underline">
                encarte original
              </Link>{" "}
              sempre prevalece.
            </p>
          )}
          <p className="text-caption text-neutral-500">
            Preço e disponibilidade devem ser confirmados no estabelecimento.
          </p>
        </div>
      </div>
    </div>
  );
}
