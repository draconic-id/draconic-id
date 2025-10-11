import type { Metadata } from 'next';

import { notFound, redirect } from 'next/navigation';
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { updateProfile, updateAbout } from './actions';
import About from '@/components/about';
import { getProfileColors } from '@/lib/utils';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import ProfileForm from '@/components/profile-form';

import { PencilLine } from 'lucide-react';

import { PrismaClient } from '@/prisma/generated';

const prisma = new PrismaClient();

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params;

    const profile = await prisma.profile.findUnique({
        where: { id },
        select: {
            privacy: true,
            user: { select: { name: true } },
        },
    });

    if (!profile) {
        // No profile found: don't index the 404
        return { robots: { index: false, follow: false } };
    }

    return {
        title: profile.user?.name ? `Profile of ${profile.user.name}` : 'Profile',
        robots: (profile.privacy === 'PUBLIC')
            ? { index: true, follow: true } // <meta name="robots" content="noindex,nofollow">
            : { index: false, follow: false },  // <meta name="robots" content="index,follow">
    };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })

    let profile = await prisma.profile.findUnique({
        where: {
            id: id,
        },
        include: {
            user: true,
        },
    }
    )

    if (!profile) {
        notFound();
    }

    if ((profile.privacy === 'HIDDEN' || profile.privacy === 'PRIVATE') && !session?.user.id) {
        redirect((await auth.api.signInSocial({ headers: await headers(), body: { provider: 'draconic-id', callbackURL: '/profile' } })).url || "")
    }

    const editable = (profile.userId === session?.user.id);

    if (profile.privacy === 'PRIVATE' && session?.user.id && !editable) {
        notFound();
    }

    const profileColors = profile.color ? getProfileColors(profile.color) : null;

    return (
        <div className="w-dvw min-h-dvh" style={profileColors ? { backgroundColor: profileColors.backgroundColor, color: profileColors.textColor } : {}}>
        <div className="max-w-4xl mx-auto px-4">
            <div className="w-1 h-16" />
            <h1>
                Profile <Dialog>
                    <DialogTrigger>{editable && <PencilLine className='cursor-pointer inline h-4 w-4' />}</DialogTrigger>
                    <DialogContent className="overflow-y-scroll max-h-screen">
                        <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                        </DialogHeader>
                        <ProfileForm action={updateProfile} profile={profile} />
                    </DialogContent>
                </Dialog>

            </h1>

            <div className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-row items-center gap-2" style={{...(profileColors?.backgroundColorCard && { background: profileColors.backgroundColorCard }), ...(profileColors?.backgroundColorMuted && { '--muted': profileColors.backgroundColorMuted }), ...(profileColors?.textColor && { '--foreground': profileColors.textColor })} as React.CSSProperties}>
                <Avatar className="border">
                    <AvatarImage src={profile.avatar ? `${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${process.env.NEXT_PUBLIC_MINIO_BUCKET}/avatars/${profile.avatar}` : undefined} />
                    <AvatarFallback>{profile.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p>
                    {profile.user.name}
                </p>
            </div>
            <br />
            <About
                initialAbout={profile.about}
                editable={editable}
                updateAbout={updateAbout}
                backgroundColor={profileColors?.backgroundColor}
                backgroundColorCard={profileColors?.backgroundColorCard}
                backgroundColorMuted={profileColors?.backgroundColorMuted}
                textColor={profileColors?.textColor}
                textColorMuted={profileColors?.textColorMuted}
            />
            <div className="w-1 h-16" />
        </div>
        </div>
    )
}