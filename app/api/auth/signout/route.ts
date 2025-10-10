import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
    try {
        await auth.api.signOut({ headers: await headers() });
    } catch (error) {
        console.error(error);
    }
    
    const clientId = process.env.BETTER_AUTH_CLIENT_ID;
    redirect(`https://auth.draconic.id/application/o/draconic-id/end-session/`);
}