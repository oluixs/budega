import Link from "next/link";
import * as Icons from "lucide-react";
import type { Category } from "@budega/shared";
import { cn } from "@/lib/utils";

interface CategoryPillsProps {
  categories: Category[];
  activeSlug?: string;
  className?: string;
}

function resolveIcon(name: string) {
  const pascalCase = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[pascalCase];
  return Icon ?? Icons.Tag;
}

export function CategoryPills({ categories, activeSlug, className }: CategoryPillsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {categories.map((category) => {
        const Icon = resolveIcon(category.icon);
        const isActive = category.slug === activeSlug;
        return (
          <Link
            key={category.id}
            href={isActive ? "/explorar" : `/explorar?categoria=${category.slug}`}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-body font-medium transition-colors",
              isActive
                ? "border-brand-500 bg-brand-500 text-neutral-0"
                : "border-neutral-300 bg-neutral-0 text-neutral-700 hover:border-brand-500 hover:text-brand-600",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
