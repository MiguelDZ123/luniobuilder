import NextAuth, { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import supabase from "./db"

const authOptions = {
    adapter: supabase,
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
        }),
    ],
    secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)