'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useState } from 'react';
import { default as ReactMap, NavigationControl, Marker } from 'react-map-gl/mapbox';

interface MapPickerProps {
    initialLatitude?: number;
    initialLongitude?: number;
    latitude?: number;
    longitude?: number;
    onLocationChange?: (lat: number, lng: number) => void;
}

export default function MapPicker({ initialLatitude, initialLongitude, latitude, longitude, onLocationChange }: MapPickerProps) {
    const isValidCoords = (lat?: number, lng?: number) => 
        lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    
    const marker = isValidCoords(latitude, longitude) ? { lat: latitude!, lng: longitude! } : null;

    const handleMapClick = (event: any) => {
        const { lng, lat } = event.lngLat;
        onLocationChange?.(lat, lng);
    };

    return (
        <div className="rounded-lg overflow-hidden">
            <ReactMap
                initialViewState={{
                    longitude: initialLongitude || 10.44783,
                    latitude: initialLatitude || 51.16382,
                    zoom: 3
                }}
                style={{ width: '100%', height: '200px' }}
                cooperativeGestures={false}
                attributionControl={false}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                mapStyle="mapbox://styles/jelle619/clsewc2fo01rg01pedk0774k7"
                onClick={handleMapClick}
            >
                <NavigationControl position="bottom-left" />
                {marker && (
                    <Marker longitude={marker.lng} latitude={marker.lat} />
                )}
            </ReactMap>
        </div>
    );
}