import * as React from 'react';
import Map from '@/components/map';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

import { PrismaClient, Privacy } from '@/prisma/generated';
const prisma = new PrismaClient();

export default async function Page() {
    const session = await auth.api.getSession({ headers: await headers() });

    const profiles = await prisma.profile.findMany({
        where: {
            latitude: { not: null },
            longitude: { not: null },
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
            user: true,
        },
        orderBy: {
            id: 'desc'
        }
    }).then(profiles => profiles.sort(() => Math.random() - 0.5))

    return (
        <>
         <Map profiles={profiles}>
         </Map>
        </>
    )
}