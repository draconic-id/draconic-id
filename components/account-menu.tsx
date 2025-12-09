'use client';

import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

interface AccountMenuProps {
    isLoggedIn: boolean;
}

export default function AccountMenu({ isLoggedIn }: AccountMenuProps) {
    return (
        <>
            {isLoggedIn ? (
                <>
                    <NavigationMenuLink href="https://auth.draconic.id/if/user/#/library">
                        Services
                    </NavigationMenuLink>
                    <NavigationMenuLink href="https://auth.draconic.id/if/user/#/settings">
                        Settings
                    </NavigationMenuLink>
                    <NavigationMenuLink href="/api/auth/signout">
                        Sign out
                    </NavigationMenuLink>
                </>
            ) : (
                <>
                    <NavigationMenuLink asChild>
                        <Link href="#" onClick={() => authClient.signIn.social({ provider: 'draconic-id', callbackURL: '/' })}>Sign in</Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                        <Link href="https://auth.draconic.id/if/flow/default-enrollment-flow/">Register</Link>
                    </NavigationMenuLink>
                </>
            )}
        </>
    );
}