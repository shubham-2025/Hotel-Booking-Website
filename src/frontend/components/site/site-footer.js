import Link from "next/link";
import { siteAssets } from "@/lib/mock-data";

const footerGroups = [
  {
    title: "Platform",
    links: [
      { label: "Browse Rooms", href: "/rooms" },
      { label: "My Bookings", href: "/my-bookings" },
      { label: "Owner Dashboard", href: "/owner" },
    ],
  },
  {
    title: "Stack",
    links: [
      { label: "Next.js App Router", href: "/" },
      { label: "Supabase + Postgres", href: "/" },
      { label: "Resend Email Layer", href: "/" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-[var(--color-line)] bg-white/75">
      <div className="page-shell grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <img src={siteAssets.logo} alt="QuickStay" className="h-9 w-auto" />
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
            This repository now has a clear migration path from a frontend-only
            Vite app to a production-ready Next.js platform with database,
            email workflows, and Vercel deployment.
          </p>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)]">
              {group.title}
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              {group.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
