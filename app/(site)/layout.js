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
      <main className="relative overflow-hidden pb-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(155,205,245,0.18),transparent_62%)]" />
        <div className="pointer-events-none absolute left-[-12rem] top-56 h-[22rem] w-[22rem] rounded-full bg-[rgba(137,186,229,0.16)] blur-3xl" />
        <div className="pointer-events-none absolute right-[-10rem] top-80 h-[24rem] w-[24rem] rounded-full bg-[rgba(36,91,156,0.08)] blur-3xl" />
        <div className="relative">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
