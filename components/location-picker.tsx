'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import MapPicker from './map-picker';

interface LocationPickerProps {
    initialLatitude?: number;
    initialLongitude?: number;
}

export default function LocationPicker({ initialLatitude, initialLongitude }: LocationPickerProps) {
    const [latitude, setLatitude] = useState(initialLatitude?.toString() || '');
    const [longitude, setLongitude] = useState(initialLongitude?.toString() || '');

    const handleLocationChange = (lat: number, lng: number) => {
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
    };

    const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const num = parseFloat(value);
        if (value === '' || (!isNaN(num) && num >= -90 && num <= 90)) {
            setLatitude(value);
        }
    };

    const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const num = parseFloat(value);
        if (value === '' || (!isNaN(num) && num >= -180 && num <= 180)) {
            setLongitude(value);
        }
    };

    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);

    return (
        <>
            <MapPicker
                initialLatitude={initialLatitude}
                initialLongitude={initialLongitude}
                latitude={parsedLat}
                longitude={parsedLng}
                onLocationChange={handleLocationChange}
            />
            <div className="grid grid-cols-2 gap-4">
                <Input
                    id="latitude"
                    name="latitude"
                    value={latitude}
                    onChange={handleLatitudeChange}
                    placeholder="50.7265"
                    min="-90"
                    max="90"
                    step="any"
                />
                <Input
                    id="longitude"
                    name="longitude"
                    value={longitude}
                    onChange={handleLongitudeChange}
                    placeholder="76.9174"
                    min="-180"
                    max="180"
                    step="any"
                />
            </div>
        </>
    );
}