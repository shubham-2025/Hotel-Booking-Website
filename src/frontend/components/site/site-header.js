"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteAssets } from "@/src/frontend/assets";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  { label: "My Bookings", href: "/my-bookings" },
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

export function SiteHeader({ authState }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const isHome = pathname === "/";
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/create-account" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/sign-in" ||
    pathname === "/sign-up";
  const shouldFloat = !isAuthPage;
  const showBox = shouldFloat && (hasScrolled || isMenuOpen);
  const useLightTheme = isHome && !showBox && shouldFloat;
  const isManagementUser =
    authState?.role === "owner" || authState?.role === "admin";
  const shouldShowOwnerEntryCta = isManagementUser || isAuthPage;
  const ownerCtaLabel = authState?.isAuthenticated
    ? isManagementUser
      ? "Owner Dashboard"
      : "Become a Host"
    : "Owner Access";
  const ownerCtaHref = isManagementUser ? "/owner" : "/host";

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const updateScrollState = () => {
      setHasScrolled(window.scrollY > 24);
    };

    window.addEventListener("scroll", updateScrollState, { passive: true });
    const frame = window.requestAnimationFrame(updateScrollState);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScrollState);
    };
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      setIsMenuOpen(false);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <>
      <header
        className={
          shouldFloat ? "fixed inset-x-0 top-0 z-50" : "relative z-40"
        }
      >
        <div className="page-shell pt-3">
          <div
            className={`overflow-hidden transition-all duration-300 ${
              showBox || isAuthPage
                ? "rounded-[30px] border border-white/45 bg-[rgba(255,255,255,0.92)] shadow-[0_20px_48px_rgba(18,36,59,0.14)] backdrop-blur-xl"
                : "rounded-[30px] border border-transparent bg-transparent shadow-none"
            }`}
          >
            <div className="flex min-h-[82px] items-center justify-between gap-4 px-4 sm:px-5">
              <Link href="/" className="flex shrink-0 items-center">
                <img
                  src={siteAssets.logo}
                  alt="QuickStay"
                  className={`h-8 w-auto transition duration-300 sm:h-9 ${
                    showBox || isAuthPage
                      ? "brightness-[0.2] saturate-[0.6]"
                      : ""
                  }`}
                />
              </Link>

              <nav className="hidden items-center gap-8 lg:flex">
                {navigation.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative whitespace-nowrap px-0 py-2 text-sm font-semibold transition after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:rounded-full after:transition-transform after:duration-200 ${
                        useLightTheme
                          ? active
                            ? "text-white after:scale-x-100 after:bg-white"
                            : "text-white/84 after:scale-x-0 after:bg-white hover:text-white hover:after:scale-x-100"
                          : active
                            ? "text-[var(--color-ink)] after:scale-x-100 after:bg-[var(--color-highlight)]"
                            : "text-[var(--color-muted)] after:scale-x-0 after:bg-[var(--color-highlight)] hover:text-[var(--color-ink)] hover:after:scale-x-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden items-center gap-3 lg:flex">
                {authState?.isAuthenticated ? (
                  <>
                    <div className="pill-muted max-w-[220px] justify-start gap-3 px-4 py-2.5 whitespace-nowrap">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)] text-xs font-bold text-white">
                        {(authState.fullName || authState.email || "A")
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
                          {authState.fullName}
                        </p>
                        <p className="truncate text-[0.72rem] font-medium text-[var(--color-muted)]">
                          Signed in
                        </p>
                      </div>
                    </div>

                    {shouldShowOwnerEntryCta ? (
                      <Link
                        href={ownerCtaHref}
                        className={
                          isManagementUser
                            ? "button-primary min-h-11 px-5 whitespace-nowrap"
                            : "button-secondary min-h-11 px-5 whitespace-nowrap"
                        }
                      >
                        {ownerCtaLabel}
                      </Link>
                    ) : null}

                    <form action="/auth/sign-out" method="post">
                      <button
                        type="submit"
                        className="button-secondary min-h-11 px-5 whitespace-nowrap"
                      >
                        Sign out
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    {shouldShowOwnerEntryCta ? (
                      <Link
                        href={ownerCtaHref}
                        className={`inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full px-6 text-sm font-semibold transition ${
                          useLightTheme
                            ? "border border-white/24 bg-white/8 text-white backdrop-blur-md hover:bg-white/16"
                            : "border border-[var(--color-line)] bg-white text-[var(--color-ink)] shadow-[0_8px_24px_rgba(18,36,59,0.06)] hover:bg-[var(--color-card-soft)]"
                        }`}
                      >
                        {ownerCtaLabel}
                      </Link>
                    ) : null}
                    <Link
                      href="/login"
                      className={`inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full px-6 text-sm font-semibold transition ${
                        useLightTheme
                          ? "border border-white/28 bg-white/10 text-white backdrop-blur-md hover:bg-white/18"
                          : "border border-[var(--color-line)] bg-white text-[var(--color-ink)] shadow-[0_8px_24px_rgba(18,36,59,0.06)] hover:bg-[var(--color-card-soft)]"
                      }`}
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>

              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                className={`rounded-full p-3 shadow-[0_8px_24px_rgba(18,36,59,0.08)] transition lg:hidden ${
                  useLightTheme
                    ? "border border-white/22 bg-white/12 text-white backdrop-blur-md"
                    : "border border-[var(--color-line)] bg-white/88 text-[var(--color-ink)]"
                }`}
                onClick={() => setIsMenuOpen((open) => !open)}
              >
                {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>

            <div
              className={`overflow-hidden border-t transition-all duration-300 lg:hidden ${
                isMenuOpen
                  ? "max-h-[24rem] opacity-100"
                  : "pointer-events-none max-h-0 opacity-0"
              } ${
                useLightTheme
                  ? "border-white/18 bg-white/10 backdrop-blur-md"
                  : "border-[var(--color-line)]/80"
              }`}
            >
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  {navigation.map((item) => {
                    const active =
                      item.href === "/"
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                          active
                            ? "bg-[var(--color-card-soft)] text-[var(--color-ink)] ring-1 ring-[var(--color-line)]"
                            : "bg-white/92 text-[var(--color-muted)] ring-1 ring-[var(--color-line)] hover:text-[var(--color-ink)]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-line)] pt-4">
                  {authState?.isAuthenticated ? (
                    <>
                      <div className="rounded-[24px] bg-white px-4 py-4 ring-1 ring-[var(--color-line)]">
                        <p className="text-sm font-semibold text-[var(--color-ink)]">
                          {authState.fullName}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          Signed in
                        </p>
                      </div>
                      {shouldShowOwnerEntryCta ? (
                        <Link
                          href={ownerCtaHref}
                          onClick={closeMenu}
                          className={
                            isManagementUser
                              ? "button-primary w-full"
                              : "button-secondary w-full"
                          }
                        >
                          {ownerCtaLabel}
                        </Link>
                      ) : null}
                      <form action="/auth/sign-out" method="post">
                        <button
                          type="submit"
                          className="button-secondary w-full"
                        >
                          Sign out
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      {shouldShowOwnerEntryCta ? (
                        <Link
                          href={ownerCtaHref}
                          onClick={closeMenu}
                          className="button-secondary w-full"
                        >
                          {ownerCtaLabel}
                        </Link>
                      ) : null}
                      <Link
                        href="/login"
                        onClick={closeMenu}
                        className="button-secondary w-full"
                      >
                        Login
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {shouldFloat && !isHome ? <div className="h-[102px]" /> : null}
    </>
  );
}
