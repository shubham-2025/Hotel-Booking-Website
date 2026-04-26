import Link from "next/link";
import { siteAssets } from "@/src/frontend/assets";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Browse stays", href: "/rooms" },
      { label: "Featured offers", href: "/" },
      { label: "My Bookings", href: "/my-bookings" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "/login" },
      { label: "Create account", href: "/create-account" },
      { label: "Owner access", href: "/host" },
      { label: "Travel inspiration", href: "/" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/8 bg-[linear-gradient(180deg,#102238,#0c1a2b)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(155,205,245,0.22),transparent_28%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-12 h-56 w-56 rounded-full bg-[rgba(155,205,245,0.08)] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(155,205,245,0.54),transparent)]" />

      <div className="page-shell relative grid gap-10 py-16 lg:grid-cols-[1.35fr_0.82fr_0.82fr]">
        <div>
          <img
            src={siteAssets.logo}
            alt="QuickStay"
            className="h-9 w-auto brightness-0 invert"
          />
          <p className="mt-5 max-w-xl text-sm leading-8 text-white/70">
            QuickStay helps travelers discover polished city stays, compare room
            details quickly, and keep bookings, payments, and account actions in
            one calmer flow on any screen size.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["City breaks", "Weekend stays", "Longer escapes"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-white/72"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
              {group.title}
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              {group.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-white/68 transition hover:translate-x-0.5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="relative border-t border-white/10 bg-white/4">
        <div className="page-shell flex flex-col gap-3 py-5 text-sm text-white/56 sm:flex-row sm:items-center sm:justify-between">
          <p>QuickStay booking experience for discovery, account, and payment flow.</p>
          <p>Responsive, clearer, and tuned for a more premium browsing feel.</p>
        </div>
      </div>
    </footer>
  );
}
