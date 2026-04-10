import { notFound } from "next/navigation";
import { BookingInquiryForm } from "@/src/frontend/features/booking/booking-inquiry-form.client";
import { SectionHeading } from "@/src/frontend/components/shared/section-heading";
import { formatCurrency } from "@/src/frontend/lib/format";
import { siteAssets } from "@/src/frontend/assets";
import { roomHighlights } from "@/src/frontend/content/demo/site-demo-data";
import { getRoomById } from "@/lib/data";

export async function RoomDetailsScreen({ params }) {
  const { id } = await params;
  const room = await getRoomById(id);

  if (!room) {
    notFound();
  }

  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              {room.hotel.city}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl text-[var(--color-ink)] sm:text-5xl">
                {room.hotel.name}
              </h1>
              <span className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-xs font-semibold text-[var(--color-accent-strong)]">
                {room.roomType}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <img
                src={siteAssets.locationIcon}
                alt=""
                className="h-4 w-4 opacity-70"
              />
              <span>{room.hotel.address}</span>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
              <img
                src={room.images[0]}
                alt={room.hotel.name}
                className="h-full min-h-72 w-full rounded-[30px] object-cover"
              />

              <div className="grid grid-cols-2 gap-4">
                {room.images.slice(1).map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt={room.hotel.name}
                    className="aspect-square w-full rounded-[24px] object-cover"
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[30px] border border-[var(--color-line)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-soft)]">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                  Price
                </p>
                <p className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">
                  {formatCurrency(room.pricePerNight)}
                  <span className="text-base font-normal text-[var(--color-muted)]">
                    {" "}
                    / night
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-white px-3 py-2 text-xs text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <SectionHeading
                eyebrow="Stay details"
                title="What this room experience promises"
                description="The current content still uses sample data, but this structure is ready to map cleanly to Supabase tables and route-level fetching."
                align="left"
              />

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {roomHighlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[28px] border border-[var(--color-line)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-soft)]"
                  >
                    <img src={item.icon} alt="" className="h-8 w-8" />
                    <p className="mt-4 text-lg font-semibold text-[var(--color-ink)]">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <BookingInquiryForm room={room} />

            <div className="rounded-[32px] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                Owner note
              </p>
              <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                Backend-ready booking capture
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
                This page now includes a real inquiry form that can persist to
                Supabase and notify the team through Resend once environment
                variables are configured.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
