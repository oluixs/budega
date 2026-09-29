"use client";

import { useCallback, useEffect, useState } from "react";
import { isFavorited, toggleLocalFavorite, type LocalFavorite } from "@budega/shared";

const STORAGE_KEY = "budega:favorites";

function readStorage(): LocalFavorite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalFavorite[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(favorites: LocalFavorite[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Armazenamento indisponível (modo privado, quota excedida) — falha silenciosa,
    // já que favoritos são um recurso de conveniência, não crítico.
  }
}

/**
 * Favoritos anônimos, salvos localmente no navegador (regra de negócio 10.6).
 * Não exige cadastro. Quando o usuário faz login, isso pode ser mesclado com o
 * Supabase via mergeFavorites() de @budega/shared.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<LocalFavorite[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFavorites(readStorage());
    setHydrated(true);

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setFavorites(readStorage());
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggle = useCallback((target: { market_id?: string | null; offer_id?: string | null }) => {
    setFavorites((current) => {
      const next = toggleLocalFavorite(current, target);
      writeStorage(next);
      return next;
    });
  }, []);

  const check = useCallback(
    (target: { market_id?: string | null; offer_id?: string | null }) => isFavorited(favorites, target),
    [favorites],
  );

  return { favorites, toggle, isFavorited: check, hydrated };
}
