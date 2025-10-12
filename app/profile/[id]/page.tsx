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

function getLinkIcon(url?: string): IconType {
  if (!url) return ExternalLink;

  let host = '';
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return ExternalLink;
  }

  if (host.endsWith('t.me') || host.endsWith('telegram.me')) return SiTelegram;
  if (host.includes('furaffinity.net')) return SiFuraffinity;
  if (host.includes('twitter.com') || host.includes('x.com')) return SiX;
  if (host.includes('mastodon')) return SiMastodon;
  if (host.includes('bsky.app')) return SiBluesky;
  if (host.includes('matrix.to') || host.includes('matrix.org')) return SiMatrix;
  if (host.includes('discord.gg') || host.includes('discord.com')) return SiDiscord;
  if (host.includes('deviantart.com')) return SiDeviantart;
  if (host.includes('tiktok.com')) return SiTiktok;
  if (host.includes('youtube.com') || host.includes('youtu.be')) return SiYoutube;
  if (host.includes('geocaching.com')) return SiGeocaching;
  if (host.includes('carrd.co')) return SiCarrd;
  if (host.includes('github.com')) return SiGithub;
  if (host.includes('gitlab.com')) return SiGitlab;
  if (host.includes('spotify.com')) return SiSpotify;
  if (host.includes('playstation.com')) return SiPlaystation;
  if (host.includes('steampowered.com') || host.includes('steamcommunity.com')) return SiSteam;
  if (host.includes('ea.com') || host.includes('origin.com')) return SiEa;
  if (host.includes('facebook.com')) return SiFacebook;
  if (host.includes('ubisoft.com') || host.includes('uplay.com')) return SiUbisoft;
  if (host.includes('itch.io')) return SiItchdotio;
  if (host.includes('patreon.com')) return SiPatreon;
  if (host.includes('buymeacoffee.com')) return SiBuymeacoffee;
  if (host.includes('boosty.to')) return SiBoosty;
  if (host.includes('soundcloud.com')) return SiSoundcloud;
  if (host.includes('whatsapp.com')) return SiWhatsapp;
  if (host.includes('signal.org')) return SiSignal;
  if (host.includes('tumblr.com')) return SiTumblr;
  if (host.includes('artstation.com')) return SiArtstation;
  if (host.includes('twitch.tv')) return SiTwitch;
  if (host.includes('bandcamp.com')) return SiBandcamp;
  if (host.includes('battle.net') || host.includes('blizzard.com')) return SiBattledotnet;
  if (host.includes('paypal.com')) return SiPaypal;
  if (host.includes('mihoyo.com') || host.includes('hoyoverse.com')) return SiMihoyo;
  if (host.includes('sketchfab.com')) return SiSketchfab;
  if (host.includes('epicgames.com')) return SiEpicgames;
  if (host.includes('rockstargames.com')) return SiRockstargames;
  if (host.includes('roblox.com')) return SiRoblox;
  if (host.includes('kickstarter.com')) return SiKickstarter;
  if (host.includes('instagram.com')) return SiInstagram;
  if (host.includes('reddit.com')) return SiReddit;
  if (host.includes('threads.net')) return SiThreads;
  if (host.includes('snapchat.com')) return SiSnapchat;
  if (host.includes('pinterest.com')) return SiPinterest;
  if (host.includes('gog.com')) return SiGogdotcom;
  if (host.includes('figma.com')) return SiFigma;
  if (host.includes('vrchat.com')) return SiVrchat;
  if (host.includes('medium.com')) return SiMedium;
  if (host.includes('etsy.com')) return SiEtsy;
  if (host.includes('nintendo.com') || host.includes('nintendo.net')) return SiNintendo;
  if (host.includes('mailhide.io') || url.toLowerCase().startsWith('mailto:')) return Mail;

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

    const links: { name: string; url: string }[] = Array.isArray(profile.links)
        ? (profile.links as { name: string; url: string }[])
        : [];


    const profileColors = profile.color ? getProfileColors(profile.color) : null;

    return (
        <div className="w-full min-h-dvh" style={profileColors ? { backgroundColor: profileColors.backgroundColor, color: profileColors.textColor } : {}}>
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

                <div className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-row items-center gap-4" style={{ ...(profileColors?.backgroundColorCard && { background: profileColors.backgroundColorCard }), ...(profileColors?.backgroundColor && { '--muted-foreground': profileColors.textColorMuted }), ...(profileColors?.backgroundColorMuted && { '--muted': profileColors.backgroundColorMuted }), ...(profileColors?.textColor && { '--foreground': profileColors.textColor }) } as React.CSSProperties}>
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
                        {links.length > 0 && (
                            <div className="flex gap-2 mt-1 flex-wrap">
                                {links.map((link, index) => {
                                    const IconComponent = getLinkIcon(link.url);
                                    return (
                                        <a
                                            key={`${link.name}-${index}`}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm underline flex items-center gap-1"
                                            aria-label={link.name}
                                        >
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