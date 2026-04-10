import { createBrowserClient } from "@supabase/ssr";
import { env, hasSupabasePublicEnv } from "../env";

let browserClient;

export function createSupabaseBrowserClient() {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      env.supabaseUrl,
      env.supabaseAnonKey,
    );
  }

  return browserClient;
}
