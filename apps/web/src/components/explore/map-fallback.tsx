import { MapPin } from "lucide-react";
import type { MarketWithDistance } from "@budega/shared";
import { buildPlaceRouteUrl, formatDistance } from "@budega/shared";
import { Button } from "@/components/ui/button";

interface MapFallbackProps {
  markets: MarketWithDistance[];
}

/**
 * Lista textual que acompanha o mapa (distância, endereço e rota externa): a mesma
 * informação do mapa para quem usa leitor de tela, teclado ou está sem JavaScript
 * (requisito do brief: "mantenha a lista funcionando").
 */
export function MapFallback({ markets }: MapFallbackProps) {
  return (
    <div className="rounded-xl border border-neutral-300 bg-neutral-0 p-6">
      <h2 className="mb-2 flex items-center gap-2 font-display text-h3 font-semibold text-neutral-900">
        <MapPin className="h-5 w-5 text-brand-600" aria-hidden="true" />
        Mercados no mapa
      </h2>
      <ul className="divide-y divide-neutral-100">
        {markets.map((market) => (
          <li key={market.id} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="font-medium text-neutral-900">{market.name}</p>
              <p className="text-body text-neutral-500">
                {market.address}, {market.neighborhood}
                {market.distance_km !== null && ` · ${formatDistance(market.distance_km)}`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              render={
                <a
                  href={buildPlaceRouteUrl(market)}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              Rota
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
