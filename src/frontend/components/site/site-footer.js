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
      { label: "Travel inspiration", href: "/" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/8 bg-[linear-gradient(180deg,#12243b,#0f1d30)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(155,205,245,0.18),transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(155,205,245,0.54),transparent)]" />

      <div className="page-shell relative grid gap-10 py-14 lg:grid-cols-[1.45fr_0.9fr_0.9fr]">
        <div>
          <img
            src={siteAssets.logo}
            alt="QuickStay"
            className="h-9 w-auto brightness-0 invert"
          />
          <p className="mt-5 max-w-xl text-sm leading-8 text-white/70">
            QuickStay helps travelers discover polished city stays, compare room
            details quickly, and send booking requests with confidence on any
            screen size.
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
        <div className="page-shell flex flex-col gap-3 py-4 text-sm text-white/56 sm:flex-row sm:items-center sm:justify-between">
          <p>QuickStay demo experience for polished booking discovery.</p>
          <p>Responsive, readable, and ready for a stronger next release.</p>
        </div>
      </div>
    </footer>
  );
}
