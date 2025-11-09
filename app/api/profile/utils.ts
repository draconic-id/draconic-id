import { PrismaClient, Prisma, Profile, User, Privacy } from '@/prisma/generated';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

type ProfileWithUser = Profile & { user: User };

export function getImageUrl(imageId: string | null): string | null {
  return imageId 
    ? `${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${process.env.NEXT_PUBLIC_MINIO_BUCKET}/avatars/${imageId}`
    : null;
}

export function formatProfile(profile: ProfileWithUser, select?: Prisma.ProfileSelect) {
  const formatted: Record<string, any> = {};
  
  if (!select || select.id) formatted.id = profile.id;
  if (!select || select.tagline) formatted.tagline = profile.tagline;
  if (!select || select.avatar) formatted.avatar = getImageUrl(profile.avatar);
  if (!select || select.background) formatted.background = getImageUrl(profile.background);
  if (!select || select.about) formatted.about = profile.about;
  if (!select || select.color) formatted.color = profile.color;
  if (!select || select.privacy) formatted.privacy = profile.privacy;
  if (!select || select.longitude) formatted.longitude = profile.longitude;
  if (!select || select.latitude) formatted.latitude = profile.latitude;
  if (!select || select.links) formatted.links = profile.links;
  if (!select || select.createdAt) formatted.createdAt = profile.createdAt;
  if (!select || select.updatedAt) formatted.updatedAt = profile.updatedAt;

  if (!select || select.showAge) formatted.showAge = profile.showAge;
  
  if (!select || select.birthDate) {
    if (profile.birthDate) {
      formatted.birthDate = profile.showAge 
        ? `${profile.birthDate.getUTCFullYear()}-${(profile.birthDate.getUTCMonth() + 1).toString().padStart(2, '0')}-${profile.birthDate.getUTCDate().toString().padStart(2, '0')}`
        : `${(profile.birthDate.getUTCMonth() + 1).toString().padStart(2, '0')}-${profile.birthDate.getUTCDate().toString().padStart(2, '0')}`
    } else {
      formatted.birthDate = null;
    }
  }
  
  if (profile.user && (!select || select.user)) {
    const { email, emailVerified, image, ...filteredUser } = profile.user;
    formatted.user = filteredUser;
  }
  
  return formatted;
}

export async function checkProfileAccess(profile: { privacy: Privacy }, request: NextRequest): Promise<boolean> {
  if (profile.privacy === 'PUBLIC' || profile.privacy === 'UNLISTED') {
    return true;
  }
  
  if (profile.privacy === 'HIDDEN') {
    const session = await auth.api.getSession({ headers: request.headers });
    return !!session;
  }
  
  return false;
}

export function parseSelectFields(searchParams: URLSearchParams): Prisma.ProfileSelect | undefined {
  const fields = searchParams.get('fields');
  if (!fields) return undefined;
  
  const fieldList = fields.split(',').map(f => f.trim());
  const select: Prisma.ProfileSelect = {};
  
  const validFields = ['id', 'tagline', 'avatar', 'background', 'about', 'color', 'privacy', 'longitude', 'latitude', 'birthDate', 'showAge', 'links', 'createdAt', 'updatedAt', 'userId', 'user'];
  
  fieldList.forEach(field => {
    if (validFields.includes(field)) {
      (select as any)[field] = true;
    }
  });
  
  return Object.keys(select).length > 0 ? select : undefined;
}

export { prisma };