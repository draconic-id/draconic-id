// app/directory/page.tsx
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { PrismaClient, Privacy } from '@/prisma/generated';
const prisma = new PrismaClient();

import ProfilesTable from "@/components/profiles-table";

export const metadata = { title: "Directory" };

export default async function Page() {
    const session = await auth.api.getSession({ headers: await headers() });
    const viewerId = session?.user?.id ?? null;

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
        <>
            <div className="h-16 w-1" />
            <div className="flex flex-col items-center max-w-6xl mx-auto px-6 py-20">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Your dragon address book</h1>
                    <p className="text-lg">{`This directory lists all dragons that have made their profile visible. Search for names,${session ? " see who's nearby," : ""} check upcoming birthdays and more. You can also query profile information programatically using our APIs. More information about this will be available soon.`}</p>
                </div>
            </div>
            <div className="p-6 max-w-7xl ml-auto mr-auto">
                <ProfilesTable data={rows} viewerCoords={viewerCoords} />
            </div>
        </>
    );
}
