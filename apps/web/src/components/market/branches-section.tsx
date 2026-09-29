import { MapPin, Navigation, Phone } from "lucide-react";
import { buildPlaceRouteUrl, formatOpeningHoursToday, type Branch, type Market } from "@budega/shared";
import { MarketsMap } from "@/components/map/markets-map";

/** Lojas de um mercado: mapa com todas elas + lista acessível (recolhível quando longa). */
export function BranchesSection({ market, branches }: { market: Market; branches: Branch[] }) {
  if (branches.length === 0) return null;
  const longList = branches.length > 6;

  const list = (
    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
      {branches.map((branch) => (
        <li key={branch.id} className="rounded-lg border border-neutral-300 bg-neutral-0 p-3">
          <p className="font-medium text-neutral-900">{branch.name}</p>
          <p className="mt-1 flex items-start gap-1 text-body text-neutral-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {[branch.address, branch.neighborhood, branch.city].filter(Boolean).join(" — ")}
          </p>
          {branch.opening_hours.length > 0 && (
            <p className="mt-1 text-body text-neutral-700">{formatOpeningHoursToday(branch.opening_hours)}</p>
          )}
          <p className="mt-2 flex flex-wrap gap-4 text-body font-medium">
            <a
              href={buildPlaceRouteUrl(branch)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-brand-600 hover:underline"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" /> Como chegar
            </a>
            {branch.phone && (
              <a href={`tel:${branch.phone}`} className="flex items-center gap-1 text-brand-600 hover:underline">
                <Phone className="h-4 w-4" aria-hidden="true" /> Ligar
              </a>
            )}
          </p>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="mb-10" aria-labelledby="lojas">
      <h2 id="lojas" className="mb-4 font-display text-h2 font-semibold text-neutral-900">
        {branches.length === 1 ? "Loja" : `${branches.length} lojas`}
      </h2>
      <MarketsMap
        points={branches.map((branch) => ({
          id: branch.id,
          latitude: branch.latitude,
          longitude: branch.longitude,
          title: branch.name,
          subtitle: [branch.address, branch.neighborhood].filter(Boolean).join(" — "),
          routeUrl: buildPlaceRouteUrl(branch),
        }))}
        fallbackCenter={market}
        label={`Mapa das lojas de ${market.name}`}
        className="h-[320px] sm:h-[400px]"
      />
      {longList ? (
        <details className="group mt-4">
          <summary className="cursor-pointer text-body-lg font-medium text-brand-600 hover:underline">
            Ver endereços e horários das {branches.length} lojas
          </summary>
          {list}
        </details>
      ) : (
        list
      )}
    </section>
  );
}
