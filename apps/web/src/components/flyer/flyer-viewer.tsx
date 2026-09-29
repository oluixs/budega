"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FlyerViewerProps {
  fileUrl: string;
  title: string;
}

export function FlyerViewer({ fileUrl, title }: FlyerViewerProps) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setZoomed((value) => !value)}>
          {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
          {zoomed ? "Diminuir" : "Ampliar"}
        </Button>
      </div>
      <div
        className={cn(
          "relative overflow-auto rounded-xl border border-neutral-300 bg-neutral-100",
          zoomed ? "max-h-[80vh]" : "max-h-[60vh]",
        )}
      >
        <Image
          src={fileUrl}
          alt={`Encarte: ${title}`}
          width={800}
          height={1120}
          className={cn("mx-auto h-auto w-full transition-transform", zoomed && "scale-150")}
          unoptimized
        />
      </div>
    </div>
  );
}
