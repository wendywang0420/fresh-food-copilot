import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let supabaseAdminClient: SupabaseClient | null | undefined;

export const getSupabaseAdminClient = () => {
  if (supabaseAdminClient !== undefined) {
    return supabaseAdminClient;
  }

  if (!env.supabaseURL || !env.supabaseServiceRoleKey) {
    supabaseAdminClient = null;
    return supabaseAdminClient;
  }

  supabaseAdminClient = createClient(env.supabaseURL, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminClient;
};
