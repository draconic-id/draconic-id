import { NextResponse } from 'next/server'
import { PrismaClient } from '@/prisma/generated'

const prisma = new PrismaClient()

export async function GET() {
  const profiles = await prisma.profile.findMany({
    where: {
      privacy: {
        in: ['PUBLIC', 'UNLISTED']
      }
    },
    select: {
      id: true,
      user: {
        select: {
          name: true
        }
      }
    }
  })

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Wayback Machine - Draconic ID Profiles</title>
  <meta name="robots" content="noindex, nofollow">
</head>
<body>
  <h1>Draconic ID Profiles</h1>
  <p>This page is intended to make all profiles crawlable by the Wayback Machine using a single request. It is set not to be indexed by search engines, and therefore contains all profiles with privacy set PUBLIC or UNLISTED.</p> 
  <br>
  ${profiles.map(profile =>
    `<a href="/profile/${profile.id}">${profile.user.name}</a><br>`
  ).join('\n  ')}
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}