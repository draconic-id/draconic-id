import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import { PrismaClient } from '@/prisma/generated';
import { headers } from "next/headers";
const prisma = new PrismaClient();

export default async function Page() {
  const headersResult = await headers();

  const session = await auth.api.getSession({
    headers: headersResult // you need to pass the headers object.
  })

  console.log('session on /profile', session)

  if (!session?.user.id) {
    const { default: AuthRedirect } = await import('@/components/auth-redirect');
    return <AuthRedirect />;
  }

  const profile = await prisma.profile.findUnique({
    where: {
      userId: session?.user.id,
    },
    select: {
      id: true
    }
  })


  if (profile) {
    redirect(`/profile/${profile.id}`);
  }

  const newProfile = await prisma.profile.create({
    data: {
      userId: session?.user.id,
    }
  })

  redirect(`/profile/${newProfile.id}`);
}