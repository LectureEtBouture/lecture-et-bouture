'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { storeConfig } from '@/lib/config';

const POSITION: [number, number] = [
    storeConfig.coords.lat,
    storeConfig.coords.lng,
];

const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${POSITION[0]},${POSITION[1]}`;

const markerIcon = L.divIcon({
    html: `<div style="
        width:20px;height:20px;border-radius:50% 50% 50% 0;
        background:#2d4b3e;transform:rotate(-45deg);
        border:2px solid #f5f4ef;box-shadow:0 1px 4px rgba(0,0,0,.3)
    "></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -22],
});

export function StoreMap() {
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `.leaflet-container { border-radius: 0; }`;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="relative border border-border">
            <MapContainer
                center={POSITION}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: '320px', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={POSITION} icon={markerIcon}>
                    <Popup>
                        <span className="text-xs font-medium">
                            {storeConfig.name}
                        </span>
                    </Popup>
                </Marker>
            </MapContainer>

            <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 z-[1000] flex items-center gap-2 bg-background border border-border text-primary text-[11px] uppercase tracking-[0.1em] font-medium px-4 py-2.5 shadow-sm hover:bg-surface transition-colors"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                Itinéraire
            </a>
        </div>
    );
}
