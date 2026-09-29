"use client";

import type { FieldErrors } from "react-hook-form";
import { weekdayLabel, type OpeningHours } from "@budega/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface OpeningHoursEditorProps {
  value: OpeningHours[];
  onChange: (value: OpeningHours[]) => void;
  /** Prefixo dos ids dos inputs (precisa ser único na página). */
  idPrefix: string;
  error?: string;
}

// Segunda primeiro: é como as pessoas leem horário de comércio.
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function entryFor(value: OpeningHours[], day: number): OpeningHours {
  return value.find((entry) => entry.day === day) ?? { day, opens_at: null, closes_at: null, closed: true };
}

/** Primeira mensagem de erro de `opening_hours` (o zod reporta por dia da semana). */
export function openingHoursError(errors: FieldErrors<{ opening_hours: unknown[] }>): string | undefined {
  const field = errors.opening_hours as
    | ({ message?: string; root?: { message?: string } } & Record<number, { message?: string } | undefined>)
    | undefined;
  if (!field) return undefined;
  if (field.message) return field.message;
  if (field.root?.message) return field.root.message;
  for (let day = 0; day < 7; day += 1) {
    const message = field[day]?.message;
    if (message) return `${weekdayLabel(day)}: ${message}`;
  }
  return "Revise o horário de funcionamento";
}

/** Horário de funcionamento por dia da semana (usado nos cadastros de mercado e filial). */
export function OpeningHoursEditor({ value, onChange, idPrefix, error }: OpeningHoursEditorProps) {
  function update(day: number, patch: Partial<OpeningHours>) {
    const next = DAY_ORDER.map((d) => {
      const entry = entryFor(value, d);
      if (d !== day) return entry;
      const merged = { ...entry, ...patch };
      // Reabrir um dia sem horário: sugere o horário comercial mais comum.
      if (patch.closed === false && (!merged.opens_at || !merged.closes_at)) {
        return { ...merged, opens_at: merged.opens_at ?? "08:00", closes_at: merged.closes_at ?? "20:00" };
      }
      return patch.closed ? { ...merged, opens_at: null, closes_at: null } : merged;
    });
    onChange(next.sort((a, b) => a.day - b.day));
  }

  function copyMondayToAll() {
    const monday = entryFor(value, 1);
    onChange(DAY_ORDER.map((day) => ({ ...monday, day })).sort((a, b) => a.day - b.day));
  }

  return (
    <fieldset className="grid gap-2 rounded-lg border border-neutral-300 p-3">
      <legend className="px-1 text-body font-medium text-neutral-900">Horário de funcionamento</legend>
      {DAY_ORDER.map((day) => {
        const entry = entryFor(value, day);
        const label = weekdayLabel(day);
        return (
          <div key={day} className="grid grid-cols-[5.5rem_1fr] items-center gap-2 sm:grid-cols-[6rem_6.5rem_1fr]">
            <span className="text-body font-medium text-neutral-700">{label}</span>
            <label className="flex items-center gap-2 text-body text-neutral-700" htmlFor={`${idPrefix}-closed-${day}`}>
              <Checkbox
                id={`${idPrefix}-closed-${day}`}
                checked={entry.closed}
                onCheckedChange={(checked) => update(day, { closed: checked === true })}
              />
              Fechado
            </label>
            <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
              <Input
                type="time"
                aria-label={`${label}: abre às`}
                value={entry.opens_at ?? ""}
                disabled={entry.closed}
                onChange={(event) => update(day, { opens_at: event.target.value || null })}
              />
              <span className="text-body text-neutral-500">às</span>
              <Input
                type="time"
                aria-label={`${label}: fecha às`}
                value={entry.closes_at ?? ""}
                disabled={entry.closed}
                onChange={(event) => update(day, { closes_at: event.target.value || null })}
              />
            </div>
          </div>
        );
      })}
      <Button type="button" variant="ghost" size="sm" className="justify-self-start" onClick={copyMondayToAll}>
        Repetir o horário de segunda em todos os dias
      </Button>
      {error && (
        <p role="alert" className="text-body text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
