"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteAssets } from "@/src/frontend/assets";
import { ownerNavigation } from "@/src/frontend/content/navigation/owner-navigation";

export function OwnerShell({ children }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#edf4fa,#f7fbfd)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(135deg,rgba(19,48,75,0.96),rgba(39,89,131,0.9),rgba(145,194,236,0.6))]" />
      <div className="pointer-events-none absolute left-[-8rem] top-40 h-64 w-64 rounded-full bg-[rgba(137,186,229,0.16)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-6rem] top-28 h-72 w-72 rounded-full bg-[rgba(36,91,156,0.12)] blur-3xl" />

      <header className="relative border-b border-white/16 bg-[rgba(10,25,40,0.18)] text-white backdrop-blur-xl">
        <div className="page-shell flex min-h-20 flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img
              src={siteAssets.logo}
              alt="QuickStay"
              className="h-9 w-auto brightness-0 invert"
            />
            <div>
              <p className="font-display text-xl text-white">
                Host Suite
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-white/68">
                A private place to shape your property and welcome every guest
              </p>
            </div>
          </Link>

          <div className="rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/82 backdrop-blur-sm">
            Private workspace
          </div>
        </div>
      </header>

      <div className="page-shell relative grid gap-6 py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-[32px] border border-white/70 bg-[rgba(255,255,255,0.92)] p-4 shadow-[var(--shadow-soft)] backdrop-blur-xl lg:sticky lg:top-6">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              Host menu
            </p>
            <h2 className="mt-2 font-display text-2xl text-[var(--color-ink)]">
              Shape your guest experience
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
                  className={`min-w-[210px] rounded-[28px] p-4 text-sm lg:min-w-0 ${
                    active
                      ? "bg-[linear-gradient(135deg,#153455,#2b6ea9)] text-white shadow-[0_18px_36px_rgba(26,78,128,0.22)]"
                      : "bg-[#f7f9fc] text-[var(--color-muted)] ring-1 ring-[rgba(213,225,239,0.9)]"
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

        <main className="rounded-[34px] border border-white/70 bg-[rgba(255,255,255,0.94)] p-5 shadow-[var(--shadow-lift)] backdrop-blur-xl sm:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
