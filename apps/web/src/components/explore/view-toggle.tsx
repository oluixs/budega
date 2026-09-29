"use client";

import { List, Map as MapIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "mapa" ? "mapa" : "lista";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "lista") params.delete("view");
    else params.set("view", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Tabs value={view} onValueChange={handleChange}>
      <TabsList>
        <TabsTrigger value="lista">
          <List className="h-4 w-4" /> Lista
        </TabsTrigger>
        <TabsTrigger value="mapa">
          <MapIcon className="h-4 w-4" /> Mapa
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
