import { createClient } from "@supabase/supabase-js";
import { env, hasSupabaseServiceEnv } from "../env";

let adminClient;

export function createSupabaseAdminClient() {
  if (!hasSupabaseServiceEnv()) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminClient;
}
