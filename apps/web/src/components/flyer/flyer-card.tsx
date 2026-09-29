import Image from "next/image";
import Link from "next/link";
import { FileText } from "lucide-react";
import { formatDateBR, type Flyer } from "@budega/shared";

interface FlyerCardProps {
  flyer: Flyer;
  /** Nome da loja, quando o encarte vale só para uma filial. */
  branchName?: string;
  /** Nome do mercado (em listas com encartes de vários mercados). */
  marketName?: string;
}

/** Cartão de encarte com a capa (quando o mercado publica uma) e o período de validade. */
export function FlyerCard({ flyer, branchName, marketName }: FlyerCardProps) {
  return (
    <Link
      href={`/encartes/${flyer.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-300 bg-neutral-0 transition-colors hover:border-brand-500"
    >
      <div className="relative flex aspect-[3/4] max-h-72 items-center justify-center bg-neutral-100">
        {flyer.cover_url ? (
          <Image
            src={flyer.cover_url}
            alt={`Capa do encarte ${flyer.title}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top"
          />
        ) : (
          <FileText className="h-10 w-10 text-brand-600" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {marketName && <p className="text-caption font-medium text-brand-600">{marketName}</p>}
        <p className="font-display text-h3 font-semibold text-neutral-900">{flyer.title}</p>
        <p className="text-body text-neutral-500">
          Válido de {formatDateBR(flyer.valid_from)} até {formatDateBR(flyer.valid_until)}
        </p>
        {branchName ? (
          <p className="text-body font-medium text-neutral-900">Somente na loja {branchName}</p>
        ) : (
          flyer.description && <p className="line-clamp-2 text-caption text-neutral-500">{flyer.description}</p>
        )}
      </div>
    </Link>
  );
}
