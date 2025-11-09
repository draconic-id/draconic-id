import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/prisma/generated';
import { formatProfile, checkProfileAccess, parseSelectFields } from '../utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ids = searchParams.get('ids');
    const select = parseSelectFields(searchParams);

    if (!id && !ids) {
      return NextResponse.json({ error: 'Missing id or ids parameter' }, { status: 400 });
    }

    if (ids) {
      const idList = ids.split(',').map(id => id.trim());
      const profiles = await prisma.profile.findMany({
        where: { id: { in: idList } },
        include: { user: true }
      });

      const accessibleProfiles = [];
      for (const profile of profiles) {
        if (await checkProfileAccess(profile, request)) {
          accessibleProfiles.push(formatProfile(profile, select));
        }
      }

      return NextResponse.json(accessibleProfiles);
    }

    const profile = await prisma.profile.findUnique({
      where: { id: id! },
      include: { user: true }
    });

    if (!profile || !(await checkProfileAccess(profile, request))) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(formatProfile(profile, select));
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;
    const { searchParams } = new URL(request.url);
    const select = parseSelectFields(searchParams);

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'Missing or invalid ids array' }, { status: 400 });
    }

    const profiles = await prisma.profile.findMany({
      where: { id: { in: ids } },
      include: { user: true }
    });

    const accessibleProfiles = [];
    for (const profile of profiles) {
      if (await checkProfileAccess(profile, request)) {
        accessibleProfiles.push(formatProfile(profile, select));
      }
    }

    return NextResponse.json(accessibleProfiles);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}