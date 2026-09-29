import * as Location from "expo-location";
import { useCallback, useState } from "react";
import type { Coordinates } from "@budega/shared";

interface GeolocationState {
  coordinates: Coordinates | null;
  status: "idle" | "loading" | "success" | "error" | "denied";
  errorMessage: string | null;
}

/**
 * Pede permissão de localização com explicação clara (a explicação em si fica no
 * componente de UI que chama `request`, ex.: um texto antes do botão) e retorna a
 * posição atual, com fallback amigável quando a permissão é negada.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    status: "idle",
    errorMessage: null,
  });

  const request = useCallback(async () => {
    setState((current) => ({ ...current, status: "loading", errorMessage: null }));

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setState({
        coordinates: null,
        status: "denied",
        errorMessage: "Permissão de localização negada. Você ainda pode buscar mercados pelo nome do bairro.",
      });
      return;
    }

    try {
      const position = await Location.getCurrentPositionAsync({});
      setState({
        coordinates: { latitude: position.coords.latitude, longitude: position.coords.longitude },
        status: "success",
        errorMessage: null,
      });
    } catch {
      setState({
        coordinates: null,
        status: "error",
        errorMessage: "Não foi possível obter sua localização agora.",
      });
    }
  }, []);

  return { ...state, request };
}
