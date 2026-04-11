import { getCurrentProfile } from "@/src/backend/auth/get-current-profile";
import { getCurrentUser } from "@/src/backend/auth/get-current-user";
import { SiteFooter } from "@/src/frontend/components/site/site-footer";
import { SiteHeader } from "@/src/frontend/components/site/site-header";

export default async function SiteLayout({ children }) {
  const user = await getCurrentUser();
  let profile = null;

  if (user) {
    try {
      profile = await getCurrentProfile(user);
    } catch {
      profile = null;
    }
  }

  const authState = user
    ? {
        isAuthenticated: true,
        email: profile?.email || user.email || "",
        fullName:
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email ||
          "Account",
        role: profile?.role || null,
      }
    : {
        isAuthenticated: false,
        email: "",
        fullName: "",
        role: null,
      };

  return (
    <>
      <SiteHeader authState={authState} />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
