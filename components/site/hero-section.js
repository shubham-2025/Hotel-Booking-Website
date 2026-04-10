"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { featuredCities, heroImage } from "@/lib/mock-data";

export function HeroSection() {
  const router = useRouter();
  const [formState, setFormState] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
    guests: 2,
  });

  function updateField(key, value) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const query = new URLSearchParams();

    if (formState.city) {
      query.set("city", formState.city);
    }

    if (formState.checkIn) {
      query.set("checkIn", formState.checkIn);
    }

    if (formState.checkOut) {
      query.set("checkOut", formState.checkOut);
    }

    if (formState.guests) {
      query.set("guests", String(formState.guests));
    }

    router.push(`/rooms?${query.toString()}`);
  }

  return (
    <section className="gradient-frame relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,26,44,0.8),rgba(11,26,44,0.38),rgba(124,59,17,0.35))]" />

      <div className="page-shell relative grid min-h-[calc(100vh-72px)] items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-2xl text-white">
          <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em]">
            Hotel booking rebuild
          </span>
          <h1 className="mt-6 font-display text-5xl leading-tight sm:text-6xl lg:text-7xl">
            Discover stays that feel premium on desktop and effortless on mobile.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
            We are moving this project into a full-stack Next.js experience with
            live data, inquiry workflows, owner tools, and a cleaner responsive
            foundation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/80">
            {["Next.js", "Supabase", "Postgres", "Resend", "Vercel"].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2"
                >
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-[32px] border border-white/30 p-5 sm:p-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                Search stays
              </p>
              <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                Start with the essentials
              </h2>
            </div>
            <p className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[var(--color-muted)]">
              Responsive by default
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--color-ink)]">
                Destination
              </span>
              <input
                list="cities"
                value={formState.city}
                onChange={(event) => updateField("city", event.target.value)}
                className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
                placeholder="Try New York"
              />
              <datalist id="cities">
                {featuredCities.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--color-ink)]">
                Check in
              </span>
              <input
                type="date"
                value={formState.checkIn}
                onChange={(event) => updateField("checkIn", event.target.value)}
                className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--color-ink)]">
                Check out
              </span>
              <input
                type="date"
                value={formState.checkOut}
                onChange={(event) => updateField("checkOut", event.target.value)}
                className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--color-ink)]">
                Guests
              </span>
              <input
                type="number"
                min="1"
                max="8"
                value={formState.guests}
                onChange={(event) => updateField("guests", event.target.value)}
                className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-[var(--color-ink)] px-5 py-4 text-sm font-semibold text-white hover:translate-y-[-1px] hover:bg-[var(--color-highlight)]"
          >
            Explore available rooms
          </button>
        </form>
      </div>
    </section>
  );
}
