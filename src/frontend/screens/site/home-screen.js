import Link from "next/link";
import { siteAssets } from "@/src/frontend/assets";
import { HeroSection } from "@/src/frontend/sections/home/hero-section";
import { HotelCard } from "@/src/frontend/components/site/hotel-card";
import { NewsletterForm } from "@/src/frontend/features/newsletter/newsletter-form.client";
import { SectionHeading } from "@/src/frontend/components/shared/section-heading";
import {
  exclusiveOffers,
  roomHighlights,
  rooms,
  testimonials,
} from "@/src/frontend/content/demo/site-demo-data";

const travelerReasons = [
  {
    title: "Clear room details",
    description:
      "Everything important stays visible at a glance, from amenities and rates to location cues and room types.",
  },
  {
    title: "Better on mobile",
    description:
      "Search, compare, and send a booking request without cramped layouts or awkward tap targets.",
  },
  {
    title: "Consistent booking flow",
    description:
      "From the home page to room detail, the interface keeps the same visual rhythm and decision path.",
  },
  {
    title: "Calm visual design",
    description:
      "A cleaner hierarchy, more readable spacing, and stronger CTA styling make the experience feel more reliable.",
  },
];

const featuredLabels = [
  "Guest favorite",
  "Popular pick",
  "Weekend-ready",
  "Top rated",
];

const staySignals = [
  {
    value: "4.8/5",
    label: "average traveler rating",
  },
  {
    value: "24 hrs",
    label: "typical reply window",
  },
  {
    value: "4 hubs",
    label: "popular city choices",
  },
];

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <img
          key={`${rating}-${index}`}
          src={
            index < rating
              ? siteAssets.starIconFilled
              : siteAssets.starIconOutlined
          }
          alt=""
          className="h-4 w-4"
        />
      ))}
    </div>
  );
}

export function HomeScreen() {
  return (
    <div className="home-canvas">
      <HeroSection />

      <section className="section-space">
        <div className="page-shell">
          <SectionHeading
            eyebrow="Featured stays"
            title="Popular rooms for city breaks, short work trips, and easy weekend escapes"
            description="These highlighted stays give the home page a strong first impression while keeping room discovery simple and visually consistent."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {rooms.slice(0, 4).map((room, index) => (
              <HotelCard
                key={room._id}
                room={room}
                featuredLabel={featuredLabels[index] || "Featured stay"}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-space section-wash">
        <div className="page-shell">
          <SectionHeading
            eyebrow="Why QuickStay"
            title="A cleaner booking experience starts with better visual decisions"
            description="The experience now feels more polished, more readable, and far easier to browse on smaller screens without changing the overall product flow."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {travelerReasons.map((item) => (
              <article
                key={item.title}
                className="surface-card motion-lift rounded-[30px] p-6"
              >
                <p className="eyebrow-label">Traveler benefit</p>
                <h3 className="mt-4 font-display text-[1.6rem] text-[var(--color-ink)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-8 text-[var(--color-muted)]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="page-shell">
          <SectionHeading
            eyebrow="Offers"
            title="Seasonal offers that feel helpful instead of cluttered"
            description="Promotional blocks work best when the visuals stay clean and the value is obvious at a glance."
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {exclusiveOffers.map((offer) => (
              <article
                key={offer._id}
                className="motion-lift relative overflow-hidden rounded-[32px] p-6 text-white shadow-[var(--shadow-soft)]"
              >
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,26,44,0.16),rgba(11,26,44,0.84))]" />
                <div className="relative flex h-full min-h-[18.5rem] flex-col gap-5">
                  <div>
                    <span className="inline-flex rounded-full bg-white/92 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)]">
                      Save {offer.priceOff}%
                    </span>
                    <h3 className="mt-4 font-display text-3xl">{offer.title}</h3>
                    <p className="mt-3 max-w-md text-sm leading-7 text-white/82">
                      {offer.description}
                    </p>
                    <p className="mt-4 max-w-md text-sm leading-6 text-white/68">
                      {offer.note}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-white/78">
                    Available until {offer.expiryDate}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-panel-soft section-space">
        <div className="page-shell grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="surface-card rounded-[32px] p-6 sm:p-7">
            <p className="eyebrow-label">Stay essentials</p>
            <h2 className="mt-3 font-display text-4xl text-[var(--color-ink)]">
              The details travelers look for first
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

            <div className="mt-8 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#17324d,#275983,#6ea8dd)] p-5 text-white shadow-[var(--shadow-soft)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                Quick snapshot
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {staySignals.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm"
                  >
                    <p className="font-display text-2xl text-white">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-white/74">{item.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/74">
                Guests usually decide faster when pricing, response speed, and
                room essentials stay visible without extra scrolling.
              </p>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Guest feedback"
              title="A trust-building section that now feels more polished and readable"
              description="Testimonials remain simple, but better spacing, cleaner typography, and stronger card rhythm make them feel more credible."
              align="left"
            />

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.id}
                  className="surface-card motion-lift rounded-[28px] p-5"
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
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2.5">
                      <RatingStars rating={testimonial.rating} />
                    </div>
                    <span className="inline-flex items-center rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent-strong)]">
                      Verified stay
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
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
          <div className="overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#14304b,#275983,#95c6ef)] p-6 text-white shadow-[var(--shadow-soft)] sm:p-8 lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                  Stay inspired
                </p>
                <h2 className="mt-3 font-display text-4xl sm:text-5xl">
                  Get first access to new stays and limited-time offers
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-8 text-white/78 sm:text-base">
                  Join the QuickStay list for city-break ideas, seasonal offers,
                  and fresh room picks that are worth opening first.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/75">
                  {["Weekend ideas", "Fresh openings", "Special rates"].map(
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

              <div className="rounded-[28px] border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
                <NewsletterForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="page-shell">
          <div className="surface-card flex flex-col gap-4 rounded-[32px] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow-label">Ready to browse</p>
              <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
                Pick a room, compare the details, and keep moving
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/rooms" className="button-primary-strong">
                Browse rooms
              </Link>
              <Link href="/create-account" className="button-secondary">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
