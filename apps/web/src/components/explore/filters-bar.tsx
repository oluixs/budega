"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@budega/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FiltersBarProps {
  categories: Category[];
}

const DISTANCE_OPTIONS = [
  { value: "any", label: "Qualquer distância" },
  { value: "1", label: "Até 1 km" },
  { value: "3", label: "Até 3 km" },
  { value: "5", label: "Até 5 km" },
  { value: "10", label: "Até 10 km" },
];

const SORT_OPTIONS = [
  { value: "distance", label: "Mais perto" },
  { value: "relevance", label: "Relevância" },
];

// Sem `items`, o Select do Base UI mostra o valor cru ("any", "distance") no gatilho.
const labelsOf = (options: { value: string; label: string }[]) =>
  Object.fromEntries(options.map((option) => [option.value, option.label]));

export function FiltersBar({ categories }: FiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "any" || value === "false") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-300 bg-neutral-0 p-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="filtro-distancia" className="text-caption text-neutral-500">Distância</Label>
        <Select
          value={searchParams.get("distancia") ?? "any"}
          onValueChange={(value) => updateParam("distancia", value)}
          items={labelsOf(DISTANCE_OPTIONS)}
        >
          <SelectTrigger id="filtro-distancia" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DISTANCE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="filtro-categoria" className="text-caption text-neutral-500">Categoria</Label>
        <Select
          value={searchParams.get("categoria") ?? "any"}
          onValueChange={(value) => updateParam("categoria", value)}
          items={{ any: "Todas as categorias", ...Object.fromEntries(categories.map((c) => [c.slug, c.name])) }}
        >
          <SelectTrigger id="filtro-categoria" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="filtro-ordenar" className="text-caption text-neutral-500">Ordenar por</Label>
        <Select
          value={searchParams.get("ordenar") ?? "distance"}
          onValueChange={(value) => updateParam("ordenar", value)}
          items={labelsOf(SORT_OPTIONS)}
        >
          <SelectTrigger id="filtro-ordenar" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 pt-5">
        <Switch
          id="aberto-agora"
          checked={searchParams.get("abertoAgora") === "true"}
          onCheckedChange={(checked) => updateParam("abertoAgora", checked ? "true" : null)}
        />
        <Label htmlFor="aberto-agora" className="text-body text-neutral-700">
          Aberto agora
        </Label>
      </div>

      <div className="flex items-center gap-2 pt-5">
        <Switch
          id="atualizado"
          checked={searchParams.get("atualizado") === "true"}
          onCheckedChange={(checked) => updateParam("atualizado", checked ? "true" : null)}
        />
        <Label htmlFor="atualizado" className="text-body text-neutral-700">
          Atualizado recentemente
        </Label>
      </div>
    </div>
  );
}
