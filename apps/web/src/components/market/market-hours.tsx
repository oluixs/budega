import type { OpeningHours } from "@budega/shared";
import { formatOpeningHoursToday, isOpenNow, weekdayLabel } from "@budega/shared";
import { Badge } from "@/components/ui/badge";

export function MarketHours({ openingHours }: { openingHours: OpeningHours[] }) {
  const open = isOpenNow(openingHours);

  return (
    <details className="group rounded-lg border border-neutral-300 bg-neutral-0 p-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-body font-medium text-neutral-900">
          {formatOpeningHoursToday(openingHours)}
        </span>
        <Badge variant={open ? "default" : "secondary"} className={open ? "bg-brand-500" : ""}>
          {open ? "Aberto agora" : "Fechado agora"}
        </Badge>
      </summary>
      <ul className="mt-3 space-y-1 border-t border-neutral-100 pt-3 text-body text-neutral-500">
        {openingHours
          .slice()
          .sort((a, b) => a.day - b.day)
          .map((entry) => (
            <li key={entry.day} className="flex justify-between">
              <span>{weekdayLabel(entry.day)}</span>
              <span>
                {entry.closed || !entry.opens_at || !entry.closes_at
                  ? "Fechado"
                  : `${entry.opens_at} às ${entry.closes_at}`}
              </span>
            </li>
          ))}
      </ul>
    </details>
  );
}
