"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteAssets } from "@/src/frontend/assets";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  { label: "My Bookings", href: "/my-bookings" },
  { label: "Owner", href: "/owner" },
];

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function isOwnerRole(role) {
  return role === "owner" || role === "admin";
}

export function SiteHeader({ authState }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canAccessOwner = isOwnerRole(authState?.role);
  const ownerHref = canAccessOwner ? "/owner" : "/sign-in?next=%2Fowner";

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-[rgba(247,244,239,0.82)] backdrop-blur-xl">
      <div className="page-shell flex min-h-18 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <img src={siteAssets.logo} alt="QuickStay" className="h-9 w-auto" />
          <div className="hidden sm:block">
            <p className="font-display text-xl text-[var(--color-ink)]">
              QuickStay
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Full-stack rebuild
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navigation.map((item) => {
            const active =
              item.href === "/"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  active
                    ? "bg-[var(--color-ink)] text-white"
                    : "text-[var(--color-muted)] hover:bg-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/rooms"
            className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-white"
          >
            Browse stays
          </Link>
          {authState?.isAuthenticated ? (
            <>
              <div className="rounded-full border border-[var(--color-line)] bg-white px-4 py-2 text-right text-xs text-[var(--color-muted)]">
                <p className="font-semibold text-[var(--color-ink)]">
                  {authState.fullName}
                </p>
                <p className="uppercase tracking-[0.12em]">
                  {authState.role || "guest"}
                </p>
              </div>
              <form action="/auth/sign-out" method="post">
                <button
                  type="submit"
                  className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-white"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-white"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-strong)]"
              >
                Sign up
              </Link>
            </>
          )}
          <Link
            href={ownerHref}
            className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-highlight)]"
          >
            Owner dashboard
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="rounded-full border border-[var(--color-line)] p-3 text-[var(--color-ink)] lg:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-[var(--color-line)] bg-[var(--color-card)] lg:hidden">
          <div className="page-shell flex flex-col gap-3 py-4">
            {navigation.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                    active
                      ? "bg-[var(--color-ink)] text-white"
                      : "bg-white text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {authState?.isAuthenticated ? (
              <>
                <div className="rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-[var(--color-line)]">
                  <p className="font-semibold text-[var(--color-ink)]">
                    {authState.fullName}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
                    {authState.role || "guest"}
                  </p>
                </div>
                <form action="/auth/sign-out" method="post">
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-[var(--color-ink)] px-4 py-3 text-sm font-semibold text-white"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-2xl bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white"
                >
                  Sign up
                </Link>
              </>
            )}

            <Link
              href={ownerHref}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-2xl bg-[var(--color-ink)] px-4 py-3 text-sm font-semibold text-white"
            >
              Owner dashboard
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
