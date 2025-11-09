import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient, Privacy } from '@/prisma/generated';
import { formatProfile, parseSelectFields } from '../utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const select = parseSelectFields(searchParams);
    const session = await auth.api.getSession({ headers: request.headers });

    const whereClause = session 
      ? { privacy: { in: [Privacy.PUBLIC, Privacy.UNLISTED, Privacy.HIDDEN] } }
      : { privacy: { in: [Privacy.PUBLIC, Privacy.UNLISTED] } };

    const profiles = await prisma.profile.findMany({
      where: whereClause,
      include: { user: true }
    });

    const formattedProfiles = profiles.map(profile => formatProfile(profile, select));
    return NextResponse.json(formattedProfiles);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}