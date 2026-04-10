import Link from "next/link";
import { HeroSection } from "@/src/frontend/sections/home/hero-section";
import { HotelCard } from "@/src/frontend/components/site/hotel-card";
import { NewsletterForm } from "@/src/frontend/features/newsletter/newsletter-form.client";
import { SectionHeading } from "@/src/frontend/components/shared/section-heading";
import { siteAssets } from "@/src/frontend/assets";
import {
  exclusiveOffers,
  roomHighlights,
  rooms,
  testimonials,
} from "@/src/frontend/content/demo/site-demo-data";

export function HomeScreen() {
  return (
    <>
      <HeroSection />

      <section className="section-space">
        <div className="page-shell">
          <SectionHeading
            eyebrow="What already exists"
            title="A strong visual foundation is already in place"
            description="The project already had home, listing, room details, bookings, and owner dashboard screens. This rebuild keeps those flows, removes SPA routing constraints, and makes the layout work properly on mobile."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {rooms.slice(0, 4).map((room, index) => (
              <HotelCard
                key={room._id}
                room={room}
                featuredLabel={index % 2 === 0 ? "Best Seller" : "Fast fill"}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-white/60">
        <div className="page-shell grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <SectionHeading
            eyebrow="Migration blueprint"
            title="What we are adding next"
            description="The architecture now targets Next.js App Router on Vercel, Supabase Postgres for core data, Resend for email workflows, and owner-side forms that can later connect directly to authenticated actions."
            align="left"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Supabase auth and role-based owner access",
              "Room creation with Storage uploads",
              "Booking pipeline with inquiry persistence",
              "Transactional emails for booking events",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[28px] border border-[var(--color-line)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-soft)]"
              >
                <p className="text-sm leading-7 text-[var(--color-muted)]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="page-shell">
          <SectionHeading
            eyebrow="Offers"
            title="Campaign sections are still useful after the migration"
            description="These promotional blocks can later be driven from a CMS table or a Supabase admin panel without changing the frontend layout again."
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {exclusiveOffers.map((offer) => (
              <article
                key={offer._id}
                className="relative overflow-hidden rounded-[32px] p-6 text-white shadow-[var(--shadow-soft)]"
              >
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,26,44,0.18),rgba(11,26,44,0.82))]" />
                <div className="relative flex h-full min-h-80 flex-col justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--color-ink)]">
                      {offer.priceOff}% off
                    </span>
                    <h3 className="mt-4 font-display text-3xl">{offer.title}</h3>
                    <p className="mt-3 max-w-md text-sm leading-7 text-white/80">
                      {offer.description}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-white/80">
                    Expires {offer.expiryDate}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-white/60">
        <div className="page-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-[var(--color-line)] bg-[var(--color-card)] p-6 shadow-[var(--shadow-soft)] sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              Room promise
            </p>
            <h2 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
              Details that should later come from the database
            </h2>
            <div className="mt-8 space-y-5">
              {roomHighlights.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <img src={item.icon} alt="" className="mt-1 h-7 w-7" />
                  <div>
                    <p className="text-lg font-semibold text-[var(--color-ink)]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-7 text-[var(--color-muted)]">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Social proof"
              title="Testimonials can stay front-facing while reviews move to Postgres later"
              description="The current testimonial block was already a good content section. It now behaves better across screen sizes and leaves room for a future reviews table."
              align="left"
            />

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.id}
                  className="rounded-[28px] border border-[var(--color-line)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-soft)]"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-display text-2xl text-[var(--color-ink)]">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">
                        {testimonial.address}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
                    &ldquo;{testimonial.review}&rdquo;
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="page-shell">
          <div className="overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#12243b,#183e6f,#7c3b11)] p-6 text-white shadow-[var(--shadow-soft)] sm:p-8 lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                  Resend integration starter
                </p>
                <h2 className="mt-3 font-display text-4xl sm:text-5xl">
                  Newsletter flow is now ready to hit a real API route
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-8 text-white/78 sm:text-base">
                  Subscribe requests now go through a Next.js route handler. Once
                  the environment variables are added, we can persist leads in
                  Supabase and forward notifications through Resend.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/75">
                  {["POST /api/newsletter", "Supabase upsert", "Resend email"].map(
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

              <div className="rounded-[28px] border border-white/12 bg-white/8 p-5">
                <img
                  src={siteAssets.badgeIcon}
                  alt=""
                  className="h-10 w-10 opacity-80"
                />
                <NewsletterForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="page-shell">
          <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                Ready next
              </p>
              <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                Continue into rooms, bookings, and owner flows
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/rooms"
                className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white"
              >
                Browse rooms
              </Link>
              <Link
                href="/owner"
                className="rounded-full border border-[var(--color-line)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)]"
              >
                Open owner dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
