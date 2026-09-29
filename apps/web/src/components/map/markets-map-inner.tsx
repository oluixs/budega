"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { MarketsMapProps, MapPoint } from "./markets-map";

// OpenStreetMap não exige chave, mas pede atribuição visível e uso moderado. Para tráfego
// alto, configure um provedor de tiles (ex.: MapTiler, Stadia) nestas variáveis.
const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Marcadores em HTML/CSS com as cores da marca (evita as imagens padrão do Leaflet, que
// quebram com bundlers).
const storeIcon = L.divIcon({
  className: "",
  html: '<span style="display:block;width:22px;height:22px;border-radius:9999px;background:#1F7A4D;border:3px solid #fff;box-shadow:0 1px 4px rgba(33,31,26,.45)"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12],
});

const userIcon = L.divIcon({
  className: "",
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#2563A3;border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,163,.25)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitBounds({ points, userLocation }: Pick<MarketsMapProps, "points" | "userLocation">) {
  const map = useMap();
  useEffect(() => {
    const coords: [number, number][] = points.map((point) => [point.latitude, point.longitude]);
    if (userLocation) coords.push([userLocation.latitude, userLocation.longitude]);
    if (coords.length === 1) map.setView(coords[0]!, 15);
    else if (coords.length > 1) map.fitBounds(coords, { padding: [32, 32], maxZoom: 15 });
  }, [map, points, userLocation]);
  return null;
}

function PointPopup({ point }: { point: MapPoint }) {
  return (
    <div className="flex min-w-44 flex-col gap-1 font-sans">
      <strong className="text-body text-neutral-900">{point.title}</strong>
      {point.subtitle && <span className="text-caption text-neutral-500">{point.subtitle}</span>}
      <span className="mt-1 flex gap-3 text-caption font-medium">
        {point.href && (
          <a href={point.href} className="text-brand-600 underline">
            Ver mercado
          </a>
        )}
        {point.routeUrl && (
          <a href={point.routeUrl} target="_blank" rel="noreferrer" className="text-brand-600 underline">
            Como chegar
          </a>
        )}
      </span>
    </div>
  );
}

export default function MarketsMapInner({ points, userLocation, fallbackCenter, label }: MarketsMapProps) {
  return (
    <MapContainer
      center={[fallbackCenter.latitude, fallbackCenter.longitude]}
      zoom={12}
      scrollWheelZoom={false}
      className="h-full w-full"
      aria-label={label}
    >
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
      <FitBounds points={points} userLocation={userLocation} />
      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.latitude, point.longitude]}
          icon={storeIcon}
          title={point.title}
          alt={point.title}
        >
          <Popup>
            <PointPopup point={point} />
          </Popup>
        </Marker>
      ))}
      {userLocation && (
        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon} title="Você está aqui" />
      )}
    </MapContainer>
  );
}
