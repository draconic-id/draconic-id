import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/prisma/generated';
import { formatProfile, checkProfileAccess, parseSelectFields } from '../utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('id');
    const providerId = searchParams.get('provider');
    const select = parseSelectFields(searchParams);

    if (!accountId || !providerId) {
      return NextResponse.json({ error: 'Missing id or provider parameter' }, { status: 400 });
    }

    const account = await prisma.account.findFirst({
      where: { accountId: accountId!, providerId: providerId! },
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

    if (!account?.user?.profile || !(await checkProfileAccess(account.user.profile, request))) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(formatProfile(account.user.profile, select));
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accounts } = body;
    const { searchParams } = new URL(request.url);
    const select = parseSelectFields(searchParams);

    if (!accounts || !Array.isArray(accounts)) {
      return NextResponse.json({ error: 'Missing or invalid accounts array' }, { status: 400 });
    }

    const accountQueries = accounts.map((acc: { accountId: string; providerId: string }) => ({
      accountId: acc.accountId,
      providerId: acc.providerId
    }));

    const foundAccounts = await prisma.account.findMany({
      where: {
        OR: accountQueries
      },
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

    const accessibleProfiles = [];
    for (const account of foundAccounts) {
      if (account.user?.profile && await checkProfileAccess(account.user.profile, request)) {
        accessibleProfiles.push(formatProfile(account.user.profile, select));
      }
    }

    return NextResponse.json(accessibleProfiles);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}