"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

interface MapLocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

const PHNOM_PENH_LAT = 11.5564;
const PHNOM_PENH_LNG = 104.9282;

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function MapLocationPicker({ latitude, longitude, onChange }: MapLocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  );

  useEffect(() => {
    if (position) {
      if (position[0] !== latitude || position[1] !== longitude) {
        onChange(position[0], position[1]);
      }
    }
  }, [position, latitude, longitude, onChange]);

  return (
    <div className="w-full h-[300px] rounded-md overflow-hidden border border-slate-300 relative z-0 mt-2">
      <MapContainer
        center={position || [PHNOM_PENH_LAT, PHNOM_PENH_LNG]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      {!position && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[1000]">
          <div className="bg-white/90 px-4 py-2 rounded-full shadow-md text-xs font-bold text-slate-700">
            Click on the map to drop a pin
          </div>
        </div>
      )}
    </div>
  );
}
