"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Locate, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGeolocation } from "@/hooks/use-geolocation";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const geolocation = useGeolocation();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/explorar${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function handleUseLocation() {
    geolocation.request();
  }

  useEffect(() => {
    if (geolocation.status === "success" && geolocation.coordinates) {
      const params = new URLSearchParams({
        lat: String(geolocation.coordinates.latitude),
        lng: String(geolocation.coordinates.longitude),
      });
      router.push(`/explorar?${params.toString()}`);
    }
  }, [geolocation.status, geolocation.coordinates, router]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Digite seu endereço ou bairro"
          aria-label="Endereço ou bairro"
          className="h-12 rounded-full border-neutral-300 bg-neutral-0 pl-10 text-body-lg"
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleUseLocation}
          disabled={geolocation.status === "loading"}
          className="h-12 flex-1 rounded-full sm:flex-none"
        >
          <Locate className="h-4 w-4" />
          {geolocation.status === "loading" ? "Localizando..." : "Usar minha localização"}
        </Button>
        <Button type="submit" className="h-12 flex-1 rounded-full sm:flex-none">
          Buscar
        </Button>
      </div>
      {geolocation.errorMessage && (
        <p className="w-full text-caption text-warning sm:basis-full" role="alert">
          {geolocation.errorMessage}
        </p>
      )}
    </form>
  );
}
