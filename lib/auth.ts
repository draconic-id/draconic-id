import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@/prisma/generated";

const prisma = new PrismaClient();
export const auth = betterAuth({
    session: {
        freshAge: 0 // Disable freshness check
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
                    scopes: ["openid", "profile", "email"]
                },
                // Add more providers as needed
            ]
        }),
        nextCookies()
    ]
});