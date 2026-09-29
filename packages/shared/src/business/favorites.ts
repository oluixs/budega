import type { Favorite } from "../types/index";

export interface LocalFavorite {
  market_id: string | null;
  offer_id: string | null;
  created_at: string;
}

/** Regra de negócio: favoritos anônimos podem ser salvos localmente (sem cadastro). */
export function addLocalFavorite(
  favorites: LocalFavorite[],
  target: { market_id?: string | null; offer_id?: string | null },
  now: Date = new Date(),
): LocalFavorite[] {
  if (isFavorited(favorites, target)) return favorites;
  return [
    ...favorites,
    {
      market_id: target.market_id ?? null,
      offer_id: target.offer_id ?? null,
      created_at: now.toISOString(),
    },
  ];
}

export function removeLocalFavorite(
  favorites: LocalFavorite[],
  target: { market_id?: string | null; offer_id?: string | null },
): LocalFavorite[] {
  return favorites.filter(
    (favorite) =>
      !(
        favorite.market_id === (target.market_id ?? null) &&
        favorite.offer_id === (target.offer_id ?? null)
      ),
  );
}

export function isFavorited(
  favorites: LocalFavorite[],
  target: { market_id?: string | null; offer_id?: string | null },
): boolean {
  return favorites.some(
    (favorite) =>
      favorite.market_id === (target.market_id ?? null) &&
      favorite.offer_id === (target.offer_id ?? null),
  );
}

export function toggleLocalFavorite(
  favorites: LocalFavorite[],
  target: { market_id?: string | null; offer_id?: string | null },
  now: Date = new Date(),
): LocalFavorite[] {
  return isFavorited(favorites, target)
    ? removeLocalFavorite(favorites, target)
    : addLocalFavorite(favorites, target, now);
}

export function mergeFavorites(remote: Favorite[], local: LocalFavorite[]): LocalFavorite[] {
  const remoteAsLocal: LocalFavorite[] = remote.map((favorite) => ({
    market_id: favorite.market_id,
    offer_id: favorite.offer_id,
    created_at: favorite.created_at,
  }));
  const merged = [...remoteAsLocal];
  for (const favorite of local) {
    if (!isFavorited(merged, favorite)) merged.push(favorite);
  }
  return merged;
}
