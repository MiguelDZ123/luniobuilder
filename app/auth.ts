import NextAuth, { DefaultSession, Session } from "next-auth"
import Google from "next-auth/providers/google"
import { SupabaseAdapter } from "@auth/supabase-adapter"

const authOptions = {
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ],
    // create account in supabase with providers credentials
    adapter: 
        SupabaseAdapter({
            url: process.env.SUPABASE_URL as string,
            secret: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    }),
    secret: process.env.AUTH_SECRET,
}

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)