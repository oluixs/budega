"use client";

import type { ComponentProps } from "react";
import type { AnalyticsEventName } from "@budega/shared";
import { Button } from "@/components/ui/button";
import { trackEvent, type TrackEventTarget } from "@/lib/track-event";

type ButtonVariant = ComponentProps<typeof Button>["variant"];

interface TrackedActionButtonProps extends TrackEventTarget {
  eventName: Extract<AnalyticsEventName, "route_click" | "phone_click" | "whatsapp_click">;
  href: string;
  target?: string;
  rel?: string;
  variant?: ButtonVariant;
  children: React.ReactNode;
}

/**
 * Botão de rota/telefone/WhatsApp que registra o clique antes de deixar a navegação
 * acontecer normalmente (não usa preventDefault — o link sempre funciona, mesmo se o
 * registro do evento falhar).
 */
export function TrackedActionButton({
  eventName,
  href,
  target,
  rel,
  variant = "outline",
  children,
  market_id,
  offer_id,
  flyer_id,
  metadata,
}: TrackedActionButtonProps) {
  return (
    <Button
      variant={variant}
      render={
        <a
          href={href}
          target={target}
          rel={rel}
          onClick={() => trackEvent(eventName, { market_id, offer_id, flyer_id, metadata })}
        />
      }
    >
      {children}
    </Button>
  );
}
