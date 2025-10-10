import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import { PrismaClient } from '@/prisma/generated';
import { headers } from "next/headers";
const prisma = new PrismaClient();

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })

  if (!session?.user.id) {
    redirect((await auth.api.signInSocial({ headers: await headers(), body: { provider: 'draconic-id', callbackURL: '/profile' } })).url || "")
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