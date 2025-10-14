// app/directory/page.tsx
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { PrismaClient, Privacy } from '@/prisma/generated';
const prisma = new PrismaClient();

import ProfilesTable from "@/components/profiles-table";

// Cache TTL (seconds)
export const revalidate = 600;

export const metadata = { title: "Profiles" };

export default async function Page() {
    const session = await auth.api.getSession({ headers: await headers() });
    const viewerId = session?.user?.id ?? null;

    // Privacy filter with string literals only
    const visibilityFilter = !viewerId
        ? {
            OR: [{ privacy: "PUBLIC" }, { privacy: "UNLISTED" }],
        }
        : {
            OR: [
                { OR: [{ privacy: "PUBLIC" }, { privacy: "UNLISTED" }, { privacy: "HIDDEN" }] },
                { AND: [{ privacy: "PRIVATE" }, { userId: viewerId }] },
            ],
        };

    const profiles = await prisma.profile.findMany({
        where: {
            ...(session?.user ? {
                OR: [
                    { privacy: Privacy.PUBLIC },
                    { privacy: Privacy.UNLISTED },
                    { privacy: Privacy.HIDDEN },
                    { privacy: Privacy.PRIVATE, userId: session.user.id }
                ]
            } : {
                privacy: { in: [Privacy.PUBLIC, Privacy.UNLISTED] }
            })
        },
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                },
            },
        }
    });

    // Viewer coords for Distance column visibility
    const viewerProfile = viewerId
        ? await prisma.profile.findUnique({
            where: { userId: viewerId },
            select: { longitude: true, latitude: true },
        })
        : null;

    const viewerCoords =
        viewerProfile?.longitude != null && viewerProfile?.latitude != null
            ? { longitude: viewerProfile.longitude, latitude: viewerProfile.latitude }
            : null;

    // Flatten for the table
    const rows = profiles.map((p) => ({
        id: p.id, // profile id (used for link)
        avatar: p.avatar ?? p.user?.image ?? null,
        name: p.user?.name ?? "Unknown",
        tagline: p.tagline ?? "",
        birthDate: p.birthDate ? new Date(p.birthDate).toISOString() : null,
        showAge: p.showAge,
        longitude: p.longitude,
        latitude: p.latitude,
        color: p.color ?? "",
        createdAt: p.createdAt.toISOString(), // from Profile
        updatedAt: p.updatedAt.toISOString(), // from Profile
        userId: p.userId,
        profileId: p.id,
        privacy: p.privacy,
    }));

    return (
        <div className="p-6 space-y-6 pt-16">
            <ProfilesTable data={rows} viewerCoords={viewerCoords} />
        </div>
    );
}
