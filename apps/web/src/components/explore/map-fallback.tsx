import { MapPinOff } from "lucide-react";
import type { MarketWithDistance } from "@budega/shared";
import { buildExternalRouteUrl, formatDistance } from "@budega/shared";
import { Button } from "@/components/ui/button";

interface MapFallbackProps {
  markets: MarketWithDistance[];
}

/**
 * Sem NEXT_PUBLIC_GOOGLE_MAPS_API_KEY configurada, mostramos esta lista com distância,
 * endereço e botão de rota externa em vez do mapa interativo (requisito do brief:
 * "mantenha a lista funcionando e exiba um fallback com distância, endereço e botão de
 * rota externa").
 */
export function MapFallback({ markets }: MapFallbackProps) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-0 p-6">
      <div className="mb-4 flex items-center gap-2 text-neutral-500">
        <MapPinOff className="h-5 w-5" aria-hidden="true" />
        <p className="text-body">
          O mapa interativo requer uma chave do Google Maps, que não está configurada
          neste ambiente. Veja a lista de endereços abaixo enquanto isso.
        </p>
      </div>
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
                  href={buildExternalRouteUrl(market.latitude, market.longitude, market.name)}
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
