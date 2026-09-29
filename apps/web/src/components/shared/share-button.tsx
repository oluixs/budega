"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
}

export function ShareButton({ url, title, text }: ShareButtonProps) {
  async function handleShare() {
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
