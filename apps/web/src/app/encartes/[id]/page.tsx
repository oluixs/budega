import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Store } from "lucide-react";
import { buildFlyerShareUrl, formatDateBR } from "@budega/shared";
import { getActiveFlyers, getFlyerById, getMarketById } from "@/lib/data";
import { FlyerViewer } from "@/components/flyer/flyer-viewer";
import { ShareButton } from "@/components/shared/share-button";
import { ReportDialog } from "@/components/shared/report-dialog";
import { Button } from "@/components/ui/button";

interface FlyerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: FlyerPageProps): Promise<Metadata> {
  const { id } = await params;
  const flyer = await getFlyerById(id);
  return { title: flyer?.title ?? "Encarte não encontrado" };
}

export default async function FlyerPage({ params }: FlyerPageProps) {
  const { id } = await params;
  const flyer = await getFlyerById(id);
  if (!flyer) notFound();

  const market = await getMarketById(flyer.market_id);
  const siblings = await getActiveFlyers(flyer.market_id);
  const currentIndex = siblings.findIndex((item) => item.id === flyer.id);
  const previous = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-h1 font-bold text-neutral-900">{flyer.title}</h1>
          {market && (
            <Link href={`/mercados/${market.slug}`} className="mt-1 flex items-center gap-1 text-body text-brand-600 hover:underline">
              <Store className="h-4 w-4" /> {market.name}
            </Link>
          )}
          <p className="mt-1 text-body text-neutral-700">
            Válido de {formatDateBR(flyer.valid_from)} até {formatDateBR(flyer.valid_until)}
          </p>
          {flyer.description && <p className="mt-1 text-body text-neutral-500">{flyer.description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <ShareButton url={buildFlyerShareUrl(flyer.id)} title={flyer.title} />
          <ReportDialog flyerId={flyer.id} defaultReason="encarte_ilegivel" />
        </div>
      </div>

      <FlyerViewer flyer={flyer} marketName={market?.name} />

      {(previous || next) && (
        <div className="mt-4 flex items-center justify-between">
          {previous ? (
            <Button variant="ghost" render={<Link href={`/encartes/${previous.id}`} />}>
              <ChevronLeft className="h-4 w-4" /> {previous.title}
            </Button>
          ) : (
            <span />
          )}
          {next && (
            <Button variant="ghost" render={<Link href={`/encartes/${next.id}`} />}>
              {next.title} <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
