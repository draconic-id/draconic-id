import { PrismaClient } from '@/prisma/generated';
import { unstable_cache } from 'next/cache';
import MapClient, { type ProfilePoint } from './map-client';

const prisma = new PrismaClient();

/** Great-circle distance in km */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Picks `count` profiles spread out across the globe; optionally ensures a requiredId is included. */
function selectSpreadProfiles(profiles: ProfilePoint[], count: number, requiredId?: string): ProfilePoint[] {
  const valid = profiles.filter((p) => p.latitude != null && p.longitude != null && p.avatar);
  if (valid.length <= count) return valid;

  const selected: ProfilePoint[] = [];
  const remaining = [...valid];

  if (requiredId) {
    const req = remaining.find((p) => p.id === requiredId);
    if (req) {
      selected.push(req);
      remaining.splice(remaining.indexOf(req), 1);
    }
  }

  while (selected.length < count && remaining.length > 0) {
    let maxMin = -1;
    let bestIdx = 0;
    for (let i = 0; i < remaining.length; i++) {
      const c = remaining[i];
      const minDist = selected.length
        ? Math.min(
            ...selected.map((s) => haversineDistance(s.latitude!, s.longitude!, c.latitude!, c.longitude!))
          )
        : Infinity;
      if (minDist > maxMin) {
        maxMin = minDist;
        bestIdx = i;
      }
    }
    selected.push(remaining.splice(bestIdx, 1)[0]);
  }

  return selected.slice(0, count);
}

const getSpreadProfiles = unstable_cache(
  async (requiredId: string | undefined, sample: number, count: number) => {
    const pool = await prisma.$queryRaw<ProfilePoint[]>`
      SELECT id, "latitude", "longitude", "avatar"
      FROM "profile"
      WHERE "latitude" IS NOT NULL
        AND "longitude" IS NOT NULL
        AND "avatar" IS NOT NULL
        AND "privacy" IN ('PUBLIC', 'UNLISTED')
      ORDER BY RANDOM()
      LIMIT ${sample}
    `;

    if (requiredId && !pool.some((p) => p.id === requiredId)) {
      const required = await prisma.profile.findUnique({
        where: { id: requiredId },
        select: { id: true, latitude: true, longitude: true, avatar: true },
      });
      if (required?.latitude != null && required.longitude != null && required.avatar) {
        if (pool.length >= count * 5) pool.pop();
        pool.push(required as ProfilePoint);
      }
    }

    return selectSpreadProfiles(pool, count, requiredId);
  },
  ['landing-map_spread-profiles_v1'],
  { revalidate: 60 * 60 * 24 } // 1 day
);

export type LandingMapProps = {
  /** how many profiles to show on the map */
  count?: number;
  /** how many to sample from DB before the spread-selection */
  sample?: number; // default 250
  /** ensure a specific profile is part of the result (if valid) */
  requiredId?: string;
  /** pass-through styling for the map container */
  className?: string;
  style?: React.CSSProperties;
};

export default async function LandingMap({
  count = 20,
  sample = 250,
  requiredId = 'PkKltWOmS3dhUhUR',
  className,
  style,
}: LandingMapProps) {
  const spreadProfiles = await getSpreadProfiles(requiredId, sample, count);
  return <MapClient profiles={spreadProfiles} className={className} style={style} />;
}
