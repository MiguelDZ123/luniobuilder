import NextAuth, { DefaultSession, Session } from "next-auth"
import Google from "next-auth/providers/google"
import { SupabaseAdapter } from "@auth/supabase-adapter"

const authOptions = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    secret: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  }),
  secret: process.env.AUTH_SECRET,
}
 
export const {handlers, signIn, signOut, auth } = NextAuth(authOptions)