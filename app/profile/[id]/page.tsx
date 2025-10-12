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

import { PencilLine, ExternalLink, Mail, Cake, Egg } from 'lucide-react';
import { differenceInYears, format } from 'date-fns';
import { 
    SiTelegram, SiFuraffinity, SiX, SiMastodon, SiBluesky, SiMatrix, SiDiscord, SiDeviantart, SiTiktok, SiYoutube, 
    SiGeocaching, SiCarrd, SiGithub, SiGitlab, SiSpotify, SiPlaystation, SiSteam, SiEa, SiFacebook, SiUbisoft, 
    SiItchdotio, SiPatreon, SiBuymeacoffee, SiBoosty, SiSoundcloud, SiWhatsapp, SiSignal, SiTumblr, SiArtstation,
    SiTwitch, SiBandcamp, SiBattledotnet, SiPaypal, SiMihoyo, SiSketchfab, SiEpicgames, SiRockstargames, SiRoblox, SiKickstarter,
    SiInstagram, SiReddit, SiThreads, SiSnapchat, SiPinterest, SiGogdotcom, SiFigma, SiVrchat, SiMedium, SiEtsy, SiNintendo
} from 'react-icons/si';
import { IconType } from 'react-icons';

import { PrismaClient } from '@/prisma/generated';

const prisma = new PrismaClient();

function getLinkIcon(name: string): IconType {
    const normalizedName = name.toLowerCase();
    
    if (normalizedName.includes('telegram')) return SiTelegram;
    if (normalizedName.includes('fur affinity')) return SiFuraffinity;
    if (normalizedName.includes('x') || normalizedName.includes('twitter') || normalizedName.includes('x (twitter)') || normalizedName.includes('twitter (x)')) return SiX;
    if (normalizedName.includes('mastodon')) return SiMastodon;
    if (normalizedName.includes('bluesky')) return SiBluesky;
    if (normalizedName.includes('matrix')) return SiMatrix;
    if (normalizedName.includes('discord')) return SiDiscord;
    if (normalizedName.includes('deviantart')) return SiDeviantart;
    if (normalizedName.includes('tiktok')) return SiTiktok;
    if (normalizedName.includes('youtube')) return SiYoutube;
    if (normalizedName.includes('geocaching')) return SiGeocaching;
    if (normalizedName.includes('carrd')) return SiCarrd;
    if (normalizedName.includes('github')) return SiGithub;
    if (normalizedName.includes('gitlab')) return SiGitlab;
    if (normalizedName.includes('spotify')) return SiSpotify;
    if (normalizedName.includes('playstation')) return SiPlaystation;
    if (normalizedName.includes('steam')) return SiSteam;
    if (normalizedName.includes('ea') || normalizedName.includes('electronic arts')) return SiEa;
    if (normalizedName.includes('facebook')) return SiFacebook;
    if (normalizedName.includes('ubisoft') || normalizedName.includes('uplay')) return SiUbisoft;
    if (normalizedName.includes('itch.io')) return SiItchdotio;
    if (normalizedName.includes('patreon')) return SiPatreon;
    if (normalizedName.includes('buy me a coffee')) return SiBuymeacoffee;
    if (normalizedName.includes('boosty')) return SiBoosty;
    if (normalizedName.includes('soundcloud')) return SiSoundcloud;
    if (normalizedName.includes('whatsapp')) return SiWhatsapp;
    if (normalizedName.includes('signal')) return SiSignal;
    if (normalizedName.includes('tumblr')) return SiTumblr;
    if (normalizedName.includes('artstation')) return SiArtstation;
    if (normalizedName.includes('twitch')) return SiTwitch;
    if (normalizedName.includes('bandcamp')) return SiBandcamp;
    if (normalizedName.includes('battle.net')) return SiBattledotnet;
    if (normalizedName.includes('paypal')) return SiPaypal;
    if (normalizedName.includes('mihoyo')) return SiMihoyo;
    if (normalizedName.includes('sketchfab')) return SiSketchfab;
    if (normalizedName.includes('epic games')) return SiEpicgames;
    if (normalizedName.includes('rockstar games')) return SiRockstargames;
    if (normalizedName.includes('roblox')) return SiRoblox;
    if (normalizedName.includes('kickstarter')) return SiKickstarter;
    if (normalizedName.includes('instagram')) return SiInstagram;
    if (normalizedName.includes('reddit')) return SiReddit;
    if (normalizedName.includes('threads')) return SiThreads;
    if (normalizedName.includes('snapchat')) return SiSnapchat;
    if (normalizedName.includes('pinterest')) return SiPinterest;
    if (normalizedName.includes('gog') || normalizedName.includes('gog.com')) return SiGogdotcom;
    if (normalizedName.includes('figma')) return SiFigma;
    if (normalizedName.includes('vrchat')) return SiVrchat;
    if (normalizedName.includes('medium')) return SiMedium;
    if (normalizedName.includes('etsy')) return SiEtsy;
    if (normalizedName.includes('nintendo')) return SiNintendo;
    if (normalizedName.includes('email') || normalizedName.includes('e-mail') || normalizedName.includes('mail')) return Mail;
    
    return ExternalLink;
}

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
                        <ProfileForm action={updateProfile} profile={{
                            ...profile,
                            links: profile.links as { name: string; url: string }[] | null
                        }} />
                    </DialogContent>
                </Dialog>

            </h1>

            <div className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-row items-center gap-4" style={{...(profileColors?.backgroundColorCard && { background: profileColors.backgroundColorCard }), ...(profileColors?.backgroundColor&& { '--muted-foreground': profileColors.textColorMuted }), ...(profileColors?.backgroundColorMuted && { '--muted': profileColors.backgroundColorMuted }), ...(profileColors?.textColor && { '--foreground': profileColors.textColor })} as React.CSSProperties}>
                <Avatar className="border">
                    <AvatarImage src={profile.avatar ? `${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${process.env.NEXT_PUBLIC_MINIO_BUCKET}/avatars/${profile.avatar}` : undefined} />
                    <AvatarFallback>{profile.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <p>{profile.user.name}</p>
                        {profile.birthDate && (
                            <span className="text-muted-foreground text-sm flex items-center gap-1">
                                {profile.showAge ? (
                                    <>
                                        <Egg className="w-4 h-4" />
                                        {format(new Date(profile.birthDate), 'MMM d')} ({differenceInYears(new Date(), new Date(profile.birthDate))} y.o.)
                                    </>
                                ) : (
                                    <>
                                        <Cake className="w-4 h-4" />
                                        {format(new Date(profile.birthDate), 'MMM d')}
                                    </>
                                )}
                            </span>
                        )}
                    </div>
                    {profile.links && Array.isArray(profile.links) && profile.links.length > 0 && (
                        <div className="flex gap-2 mt-1 flex-wrap">
                            {(profile.links as { name: string; url: string }[]).map((link, index) => {
                                const IconComponent = getLinkIcon(link.name);
                                return (
                                    <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm underline flex items-center gap-1">
                                        <IconComponent className="w-4 h-4" />
                                        {link.name}
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>
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