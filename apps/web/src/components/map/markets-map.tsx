"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
  /** Página do mercado no Budega. */
  href?: string;
  /** Link de rota externa (Google Maps/Waze). */
  routeUrl?: string;
}

export interface MarketsMapProps {
  points: MapPoint[];
  /** Posição do usuário, quando ele compartilhou a localização. */
  userLocation?: { latitude: number; longitude: number } | null;
  /** Centro usado quando não há pontos. */
  fallbackCenter: { latitude: number; longitude: number };
  /** Zoom inicial sobre `fallbackCenter` (padrão 12). Só importa quando `fitToPoints` é false. */
  zoom?: number;
  /**
   * Ajusta o zoom para caber todos os pontos (padrão true). Desligue para um mapa geral
   * centrado numa região (ex.: Fortaleza) que não deve encolher por causa de uma loja
   * distante (ex.: interior do estado) — ver /mapa.
   */
  fitToPoints?: boolean;
  className?: string;
  label: string;
}

// Leaflet usa `window`: só renderiza no navegador. Enquanto carrega, um skeleton do
// mesmo tamanho evita o layout "pular".
const MapInner = dynamic(() => import("./markets-map-inner"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-xl" />,
});

/**
 * Mapa interativo (Leaflet + OpenStreetMap, sem chave de API). É complementar: a mesma
 * informação sempre aparece também em lista, para quem não consegue usar o mapa.
 */
export function MarketsMap({ className = "h-[420px]", ...props }: MarketsMapProps) {
  return (
    <div className={`${className} overflow-hidden rounded-xl border border-neutral-300`}>
      <MapInner {...props} />
    </div>
  );
}
