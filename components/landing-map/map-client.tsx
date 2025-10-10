'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import Link from 'next/link';
import { default as ReactMap, Marker, MapRef } from 'react-map-gl/maplibre';
import { useRef } from 'react';
import Image from 'next/image';

export type ProfilePoint = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  avatar: string | null;
};

export type MapClientProps = {
  profiles: ProfilePoint[];
  /** Apply size via this wrapper (e.g., className="h-[480px] w-full") */
  className?: string;
  /** Optional inline size for the wrapper (rarely needed) */
  style?: React.CSSProperties;
};

export default function MapClient({ profiles, className, style }: MapClientProps) {
  const mapRef = useRef<MapRef | null>(null);

  // Spin & interaction state
  const spinningRef = useRef(false);
  const pointerDownRef = useRef(false);
  const draggingRef = useRef(false);
  const idleResumeScheduledRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validProfiles = profiles.filter(
    (p) =>
      p.latitude !== null &&
      p.longitude !== null &&
      p.avatar &&
      !Number.isNaN(p.latitude) &&
      !Number.isNaN(p.longitude) &&
      p.latitude! >= -90 &&
      p.latitude! <= 90 &&
      p.longitude! >= -180 &&
      p.longitude! <= 180
  );

  const handleLoad = () => {
    const map = mapRef.current?.getMap() as any;
    if (!map) return;

    const STEP_LNG = 120; // degrees per step (westward)
    const STEP_DURATION = 12000; // ms per step

    const clearResumeTimeout = () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
    };

    const isIdle = () => {
      const moving = typeof map.isMoving === 'function' ? map.isMoving() : false;
      const easing = typeof map.isEasing === 'function' ? map.isEasing() : false;
      return !moving && !easing;
    };

    const step = () => {
      if (!spinningRef.current) return;
      const c = map.getCenter();
      const nextLng = c.lng - STEP_LNG; // spin westward
      map.easeTo({
        center: [nextLng, c.lat],
        duration: STEP_DURATION,
        easing: (t: number) => t, // linear
        animate: true,
        bearing: 0,
        pitch: 0,
      });
      map.once('moveend', () => {
        if (spinningRef.current) step();
      });
    };

    const start = () => {
      if (spinningRef.current) return;
      if (pointerDownRef.current || draggingRef.current) return;
      if (!isIdle()) return;
      spinningRef.current = true;
      step();
    };

    const stop = () => {
      if (!spinningRef.current) return;
      spinningRef.current = false;
      clearResumeTimeout();
      map.stop?.();
    };

    const resumeWhenIdle = () => {
      if (idleResumeScheduledRef.current) return;
      idleResumeScheduledRef.current = true;

      clearResumeTimeout();
      resumeTimeoutRef.current = setTimeout(() => {
        if (!pointerDownRef.current && !draggingRef.current && isIdle()) {
          idleResumeScheduledRef.current = false;
          start();
          return;
        }
        map.once('idle', () => {
          idleResumeScheduledRef.current = false;
          if (!pointerDownRef.current && !draggingRef.current) start();
        });
      }, 600);
    };

    if (map.loaded?.()) start();
    else map.once('load', start);

    const onPointerDown = () => {
      pointerDownRef.current = true;
      stop();
    };
    const onPointerUp = () => {
      pointerDownRef.current = false;
      resumeWhenIdle();
    };
    const onDragStart = () => {
      draggingRef.current = true;
      stop();
    };
    const onDragEnd = () => {
      draggingRef.current = false;
      resumeWhenIdle();
    };
    const onWheel = () => {
      stop();
      resumeWhenIdle();
    };

    map.on('mousedown', onPointerDown);
    map.on('touchstart', onPointerDown);
    map.on('mouseup', onPointerUp);
    map.on('touchend', onPointerUp);
    map.on('dragstart', onDragStart);
    map.on('dragend', onDragEnd);
    map.on('wheel', onWheel);
  };

  return (
    <div className={className} style={style}>
      <ReactMap
        ref={mapRef}
        onLoad={handleLoad}
        initialViewState={{
          longitude: 10, // focus on Europe
          latitude: 25,
          zoom: 1.35,
          bearing: 0,
          pitch: 0,
        }}
        /** Map fills its wrapper; size the wrapper instead */
        style={{ width: '100%', height: '100%' }}
        projection="globe"
        mapStyle={'https://demotiles.maplibre.org/style.json'}
        attributionControl={false}
        cooperativeGestures={false}
        dragPan={true}
        dragRotate={false}
        scrollZoom={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
        keyboard={false}
        boxZoom={false}
        canvasContextAttributes={{
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
          desynchronized: false
        }}

      >
        {validProfiles.map((p) => {
          const avatarSrc = `${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${process.env.NEXT_PUBLIC_MINIO_BUCKET}/avatars/${p.avatar}`;
          return (
            <Marker
              key={p.id}
              longitude={p.longitude!}
              latitude={p.latitude!}
              anchor="center"
              pitchAlignment="viewport"
            >
              <Link href={`/profile/${p.id}`} onClick={(e) => e.stopPropagation()}>
                <Image
                  src={avatarSrc}
                  alt=""
                  className="h-10 w-10 rounded-full border border-black/20 shadow cursor-pointer bg-foreground"
                  draggable={false}
                  height="40"
                  width="40"
                />
              </Link>
            </Marker>
          );
        })}
      </ReactMap>
    </div>
  );
}
