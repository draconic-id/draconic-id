import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AccountMenu from "@/components/account-menu";

import { PrismaClient } from '@/prisma/generated';
import { userAgent } from "next/server";
import { House } from "lucide-react";
const prisma = new PrismaClient();


export default async function Navigation() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })

    var profile;

    if (session?.user.id) {
        profile = await prisma.profile.findUnique({
            where: {
                userId: session?.user.id,
            },
            select: {
                id: true
            }
        })
    }

    return (
        <NavigationMenu viewport={false} className="fixed block left-1/2 -translate-x-1/2 border z-50 bg-background/50 backdrop-blur-md rounded-sm pl-2 pr-2 pt-1 pb-1 mt-1">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                        <Link href="/"><House className="text-accent-foreground" /></Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                        <Link href={profile?.id ? `/profile/${profile.id}` : "/profile"}>Profile</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                        <Link href="/map">Map</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                        <Link href="/list">List</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger><span className='max-w-32 truncate'>{session?.user.name ? session?.user.name : "Account"}</span></NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <AccountMenu isLoggedIn={!!session?.user.id} />
                    </NavigationMenuContent>
                </NavigationMenuItem>
                {/* <NavigationMenuIndicator /> */}
            </NavigationMenuList>
        </NavigationMenu>
    )
}