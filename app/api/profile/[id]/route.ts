import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/prisma/generated';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });

    const profile = await prisma.profile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check privacy permissions
    if (profile.privacy === 'HIDDEN' && !session) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (!['PUBLIC', 'UNLISTED', 'HIDDEN'].includes(profile.privacy)) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const avatarUrl = profile.avatar 
      ? `${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${process.env.NEXT_PUBLIC_MINIO_BUCKET}/avatars/${profile.avatar}`
      : null;

    return NextResponse.json({
      id: profile.id,
      name: profile.user.name,
      tagline: profile.tagline,
      avatar: avatarUrl,
      about: profile.about,
      privacy: profile.privacy,
      latitude: profile.latitude,
      longitude: profile.longitude,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}