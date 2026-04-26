import { SupabaseAdapter } from "@auth/supabase-adapter";

const url = process.env.SUPABASE_URL as string;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!url || !secret) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable");
}

export default SupabaseAdapter({
    url,
    secret,
})