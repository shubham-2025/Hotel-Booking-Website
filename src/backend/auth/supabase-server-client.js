import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, hasSupabasePublicEnv } from "../config/env";

export async function createSupabaseServerClient() {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {}
      },
    },
  });
}
