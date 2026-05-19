'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const POSITION: [number, number] = [48.8584, 2.2945];

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
        return () => { document.head.removeChild(style); };
    }, []);

    return (
        <MapContainer
            center={POSITION}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: '320px', width: '100%' }}
            className="border border-border"
        >
            <TileLayer
                attribution='&copy; <a href="https://carto.com">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <Marker position={POSITION} icon={markerIcon}>
                <Popup>
                    <span className="text-xs font-medium">Lecture &amp; Boutures</span>
                </Popup>
            </Marker>
        </MapContainer>
    );
}
