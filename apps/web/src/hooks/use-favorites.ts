"use client";

import { useCallback, useSyncExternalStore } from "react";
import { isFavorited, toggleLocalFavorite, type LocalFavorite } from "@budega/shared";

const STORAGE_KEY = "budega:favorites";
const EMPTY: LocalFavorite[] = [];

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedSnapshot: LocalFavorite[] = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * useSyncExternalStore exige que chamadas repetidas sem mudança real retornem a mesma
 * referência — por isso o cache aqui, em vez de fazer JSON.parse a cada render.
 */
function getSnapshot(): LocalFavorite[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedSnapshot = raw ? (JSON.parse(raw) as LocalFavorite[]) : EMPTY;
    } catch {
      cachedSnapshot = EMPTY;
    }
  }
  return cachedSnapshot;
}

function getServerSnapshot(): LocalFavorite[] {
  return EMPTY;
}

function writeStorage(favorites: LocalFavorite[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Armazenamento indisponível (modo privado, quota excedida) — falha silenciosa,
    // já que favoritos são um recurso de conveniência, não crítico.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

/**
 * Favoritos anônimos, salvos localmente no navegador (regra de negócio 10.6).
 * Não exige cadastro. Quando o usuário faz login, isso pode ser mesclado com o
 * Supabase via mergeFavorites() de @budega/shared.
 *
 * Usa useSyncExternalStore (em vez de useEffect+setState) para ler o localStorage,
 * seguindo a recomendação do React para sincronizar com sistemas externos sem disparar
 * um setState síncrono dentro de um efeito.
 */
const noopSubscribe = () => () => {};

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // `typeof window !== "undefined"` aqui causava erro de hidratação (React #418): no
  // servidor era false (skeleton) e já no 1º render do cliente virava true (lista). Com
  // useSyncExternalStore o React usa o valor do servidor durante a hidratação e só
  // depois troca para true (ver .audit/errors/2026-09-29/).
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const toggle = useCallback((target: { market_id?: string | null; offer_id?: string | null }) => {
    writeStorage(toggleLocalFavorite(getSnapshot(), target));
  }, []);

  const check = useCallback(
    (target: { market_id?: string | null; offer_id?: string | null }) => isFavorited(favorites, target),
    [favorites],
  );

  return { favorites, toggle, isFavorited: check, hydrated };
}
