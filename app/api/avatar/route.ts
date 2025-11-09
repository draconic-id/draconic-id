import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/prisma/generated';
import { checkProfileAccess, getImageUrl } from '../profile/utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const userId = searchParams.get('userId');
    const accountId = searchParams.get('accountId');
    const providerId = searchParams.get('providerId');

    let profile;

    // Resolve by profile ID
    if (profileId) {
      profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: { user: true }
      });
    }
    // Resolve by user ID
    else if (userId) {
      profile = await prisma.profile.findUnique({
        where: { userId },
        include: { user: true }
      });
    }
    // Resolve by account ID + provider ID
    else if (accountId && providerId) {
      const account = await prisma.account.findFirst({
        where: { accountId, providerId },
        include: {
          user: {
            include: {
              profile: {
                include: { user: true }
              }
            }
          }
        }
      });
      profile = account?.user?.profile;
    }
    else {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (!profile || !(await checkProfileAccess(profile, request))) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const avatarUrl = getImageUrl(profile.avatar);
    if (!avatarUrl) {
      return NextResponse.json({ error: 'No avatar found' }, { status: 404 });
    }

    return NextResponse.redirect(avatarUrl);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}