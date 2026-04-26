"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteAssets } from "@/src/frontend/assets";
import { OwnerFooter } from "@/src/frontend/components/owner/owner-footer";
import { ownerNavigation } from "@/src/frontend/content/navigation/owner-navigation";

export function OwnerShell({ children }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f5f7fa,#f9fbfd)]">
      <div className="pointer-events-none absolute left-[-12rem] top-32 h-72 w-72 rounded-full bg-[rgba(215,227,240,0.42)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-10rem] top-48 h-80 w-80 rounded-full bg-[rgba(230,238,247,0.72)] blur-3xl" />

      <header className="relative border-b border-[rgba(255,255,255,0.12)] bg-[linear-gradient(135deg,#16324f_0%,#204d76_58%,#2d6e9f_100%)] text-white shadow-[0_20px_40px_rgba(10,25,40,0.22)]">
        <div className="page-shell flex min-h-20 flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img
              src={siteAssets.logo}
              alt="QuickStay"
              className="h-9 w-auto brightness-0 invert"
            />
            <div>
              <p className="font-display text-xl text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]">
                Host Suite
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-white/80">
                A private place to shape your property and welcome every guest
              </p>
            </div>
          </Link>

          <div className="rounded-full border border-white/22 bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            Private workspace
          </div>
        </div>
      </header>

      <div className="page-shell relative grid gap-6 py-8 xl:grid-cols-[260px_minmax(0,1fr)] xl:py-10">
        <aside className="h-fit rounded-[30px] border border-white/70 bg-[rgba(255,255,255,0.9)] p-4 shadow-[var(--shadow-soft)] backdrop-blur-xl xl:sticky xl:top-6">
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
                  className={`min-w-[198px] rounded-[24px] p-4 text-sm lg:min-w-0 ${
                    active
                      ? "bg-[rgba(22,34,53,0.96)] text-white shadow-[0_14px_28px_rgba(18,36,59,0.14)]"
                      : "bg-white/82 text-[var(--color-muted)] ring-1 ring-[rgba(213,225,239,0.9)]"
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

        <main className="min-w-0">{children}</main>
      </div>

      <OwnerFooter />
    </div>
  );
}
