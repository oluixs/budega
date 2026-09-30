import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink, MapPin, Navigation, Phone, Store } from "lucide-react";
import { buildPlaceRouteUrl, buildWhatsAppUrl, formatRelativeUpdate } from "@budega/shared";
import {
  getActiveFlyers,
  getActiveOffers,
  getBranchesByMarket,
  getCategories,
  getMarketBySlug,
} from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { ReportDialog } from "@/components/shared/report-dialog";
import { CategoryPills } from "@/components/shared/category-pills";
import { EmptyState } from "@/components/shared/empty-state";
import { TrackedActionButton } from "@/components/shared/tracked-action-button";
import { ViewTracker } from "@/components/shared/view-tracker";
import { MarketHours } from "@/components/market/market-hours";
import { OfferCard } from "@/components/offer/offer-card";
import { BranchesSection } from "@/components/market/branches-section";
import { FlyerCard } from "@/components/flyer/flyer-card";

interface MarketPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ categoria?: string }>;
}

export async function generateMetadata({ params }: MarketPageProps): Promise<Metadata> {
  const { slug } = await params;
  const market = await getMarketBySlug(slug);
  return { title: market?.name ?? "Mercado não encontrado" };
}

export default async function MarketPage({ params, searchParams }: MarketPageProps) {
  const { slug } = await params;
  const { categoria } = await searchParams;
  const market = await getMarketBySlug(slug);
  if (!market) notFound();

  const [branches, flyers, offers, categories] = await Promise.all([
    getBranchesByMarket(market.id),
    getActiveFlyers(market.id),
    getActiveOffers({ marketId: market.id }),
    getCategories(),
  ]);

  const offerCategoryIds = new Set(offers.map((offer) => offer.category_id));
  const availableCategories = categories.filter((category) => offerCategoryIds.has(category.id));
  const selectedCategory = categories.find((category) => category.slug === categoria);
  const visibleOffers = selectedCategory
    ? offers.filter((offer) => offer.category_id === selectedCategory.id)
    : offers;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <ViewTracker eventName="market_view" target={{ market_id: market.id }} />
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-neutral-300 bg-neutral-0 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-50 text-brand-600">
            {market.logo_url ? (
              <Image src={market.logo_url} alt={`Logo ${market.name}`} fill sizes="80px" className="object-contain p-2" />
            ) : (
              <Store className="h-9 w-9" aria-hidden="true" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-h1 font-bold text-neutral-900">{market.name}</h1>
              {market.is_featured && <Badge className="bg-accent-500 text-neutral-0">Destaque</Badge>}
              {market.is_verified && <Badge variant="outline">Verificado</Badge>}
            </div>
            {market.description && <p className="mt-1 text-body-lg text-neutral-700">{market.description}</p>}
            <p className="mt-1 flex items-center gap-1 text-body text-neutral-500">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              {branches.length > 1 ? "Endereço principal: " : ""}
              {[market.address, market.neighborhood].filter(Boolean).join(", ")} — {market.city}/{market.state}
            </p>
            <p className="mt-1 text-caption text-neutral-500">
              Atualizado {formatRelativeUpdate(market.updated_at)}
              {market.website_url && (
                <>
                  {" · "}Informações e encartes do{" "}
                  <a
                    href={market.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 font-medium text-brand-600 hover:underline"
                  >
                    site oficial <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <FavoriteButton marketId={market.id} label />
          <TrackedActionButton
            eventName="route_click"
            market_id={market.id}
            href={buildPlaceRouteUrl(market)}
            target="_blank"
            rel="noreferrer"
          >
            <Navigation className="h-4 w-4" /> Rota
          </TrackedActionButton>
          {market.phone && (
            <TrackedActionButton eventName="phone_click" market_id={market.id} href={`tel:${market.phone}`}>
              <Phone className="h-4 w-4" /> Ligar
            </TrackedActionButton>
          )}
          {market.whatsapp && (
            <TrackedActionButton
              eventName="whatsapp_click"
              market_id={market.id}
              href={buildWhatsAppUrl(market.whatsapp)}
              target="_blank"
              rel="noreferrer"
              variant="default"
            >
              WhatsApp
            </TrackedActionButton>
          )}
          <ReportDialog marketId={market.id} defaultReason="mercado_incorreto" />
        </div>
      </div>

      {branches.length <= 1 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <MarketHours openingHours={market.opening_hours} />
        </div>
      )}

      {flyers.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-h2 font-semibold text-neutral-900">
            {flyers.length === 1 ? "Encarte atual" : `Encartes atuais (${flyers.length})`}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flyers.map((flyer) => (
              <FlyerCard
                key={flyer.id}
                flyer={flyer}
                branchName={branches.find((branch) => branch.id === flyer.branch_id)?.name}
              />
            ))}
          </div>
        </section>
      )}

      {branches.length > 1 && <BranchesSection market={market} branches={branches} />}

      <section>
        <h2 className="mb-4 font-display text-h2 font-semibold text-neutral-900">Ofertas</h2>
        {availableCategories.length > 0 && (
          <CategoryPills categories={availableCategories} activeSlug={selectedCategory?.slug} className="mb-4" />
        )}

        {visibleOffers.length === 0 ? (
          <EmptyState
            icon={Store}
            title={flyers.length ? "Ofertas deste mercado estão nos encartes" : "Nenhuma oferta ativa neste mercado"}
            description={
              flyers.length
                ? "Abra um dos encartes acima para ver os produtos e preços desta semana."
                : "Volte em breve — os preços podem mudar a qualquer momento."
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}

        <p className="mt-6 text-caption text-neutral-500">
          Preços e disponibilidade devem ser confirmados diretamente no estabelecimento.
        </p>
      </section>
    </div>
  );
}
