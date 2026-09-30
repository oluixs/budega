"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trackEvent, type TrackEventTarget } from "@/lib/track-event";

interface ShareButtonProps extends TrackEventTarget {
  url: string;
  title: string;
  text?: string;
}

export function ShareButton({ url, title, text, market_id, offer_id, flyer_id }: ShareButtonProps) {
  async function handleShare() {
    trackEvent("share", { market_id, offer_id, flyer_id });

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Usuário cancelou o compartilhamento nativo — não é um erro a reportar.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado", { description: url });
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  }

  return (
    <Button variant="outline" onClick={handleShare}>
      <Share2 className="h-4 w-4" /> Compartilhar
    </Button>
  );
}
