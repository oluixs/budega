"use client";

import { useEffect } from "react";
import type { AnalyticsEventName } from "@budega/shared";
import { trackEvent, type TrackEventTarget } from "@/lib/track-event";

interface ViewTrackerProps {
  eventName: Extract<AnalyticsEventName, "market_view" | "offer_view" | "flyer_view">;
  target: TrackEventTarget;
}

/**
 * Registra uma visualização de página quando ela é aberta. Não renderiza nada — fica
 * dentro da página (Server Component) só para ter acesso a `useEffect` no cliente.
 */
export function ViewTracker({ eventName, target }: ViewTrackerProps) {
  useEffect(() => {
    trackEvent(eventName, target);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- registrar 1x por página; `target` é um objeto novo a cada render.
  }, []);

  return null;
}
