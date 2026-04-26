import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/src/backend/auth/get-current-profile";
import { getCurrentUser } from "@/src/backend/auth/get-current-user";
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

  const currentUser = await getCurrentUser();
  let currentProfile = null;

  try {
    currentProfile = await getCurrentProfile(currentUser);
  } catch {}

  const requestAssurances = room.isBookablePublic
    ? [
        "Sign in so your stay details, payment updates, and itinerary stay together in one place.",
        "Choose dates and a guest count that match the comfort of the room.",
        "We will save your reservation request and guide you through the next step with clarity.",
      ]
    : [
        "Share your preferred dates and guest count in one easy form.",
        "Use the notes field for arrival timing, bedding requests, or special needs.",
        "The hotel can review your message and continue the conversation by email.",
      ];

  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="overflow-hidden rounded-[34px] border border-[rgba(188,208,229,0.9)] bg-[linear-gradient(135deg,rgba(19,48,75,0.96),rgba(39,89,131,0.94),rgba(137,186,229,0.82))] p-6 text-white shadow-[var(--shadow-lift)] sm:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/68">
                {room.hotel.city}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="font-display text-4xl text-white sm:text-5xl">
                  {room.hotel.name}
                </h1>
                <span className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/82 backdrop-blur-sm">
                  {room.roomType}
                </span>
                <span className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/82 backdrop-blur-sm">
                  4.8 guest rating
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-white/76">
                <img
                  src={siteAssets.locationIcon}
                  alt=""
                  className="h-4 w-4 opacity-70 brightness-0 invert"
                />
                <span>{room.hotel.address}</span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/66">
                    Rate
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {formatCurrency(room.pricePerNight)}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/66">
                    Capacity
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {room.guestCapacity} guest{room.guestCapacity === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/66">
                    Visibility
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {room.isBookablePublic ? "Book now" : "Inquiry"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-white/92 p-4 shadow-[var(--shadow-soft)]">
              <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
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
            </div>

            <div className="surface-card mt-8 flex flex-col gap-4 rounded-[30px] p-5 sm:flex-row sm:items-center sm:justify-between">
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
                    className="rounded-full bg-white px-3 py-2 text-xs font-medium text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <SectionHeading
                eyebrow="Stay details"
                title="A room page designed to feel calm, clear, and reassuring"
                description="The gallery, pricing, amenities, and reservation panel work together so guests can decide with confidence."
                align="left"
              />

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {roomHighlights.map((item) => (
                  <div
                    key={item.title}
                    className="surface-card motion-lift rounded-[28px] p-5"
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

          <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
            <BookingInquiryForm
              room={room}
              traveler={currentProfile}
              isAuthenticated={Boolean(currentUser)}
            />

            <div className="surface-card rounded-[32px] p-6">
              <p className="eyebrow-label">
                {room.isBookablePublic ? "Before you book" : "Before you send"}
              </p>
              <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
                {room.isBookablePublic
                  ? "A beautiful stay starts with clear details"
                  : "Share the details that matter most"}
              </h2>
              <div className="mt-5 space-y-3">
                {requestAssurances.map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] bg-[var(--color-card-soft)] px-4 py-3 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
