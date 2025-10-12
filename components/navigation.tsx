import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { PrismaClient } from '@/prisma/generated';
import { userAgent } from "next/server";
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
                        <Link href="/">Home</Link>
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
                        <Link href="/faq">FAQ</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger className="">{session?.user.name ? session?.user.name : "Account"}</NavigationMenuTrigger>
                    <NavigationMenuContent>

                        {session ?

                            <>
                                <NavigationMenuLink asChild>
                                    <Link href="https://auth.draconic.id/if/user/#/library">Services</Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                    <Link href="https://auth.draconic.id/if/user/#/settings">Settings</Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                    <Link href="/api/auth/signout">Sign out</Link>
                                </NavigationMenuLink>
                            </>
                            :
                            <>
                                <NavigationMenuLink asChild>
                                    <Link href={(await auth.api.signInSocial({ headers: await headers(), body: { provider: 'draconic-id', callbackURL: '/' } })).url || ""}>Sign in</Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                    <Link href="https://auth.draconic.id/if/flow/default-enrollment-flow/">Register</Link>
                                </NavigationMenuLink>
                            </>
                        }

                    </NavigationMenuContent>
                </NavigationMenuItem>
                {/* <NavigationMenuIndicator /> */}
            </NavigationMenuList>
        </NavigationMenu>
    )
}