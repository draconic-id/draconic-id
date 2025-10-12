'use server'

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from '@/prisma/generated';
import { redirect } from 'next/navigation';
import { Client as Minio } from "minio";
import sharp from "sharp";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const minio = new Minio({
  endPoint: new URL(process.env.NEXT_PUBLIC_MINIO_ENDPOINT!).hostname,
  port: Number(new URL(process.env.NEXT_PUBLIC_MINIO_ENDPOINT!).port || (process.env.NEXT_PUBLIC_MINIO_ENDPOINT!.startsWith("https") ? 443 : 80)),
  useSSL: process.env.NEXT_PUBLIC_MINIO_ENDPOINT!.startsWith("https"),
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});
const BUCKET = process.env.NEXT_PUBLIC_MINIO_BUCKET!;

export async function updateProfile(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user.id) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const tagline = formData.get('tagline') as string;
  let avatar = formData.get('avatar') as string;
  const avatarFile = formData.get('avatar') as File;
  const background = formData.get('background') as string;
  const color = formData.get('color') as string;
  const latitudeStr = formData.get('latitude') as string;
  const longitudeStr = formData.get('longitude') as string;
  const privacy = formData.get('privacy') as string;
  const birthDateStr = formData.get('birthDate') as string;
  const showAgeStr = formData.get('showAge') as string;

  // --- links handling (safer) ---
  // Only touch the DB column when the client actually sent the field.
  // If parsing fails, we ignore the update to avoid wiping data.
  type Link = { name: string; url: string };

  function normalizeUrl(raw: string): string | null {
    const v = (raw ?? '').trim();
    if (!v) return null;

    // keep explicit mailto: and http(s)
    if (/^(mailto:|https?:\/\/)/i.test(v)) return v;

    // plain email -> mailto:
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`;

    // assume https:// if it's a hostname/path
    try {
      const u = new URL(`https://${v}`);
      return u.toString();
    } catch {
      return null;
    }
  }

  const linksField = formData.get('links'); // null if not provided at all
  let linksToUpdate: Link[] | null | undefined = undefined;
  if (linksField !== null) {
    const raw = String(linksField).trim();

    if (raw === '' || raw === 'null' || raw === '[]') {
      linksToUpdate = null; // explicit clear
    } else {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const cleaned: Link[] = parsed
            .map((item: any) => ({
              name: String(item?.name ?? '').trim(),
              url: String(item?.url ?? '').trim(),
            }))
            .filter((item) => item.name !== '' && item.url !== '')
            .map((item) => {
              const url = normalizeUrl(item.url);
              return url ? { ...item, url } : null;
            })
            .filter((x): x is Link => x !== null);

          linksToUpdate = cleaned.length > 0 ? cleaned : null;
        } else {
          // bad shape -> ignore update
          linksToUpdate = undefined;
        }
      } catch (e) {
        console.error('Failed to parse links:', e);
        linksToUpdate = undefined; // ignore update on parse failure
      }
    }
  }
  // --- end links handling ---

  // Get current profile to check for existing avatar
  const originalProfile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  });

  // Handle avatar upload if new file selected
  if (avatarFile && avatarFile instanceof File && avatarFile.size > 0) {
    // Check file size limit (1 MB)
    if (avatarFile.size > 1024 * 1024) {
      throw new Error('Avatar file size must be under 1 MB');
    }

    try {
      const input = Buffer.from(await avatarFile.arrayBuffer());
      const image = sharp(input, { failOn: "none" }).rotate();
      const { width, height } = await image.metadata();

      const webp = await (
        width && height && Math.max(width, height) < 512
          ? image
          : image.resize({
              width: 512,
              height: 512,
              fit: "cover",
              position: "attention",
              withoutEnlargement: true,
            })
      ).webp({ quality: 80, effort: 4 }).toBuffer();

      let key: string;
      do {
        key = `avatars/${randomUUID()}`;
      } while (await minio.statObject(BUCKET, key).then(() => true, () => false));

      await minio.putObject(BUCKET, key, webp, webp.length, {
        "Content-Type": "image/webp",
        "X-Amz-Meta-Original-Filename": avatarFile.name,
      });

      // Delete old avatar if exists
      if (originalProfile?.avatar) {
        try {
          await minio.removeObject(BUCKET, `avatars/${originalProfile.avatar}`);
        } catch (error) {
          console.error('Failed to delete old avatar:', error);
        }
      }

      avatar = key.replace('avatars/', '');
    } catch (error) {
      console.error('Avatar upload failed:', error);
      throw new Error('Avatar upload failed');
    }
  }

  let latitude: number | null = null;
  let longitude: number | null = null;

  if (latitudeStr) {
    const lat = parseFloat(latitudeStr);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90 degrees');
    }
    latitude = lat;
  }

  if (longitudeStr) {
    const lng = parseFloat(longitudeStr);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      throw new Error('Longitude must be between -180 and 180 degrees');
    }
    longitude = lng;
  }

  const updateData: any = {
    tagline: tagline || null,
    background: background || null,
    color: color || null,
    latitude,
    longitude,
    privacy: privacy || 'PUBLIC',
    birthDate: birthDateStr ? new Date(birthDateStr) : null,
    showAge: showAgeStr === 'true',
    user: {
      update: {
        name: name || session.user.name
      }
    }
  };

  // Only set avatar when it is a meaningful string
  if (typeof avatar === 'string' && avatar !== '{}' && avatar.trim() !== '') {
    updateData.avatar = avatar || null;
  }

  // Only attach `links` when the client actually sent the field
  if (linksToUpdate !== undefined) {
    updateData.links = linksToUpdate; // may be null (clear) or an array (set)
  }

  const profile = await prisma.profile.update({
    where: { userId: session.user.id },
    data: updateData
  });

  redirect(`/profile/${profile.id}`);
}

export async function updateAbout(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user.id) {
    throw new Error('Unauthorized');
  }

  const about = formData.get('about') as string;

  const profile = await prisma.profile.update({
    where: { userId: session.user.id },
    data: { about: about || null }
  });

  redirect(`/profile/${profile.id}`);
}
