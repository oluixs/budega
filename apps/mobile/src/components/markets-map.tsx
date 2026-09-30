import { useEffect, useMemo, useRef } from "react";
import { Linking, Platform, View } from "react-native";
import { router } from "expo-router";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import type { Coordinates } from "@budega/shared";

export interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
  /** Rota interna do app (ex.: /mercados/cometa-supermercados). */
  href?: string;
  routeUrl?: string;
}

interface MarketsMapProps {
  points: MapPoint[];
  userLocation?: Coordinates | null;
  fallbackCenter: Coordinates;
  height?: number;
  /** Zoom inicial sobre `fallbackCenter` (padrão 12). Só importa quando `fitToPoints` é false. */
  zoom?: number;
  /**
   * Ajusta o zoom para caber todos os pontos (padrão true). Desligue para um mapa geral
   * que não deve encolher por causa de uma loja distante (ex.: interior do estado).
   */
  fitToPoints?: boolean;
}

// Mesmos tiles/atribuição da web (OpenStreetMap, sem chave). Configurável para tráfego alto.
const TILE_URL = process.env.EXPO_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  process.env.EXPO_PUBLIC_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/** JSON seguro para embutir num <script>: nada de "</script>" vindo de dados de terceiros. */
function safeJson(value: unknown): string {
  // "<" e U+2028/U+2029 (quebras de linha para JS antigo) viram escapes \uXXXX.
  const unsafe = new RegExp("[<" + String.fromCharCode(0x2028, 0x2029) + "]", "g");
  return JSON.stringify(value).replace(unsafe, (char) => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0"));
}

function buildHtml(props: MarketsMapProps): string {
  const data = safeJson({
    points: props.points,
    user: props.userLocation ?? null,
    center: props.fallbackCenter,
    zoom: props.zoom ?? 12,
    fitToPoints: props.fitToPoints ?? true,
    tileUrl: TILE_URL,
    attribution: ATTRIBUTION,
  });
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="">
<style>
  html, body, #map { height: 100%; margin: 0; }
  body { font-family: -apple-system, Roboto, sans-serif; }
  .p-title { font-weight: 600; font-size: 15px; color: #211F1A; }
  .p-sub { font-size: 13px; color: #4A463D; margin-top: 2px; }
  .p-actions { display: flex; gap: 12px; margin-top: 8px; }
  .p-actions button { background: none; border: 0; padding: 6px 0; color: #175C3A; font-weight: 600; font-size: 14px; text-decoration: underline; }
</style></head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
<script>
  var data = ${data};
  function post(message) {
    var text = JSON.stringify(message);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(text);
    else window.parent.postMessage(text, "*");
  }
  var map = L.map("map").setView([data.center.latitude, data.center.longitude], data.zoom);
  L.tileLayer(data.tileUrl, { attribution: data.attribution, maxZoom: 19 }).addTo(map);
  var storeIcon = L.divIcon({ className: "", iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -12],
    html: '<span style="display:block;width:22px;height:22px;border-radius:9999px;background:#1F7A4D;border:3px solid #fff;box-shadow:0 1px 4px rgba(33,31,26,.45)"></span>' });
  var bounds = [];
  data.points.forEach(function (point) {
    // Popup montado com textContent: nomes/endereços vêm de sites de terceiros.
    var box = document.createElement("div");
    var title = document.createElement("div"); title.className = "p-title"; title.textContent = point.title; box.appendChild(title);
    if (point.subtitle) { var sub = document.createElement("div"); sub.className = "p-sub"; sub.textContent = point.subtitle; box.appendChild(sub); }
    var actions = document.createElement("div"); actions.className = "p-actions";
    if (point.href) { var open = document.createElement("button"); open.textContent = "Ver mercado"; open.onclick = function () { post({ type: "open", href: point.href }); }; actions.appendChild(open); }
    if (point.routeUrl) { var route = document.createElement("button"); route.textContent = "Como chegar"; route.onclick = function () { post({ type: "route", url: point.routeUrl }); }; actions.appendChild(route); }
    box.appendChild(actions);
    L.marker([point.latitude, point.longitude], { icon: storeIcon, title: point.title }).addTo(map).bindPopup(box);
    bounds.push([point.latitude, point.longitude]);
  });
  if (data.user) {
    L.marker([data.user.latitude, data.user.longitude], { title: "Você está aqui", icon: L.divIcon({ className: "", iconSize: [18, 18], iconAnchor: [9, 9],
      html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#2563A3;border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,163,.25)"></span>' }) }).addTo(map);
    bounds.push([data.user.latitude, data.user.longitude]);
  }
  if (data.fitToPoints) {
    if (bounds.length === 1) map.setView(bounds[0], 15);
    else if (bounds.length > 1) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
  }
</script></body></html>`;
}

/**
 * Mapa interativo (Leaflet + OpenStreetMap numa WebView — funciona no Expo Go, sem chave de
 * API). A lista de mercados continua na tela, como alternativa acessível.
 */
export function MarketsMap({ height = 360, points, userLocation, fallbackCenter, zoom, fitToPoints }: MarketsMapProps) {
  const html = useMemo(
    () => buildHtml({ points, userLocation, fallbackCenter, zoom, fitToPoints }),
    [points, userLocation, fallbackCenter, zoom, fitToPoints],
  );

  return (
    <View
      style={{ height }}
      className="overflow-hidden rounded-xl border border-neutral-300"
      accessibilityLabel="Mapa com as lojas dos mercados"
    >
      {Platform.OS === "web" ? (
        <WebMapFrame html={html} />
      ) : (
        <WebView
          originWhitelist={["*"]}
          source={{ html }}
          onMessage={(event: WebViewMessageEvent) => handleMapMessage(event.nativeEvent.data)}
          javaScriptEnabled
          setSupportMultipleWindows={false}
        />
      )}
    </View>
  );
}

function handleMapMessage(data: unknown) {
  try {
    const message = JSON.parse(String(data)) as { type: string; href?: string; url?: string };
    // Só aceita rotas internas conhecidas e links https — nada de esquemas arbitrários.
    if (message.type === "open" && message.href?.startsWith("/mercados/")) router.push(message.href as never);
    if (message.type === "route" && message.url && /^https:\/\//.test(message.url)) void Linking.openURL(message.url);
  } catch {
    // Mensagem inesperada da página do mapa: ignora.
  }
}

/** Versão web (Expo web / pré-visualização no navegador): o mesmo HTML num iframe. */
function WebMapFrame({ html }: { html: string }) {
  const frame = useRef<HTMLIFrameElement | null>(null);
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // Só mensagens do próprio iframe do mapa.
      if (event.source === frame.current?.contentWindow) handleMapMessage(event.data);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return (
    <iframe
      ref={frame}
      srcDoc={html}
      title="Mapa com as lojas dos mercados"
      sandbox="allow-scripts"
      style={{ border: 0, width: "100%", height: "100%" }}
    />
  );
}
