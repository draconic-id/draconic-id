import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@/prisma/generated";

const prisma = new PrismaClient();
export const auth = betterAuth({
    appName: "Draconic ID",
    session: {
        expiresIn: 604800, // 7 days
        updateAge: 86400, // 1 day
        disableSessionRefresh: false, // Disable session refresh so that the session is not updated regardless of the `updateAge` option. (default: `false`)
        cookieCache: {
            enabled: false, // Enable caching session in cookie (default: `false`)	
            maxAge: 300 // 5 minutes
        }
    },
    advanced: {
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true
        }
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    plugins: [
        genericOAuth({
            config: [
                {
                    providerId: process.env.BETTER_AUTH_PROVIDER_ID!,
                    clientId: process.env.BETTER_AUTH_CLIENT_ID!,
                    clientSecret: process.env.BETTER_AUTH_CLIENT_SECRET!,
                    authorizationUrl: process.env.BETTER_AUTH_AUTHORIZATION_URL!,
                    tokenUrl: process.env.BETTER_AUTH_TOKEN_URL!,
                    scopes: ["openid", "profile", "email"],
                    overrideUserInfo: true,
                },
                // Add more providers as needed
            ]
        }),
        nextCookies()
    ]
});