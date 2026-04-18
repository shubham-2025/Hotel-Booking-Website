"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { heroImage } from "@/src/frontend/assets";
import { featuredCities as fallbackFeaturedCities } from "@/src/frontend/content/demo/site-demo-data";

export function HeroSection({ featuredCities = fallbackFeaturedCities }) {
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

    const queryString = query.toString();
    router.push(queryString ? `/rooms?${queryString}` : "/rooms");
  }

  return (
    <section className="gradient-frame relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(11,26,44,0.82),rgba(18,48,78,0.54),rgba(121,176,230,0.3))]" />

      <div className="page-shell relative grid min-h-[100svh] items-center gap-10 px-4 pb-14 pt-28 lg:grid-cols-[1.1fr_0.9fr] lg:pb-16 lg:pt-32">
        <div className="max-w-2xl text-white animate-enter">
          <span className="inline-flex rounded-full border border-white/22 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/88">
            Modern stay discovery
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
            Find a stay that feels right before you even check in.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
            Browse polished room details, compare popular city stays, and send
            booking requests quickly from a layout that feels smooth on mobile
            and desktop.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/82">
            {["Clear pricing", "Curated rooms", "Fast requests", "Mobile friendly"].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/18 bg-white/10 px-4 py-2"
                >
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-card animate-enter animate-enter-delay rounded-[32px] border border-white/34 p-5 sm:p-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                Start your search
              </p>
              <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                Plan your next stay
              </h2>
            </div>
            <p className="pill-muted">Fast on every screen</p>
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
                className="field-input"
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
                className="field-input"
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
                className="field-input"
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
                className="field-input"
              />
            </label>
          </div>

          <button type="submit" className="button-accent mt-6 w-full">
            Explore available rooms
          </button>
        </form>
      </div>
    </section>
  );
}
