import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { isFavorited, toggleLocalFavorite, type LocalFavorite } from "@budega/shared";

const STORAGE_KEY = "budega:favorites";

async function readStorage(): Promise<LocalFavorite[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalFavorite[]) : [];
  } catch {
    return [];
  }
}

async function writeStorage(favorites: LocalFavorite[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Armazenamento indisponível — favoritos são conveniência, não algo crítico.
  }
}

/** Favoritos anônimos salvos localmente (regra de negócio 10.6) — mesma ideia da web. */
export function useFavorites() {
  const [favorites, setFavorites] = useState<LocalFavorite[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    readStorage().then((stored) => {
      setFavorites(stored);
      setHydrated(true);
    });
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
