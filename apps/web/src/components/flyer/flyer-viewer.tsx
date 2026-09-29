"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, FileText, ZoomIn, ZoomOut } from "lucide-react";
import type { Flyer } from "@budega/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FlyerViewerProps {
  flyer: Pick<Flyer, "file_url" | "file_type" | "cover_url" | "source_url" | "title">;
  marketName?: string;
}

/**
 * Encarte em imagem: mostra a imagem com zoom. Encarte em PDF: mostra a capa (1ª página)
 * e um link para o PDF original no site do mercado — navegadores de celular não exibem
 * PDF embutido de forma confiável, e o arquivo continua servido pela própria fonte.
 */
export function FlyerViewer({ flyer, marketName }: FlyerViewerProps) {
  const [zoomed, setZoomed] = useState(false);
  const image = flyer.file_type === "image" ? flyer.file_url : flyer.cover_url;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {flyer.file_type === "pdf" ? (
          <Button render={<a href={flyer.file_url} target="_blank" rel="noreferrer" />}>
            <FileText className="h-4 w-4" aria-hidden="true" /> Ver encarte completo (PDF)
          </Button>
        ) : (
          <span />
        )}
        {image && (
          <Button variant="outline" size="sm" onClick={() => setZoomed((value) => !value)}>
            {zoomed ? <ZoomOut className="h-4 w-4" aria-hidden="true" /> : <ZoomIn className="h-4 w-4" aria-hidden="true" />}
            {zoomed ? "Diminuir" : "Ampliar"}
          </Button>
        )}
      </div>

      {image ? (
        <div
          className={cn(
            "relative overflow-auto rounded-xl border border-neutral-300 bg-neutral-100",
            zoomed ? "max-h-[80vh]" : "max-h-[70vh]",
          )}
        >
          <Image
            src={image}
            alt={flyer.file_type === "pdf" ? `Primeira página do encarte ${flyer.title}` : `Encarte: ${flyer.title}`}
            width={800}
            height={1120}
            className={cn("mx-auto h-auto w-full origin-top transition-transform", zoomed && "scale-150")}
            unoptimized
          />
        </div>
      ) : (
        <p className="rounded-xl border border-neutral-300 bg-neutral-0 p-6 text-body-lg text-neutral-700">
          Este encarte está disponível em PDF. Use o botão acima para abri-lo.
        </p>
      )}

      {flyer.source_url && (
        <p className="text-caption text-neutral-500">
          Encarte publicado por {marketName ?? "o mercado"} no{" "}
          <a href={flyer.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-brand-600 hover:underline">
            site oficial <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
          . O Budega apenas reúne e mostra os encartes; preços e condições são de responsabilidade do mercado.
        </p>
      )}
    </div>
  );
}
