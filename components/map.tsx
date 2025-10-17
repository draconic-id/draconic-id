'use client';

import 'mapbox-gl/dist/mapbox-gl.css'; // Mapbox
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
// import 'maplibre-gl/dist/maplibre-gl.css'; // Maplibre

import { default as ReactMap, GeolocateControl, NavigationControl, FullscreenControl, ScaleControl, Source, Layer, Marker, Popup, MapRef, AttributionControl } from 'react-map-gl/mapbox';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
// import Map, { GeolocateControl, NavigationControl, FullscreenControl, ScaleControl, Source, Layer, Marker, Popup } from 'react-map-gl/maplibre'; // Maplibre

import { Prisma } from '@/prisma/generated';
import { useSearchParams } from 'next/navigation';

type ProfileWithUser = Prisma.ProfileGetPayload<{
    include: { user: true }
}>;

export default function Map({ profiles }: { profiles: ProfileWithUser[] }) {

    const [popup, setPopup] = useState('');

    const isValidCoordinate = (lat: number | null, lng: number | null): boolean => {
        return lat !== null && lng !== null &&
            lat >= -90 && lat <= 90 &&
            lng >= -180 && lng <= 180 &&
            !isNaN(lat) && !isNaN(lng);
    };

    const validProfiles = profiles.filter(profile =>
        isValidCoordinate(profile.latitude, profile.longitude)
    );

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

    const query = useSearchParams().get('profile');

    return (
        <ReactMap
            ref={mapRef}
            initialViewState={{
                longitude: 10.44783,
                latitude: 51.16382,
                zoom: 3
            }}
            style={{ width: '100dvw', height: '100dvh' }}

            projection={'globe'}

            cooperativeGestures={false}
            attributionControl={false}

            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN} // Mapbox
            mapStyle="mapbox://styles/mapbox/standard?optimize=true" // Mapbox
            // mapStyle={"https://demotiles.maplibre.org/style.json"} // MapLibre

            antialias={false}

            onLoad={() => {
                const map = mapRef.current?.getMap?.();
                if (map) map.setConfigProperty('basemap', 'lightPreset', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day');
                if (query) {
                    setPopup(query);
                    const profile = validProfiles.find(p => p.id === query);
                    if (profile) {
                        mapRef.current?.flyTo({
                            center: [profile.longitude!, profile.latitude!],
                            zoom: 10
                        });
                    }
                }
            }}
        >

            <NavigationControl position="bottom-left" />

            <AttributionControl compact />


            {
                validProfiles.map((profile, index) => (

                    <div key={profile.id}>
                        <Marker
                            key={profile.id}
                            longitude={profile.longitude!}
                            latitude={profile.latitude!}
                            anchor="center"
                            // offset={[0, 0]}
                            pitchAlignment="viewport"
                            onClick={e => {
                                // If we let the click event propagates to the map, it will immediately close the popup
                                // with `closeOnClick: true`
                                e.originalEvent.stopPropagation();
                                setPopup(profile.id);
                            }}
                        >

                            <Avatar className="h-12 w-12 border-2 bg-slate-800 cursor-pointer">

                                {profile.avatar && <AvatarImage src={`/_next/image?url=${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${process.env.NEXT_PUBLIC_MINIO_BUCKET}/avatars/${profile.avatar}&w=48&q=75`} />}

                                <AvatarFallback>{profile.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Marker>

                        {popup == profile.id && (
                            <Popup
                                anchor="top"
                                offset={[0, 32]}
                                longitude={profile.longitude!}
                                latitude={profile.latitude!}
                                onClose={() => setPopup('')}
                            >
                                <>
                                    <div className="text-black text-base">
                                        <p className='text-xl font-bold truncate'>{profile.user.name}</p>
                                        {profile.tagline}<br /><br />
                                    </div>

                                    <Button asChild>
                                        <Link href={'/profile/' + profile.id}>View profile</Link>
                                    </Button>
                                </>
                            </Popup>
                        )}
                    </div>
                ))
            }

        </ReactMap >
    );
}