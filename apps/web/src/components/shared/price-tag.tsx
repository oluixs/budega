import { formatPercentOff, formatPriceBRL } from "@budega/shared";
import { cn } from "@/lib/utils";

interface PriceTagProps {
  promotionalPrice: number;
  regularPrice?: number | null;
  unit?: string;
  className?: string;
}

export function PriceTag({ promotionalPrice, regularPrice, unit, className }: PriceTagProps) {
  const hasDiscount = Boolean(regularPrice && regularPrice > promotionalPrice);

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className="font-display text-xl font-bold text-brand-700">
        {formatPriceBRL(promotionalPrice)}
      </span>
      {unit && <span className="text-body text-neutral-500">/{unit}</span>}
      {hasDiscount && regularPrice && (
        <>
          <span className="text-body text-neutral-500 line-through">
            {formatPriceBRL(regularPrice)}
          </span>
          <span className="rounded-full bg-accent-500 px-2 py-0.5 text-caption font-semibold text-neutral-0">
            -{formatPercentOff(regularPrice, promotionalPrice)}%
          </span>
        </>
      )}
    </div>
  );
}
