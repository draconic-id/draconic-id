'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useRef, useEffect } from 'react';
import { default as ReactMap, NavigationControl, Marker, MapRef, AttributionControl } from 'react-map-gl/mapbox';

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
    const mapRef = useRef<MapRef>(null);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const apply = () => {
            const map = mapRef.current?.getMap?.();
            if (map) map.setConfigProperty('basemap', 'lightPreset', mq.matches ? 'night' : 'day');
        };
        apply();
        mq.addEventListener('change', apply);
        return () => mq.removeEventListener('change', apply);
    }, []);

    const handleMapClick = (event: any) => {
        const { lng, lat } = event.lngLat;
        onLocationChange?.(lat, lng);
    };

    return (
        <div className="rounded-lg overflow-hidden">
            <ReactMap
                ref={mapRef}
                projection={'mercator'}
                renderWorldCopies={false}
                initialViewState={{
                    longitude: initialLongitude || 10.44783,
                    latitude: initialLatitude || 51.16382,
                    zoom: 3
                }}
                style={{ width: '100%', height: '200px' }}
                cooperativeGestures={false}
                attributionControl={false}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                mapStyle="mapbox://styles/mapbox/standard?optimize=true"
                onClick={handleMapClick}
                onLoad={() => {
                    const map = mapRef.current?.getMap?.();
                    if (map) {
                        map.setConfigProperty('basemap', 'lightPreset', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day');
                        setTimeout(() => map.resize(), 0);
                    }
                }}
            >
                <NavigationControl position="bottom-left" />
                {marker && (
                    <Marker longitude={marker.lng} latitude={marker.lat} />
                )}
                <AttributionControl compact />
            </ReactMap>
        </div>
    );
}