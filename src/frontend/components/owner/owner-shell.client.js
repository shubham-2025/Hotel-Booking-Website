"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteAssets } from "@/src/frontend/assets";
import { ownerNavigation } from "@/src/frontend/content/navigation/owner-navigation";

export function OwnerShell({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#eef3f9]">
      <header className="border-b border-white/60 bg-white/85 backdrop-blur-xl">
        <div className="page-shell flex min-h-18 flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img src={siteAssets.logo} alt="QuickStay" className="h-9 w-auto" />
            <div>
              <p className="font-display text-xl text-[var(--color-ink)]">
                Owner Console
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Next.js migration in progress
              </p>
            </div>
          </Link>

          <div className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            Mobile responsive shell
          </div>
        </div>
      </header>

      <div className="page-shell grid gap-6 py-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-white/70 bg-white p-4 shadow-[var(--shadow-soft)]">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              Owner nav
            </p>
            <h2 className="mt-2 font-display text-2xl text-[var(--color-ink)]">
              Manage your property stack
            </h2>
          </div>

          <nav className="flex gap-3 overflow-x-auto pb-1 lg:flex-col">
            {ownerNavigation.map((item) => {
              const active =
                item.href === "/owner"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`min-w-[210px] rounded-3xl p-4 text-sm lg:min-w-0 ${
                    active
                      ? "bg-[var(--color-ink)] text-white"
                      : "bg-[#f7f9fc] text-[var(--color-muted)]"
                  }`}
                >
                  <p className="font-semibold">{item.label}</p>
                  <p
                    className={`mt-1 text-xs leading-5 ${
                      active ? "text-white/75" : "text-[var(--color-muted)]"
                    }`}
                  >
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="rounded-[32px] border border-white/70 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
