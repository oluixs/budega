import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, MapPin, Navigation, Phone, Store } from "lucide-react";
import {
  buildExternalRouteUrl,
  buildWhatsAppUrl,
  formatDateBR,
  formatRelativeUpdate,
} from "@budega/shared";
import {
  getActiveFlyers,
  getActiveOffers,
  getBranchesByMarket,
  getCategories,
  getMarketBySlug,
} from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { ReportDialog } from "@/components/shared/report-dialog";
import { CategoryPills } from "@/components/shared/category-pills";
import { EmptyState } from "@/components/shared/empty-state";
import { MarketHours } from "@/components/market/market-hours";
import { OfferCard } from "@/components/offer/offer-card";

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
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-neutral-300 bg-neutral-0 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Store className="h-9 w-9" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-h1 font-bold text-neutral-900">{market.name}</h1>
              {market.is_featured && <Badge className="bg-accent-500 text-neutral-0">Destaque</Badge>}
              {market.is_verified && <Badge variant="outline">Verificado</Badge>}
            </div>
            <p className="mt-1 flex items-center gap-1 text-body text-neutral-500">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {market.address}, {market.neighborhood} — {market.city}/{market.state}
            </p>
            <p className="mt-1 text-caption text-neutral-500">
              Atualizado {formatRelativeUpdate(market.updated_at)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <FavoriteButton marketId={market.id} label />
          <Button
            variant="outline"
            render={
              <a href={buildExternalRouteUrl(market.latitude, market.longitude, market.name)} target="_blank" rel="noreferrer" />
            }
          >
            <Navigation className="h-4 w-4" /> Rota
          </Button>
          {market.phone && (
            <Button variant="outline" render={<a href={`tel:${market.phone}`} />}>
              <Phone className="h-4 w-4" /> Ligar
            </Button>
          )}
          {market.whatsapp && (
            <Button render={<a href={buildWhatsAppUrl(market.whatsapp)} target="_blank" rel="noreferrer" />}>
              WhatsApp
            </Button>
          )}
          <ReportDialog marketId={market.id} defaultReason="mercado_incorreto" />
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <MarketHours openingHours={market.opening_hours} />
        {branches.length > 1 && (
          <div className="rounded-lg border border-neutral-300 bg-neutral-0 p-3">
            <p className="mb-2 text-body font-medium text-neutral-900">
              {branches.length} filiais
            </p>
            <ul className="space-y-1 text-body text-neutral-500">
              {branches.map((branch) => (
                <li key={branch.id}>
                  {branch.name} — {branch.neighborhood}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {flyers.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-h2 font-semibold text-neutral-900">Encarte atual</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flyers.map((flyer) => (
              <Link
                key={flyer.id}
                href={`/encartes/${flyer.id}`}
                className="flex items-center gap-3 rounded-xl border border-neutral-300 bg-neutral-0 p-4 transition-colors hover:border-brand-500"
              >
                <FileText className="h-8 w-8 shrink-0 text-brand-600" aria-hidden="true" />
                <div>
                  <p className="font-medium text-neutral-900">{flyer.title}</p>
                  <p className="text-caption text-neutral-500">
                    Válido até {formatDateBR(flyer.valid_until)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-h2 font-semibold text-neutral-900">Ofertas</h2>
        {availableCategories.length > 0 && (
          <CategoryPills categories={availableCategories} activeSlug={selectedCategory?.slug} className="mb-4" />
        )}

        {visibleOffers.length === 0 ? (
          <EmptyState
            icon={Store}
            title="Nenhuma oferta ativa neste mercado"
            description="Volte em breve — os preços podem mudar a qualquer momento."
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
