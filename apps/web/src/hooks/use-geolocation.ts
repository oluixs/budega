"use client";

import { useCallback, useState } from "react";
import type { Coordinates } from "@budega/shared";

interface GeolocationState {
  coordinates: Coordinates | null;
  status: "idle" | "loading" | "success" | "error" | "unsupported";
  errorMessage: string | null;
}

/** Usa o botão "Usar minha localização" da home/explorar, com fallback amigável. */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    status: "idle",
    errorMessage: null,
  });

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({
        coordinates: null,
        status: "unsupported",
        errorMessage: "Seu navegador não permite compartilhar localização.",
      });
      return;
    }

    setState((current) => ({ ...current, status: "loading", errorMessage: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          status: "success",
          errorMessage: null,
        });
      },
      (error) => {
        setState({
          coordinates: null,
          status: "error",
          errorMessage:
            error.code === error.PERMISSION_DENIED
              ? "Permissão de localização negada. Digite seu endereço ou bairro para buscar."
              : "Não foi possível obter sua localização agora. Tente digitar seu endereço.",
        });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  return { ...state, request };
}
