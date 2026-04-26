import Link from "next/link";
import { toggleOwnerHotelAvailabilityAction } from "@/src/backend/owner/owner-hotel-actions";
import { getOwnerHotelBootstrapData } from "@/src/backend/repositories/owner-repository";
import { QueryStatusToast } from "@/src/frontend/components/feedback/query-status-toast.client";
import { PendingSubmitButton } from "@/src/frontend/components/shared/pending-submit-button.client";
import { HotelSetupPanel } from "@/src/frontend/features/owner/hotel-setup-panel.client";

const noticeMessages = {
  owner_access_ready:
    "Your hosting space is ready. Add your property details to open the rest of the experience.",
  hotel_updated: "Your property details were refreshed successfully.",
  hotel_published:
    "Your property is now visible to travelers browsing available stays.",
  hotel_unpublished: "Your property has been returned to private viewing.",
};

const errorMessages = {
  hotel_not_found:
    "We could not find that property in your hosting space. Refresh and try again.",
  hotel_action_invalid: "We could not understand that property action.",
  hotel_visibility_failed:
    "We could not update property visibility right now. Please try again shortly.",
};

function formatHotelStatus(status) {
  if (!status) {
    return "Draft";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function PropertyHero({ primaryHotel, totalHotels, isHotelActive }) {
  return (
    <div className="overflow-hidden rounded-[34px] border border-[rgba(188,208,229,0.9)] bg-[linear-gradient(135deg,#f7fbff,#ffffff)] p-6 shadow-[var(--shadow-lift)]">
      <div className="grid gap-6">
        <div className="overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-white shadow-[0_18px_40px_rgba(18,36,59,0.08)]">
          <img
            src={
              primaryHotel?.heroImageUrl ||
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
            }
            alt={primaryHotel?.name}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>

        <div className="min-w-0 rounded-[28px] border border-[rgba(213,225,239,0.92)] bg-white/88 p-5 shadow-[0_14px_30px_rgba(18,36,59,0.05)] sm:p-6">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)]">
              Signature profile
            </span>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
              {formatHotelStatus(primaryHotel?.status)}
            </span>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
              {totalHotels} hotel{totalHotels === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
              Featured property
            </p>
            <h2 className="mt-2 break-words font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
              {primaryHotel?.name}
            </h2>
            <p className="mt-3 max-w-3xl break-words text-sm leading-7 text-[var(--color-muted)]">
              {primaryHotel?.city} | {primaryHotel?.address}
            </p>
          </div>

          {primaryHotel?.description ? (
            <p className="mt-5 max-w-4xl break-words text-sm leading-8 text-[var(--color-muted)]">
              {primaryHotel.description}
            </p>
          ) : (
            <p className="mt-5 max-w-4xl text-sm leading-8 text-[var(--color-muted)]">
              Share a few thoughtful details about the mood, location, and
              comfort of your hotel so guests know what makes the stay memorable.
            </p>
          )}

          {primaryHotel?.amenities?.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {primaryHotel.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full bg-white px-3 py-2 text-xs font-medium text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
                >
                  {amenity}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-6 rounded-[24px] border border-[rgba(213,225,239,0.92)] bg-[linear-gradient(180deg,rgba(247,251,255,0.92),rgba(255,255,255,0.98))] p-5 shadow-[0_14px_30px_rgba(18,36,59,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
              Guest impression
            </p>
            <p className="mt-3 text-sm leading-8 text-[var(--color-muted)]">
              {isHotelActive
                ? "Your property is open to travelers. Keep the details elegant, current, and reassuring so the first impression matches the stay."
                : "Your property is currently private. Take time to perfect the story, visuals, and details before you welcome guests in."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisibilityCard({ primaryHotel, isHotelActive }) {
  return (
    <div className="overflow-hidden rounded-[34px] border border-[rgba(188,208,229,0.9)] bg-[linear-gradient(180deg,#ffffff,#f7fbff)] p-6 shadow-[var(--shadow-soft)]">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
        Visibility
      </p>
      <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
        {isHotelActive ? "Open for discovery" : "Quietly private"}
      </h2>
      <p className="mt-3 text-sm leading-8 text-[var(--color-muted)]">
        {isHotelActive
          ? "Travelers can discover this hotel while browsing available stays. Keep the listing active when the imagery, details, and contact information feel ready."
          : "Keep the hotel private until everything feels refined. When you are ready, publish it so travelers can discover the experience you have created."}
      </p>

      <div className="mt-5 rounded-[26px] bg-[rgba(231,244,255,0.72)] px-4 py-4 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[rgba(188,208,229,0.72)]">
        Rooms become visible only when both the hotel and the room are available
        to guests.
      </div>

      <form action={toggleOwnerHotelAvailabilityAction} className="mt-6">
        <input type="hidden" name="hotelId" value={primaryHotel?._id || ""} />
        <input
          type="hidden"
          name="nextState"
          value={isHotelActive ? "unpublish" : "publish"}
        />
        <PendingSubmitButton
          idleLabel={isHotelActive ? "Pause visibility" : "Open to guests"}
          pendingLabel={
            isHotelActive ? "Updating visibility..." : "Opening to guests..."
          }
          className="button-primary min-h-11 w-full px-5"
        />
      </form>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/owner" className="button-secondary min-h-11 px-5">
          Back to dashboard
        </Link>
        <Link href="/owner/list-room" className="button-secondary min-h-11 px-5">
          View rooms
        </Link>
      </div>
    </div>
  );
}

export async function OwnerHotelSetupScreen({ searchParams }) {
  const hotelSetupData = await getOwnerHotelBootstrapData();
  const params = (await searchParams) || {};
  const ownerName =
    hotelSetupData.profile?.full_name ||
    hotelSetupData.profile?.email ||
    "Owner";
  const noticeCode =
    typeof params.notice === "string" ? params.notice : "";
  const errorCode = typeof params.error === "string" ? params.error : "";
  const feedbackToast = (
    <QueryStatusToast
      noticeCode={noticeCode}
      errorCode={errorCode}
      noticeMessages={noticeMessages}
      errorMessages={errorMessages}
    />
  );

  if (hotelSetupData.status === "unavailable") {
    return (
      <div>
        {feedbackToast}
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Property profile
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Property details are temporarily unavailable
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          {hotelSetupData.reason}
        </p>
      </div>
    );
  }

  if (hotelSetupData.status !== "no_hotel") {
    const primaryHotel = hotelSetupData.primaryHotel;
    const isHotelActive = primaryHotel?.status === "active";

    return (
      <div>
        {feedbackToast}
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Property profile
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Present your hotel with warmth, clarity, and confidence
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-[var(--color-muted)]">
          Shape the feeling guests get before they arrive. Update your story,
          imagery, and visibility so the property feels polished, welcoming,
          and ready to book.
        </p>

        <div className="mt-8 grid gap-5 2xl:grid-cols-[minmax(0,1.18fr)_320px]">
          <PropertyHero
            primaryHotel={primaryHotel}
            totalHotels={hotelSetupData.metrics.totalHotels}
            isHotelActive={isHotelActive}
          />
          <VisibilityCard
            primaryHotel={primaryHotel}
            isHotelActive={isHotelActive}
          />
        </div>

        <div className="mt-8 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[34px] border border-[rgba(188,208,229,0.9)] bg-white/94 p-6 shadow-[var(--shadow-soft)]">
            <HotelSetupPanel
              profile={hotelSetupData.profile}
              hotel={primaryHotel}
              mode="edit"
            />
          </div>

          <div className="overflow-hidden rounded-[34px] border border-[rgba(188,208,229,0.9)] bg-[linear-gradient(180deg,#ffffff,#f7fbff)] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
              Visibility notes
            </p>
            <div className="mt-4 space-y-3 text-sm leading-8 text-[var(--color-muted)]">
              <p>1. Publish only when the hotel story, imagery, and details feel complete.</p>
              <p>2. A room can welcome guests only when both the room and the hotel are active.</p>
              <p>3. Clear presentation builds trust before a guest ever steps inside.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/owner" className="button-secondary min-h-11 px-5">
            Back to dashboard
          </Link>
          <Link href="/owner/list-room" className="button-primary min-h-11 px-5">
            Continue to room collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {feedbackToast}
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
        Property profile
      </p>
      <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
        Welcome your first property, {ownerName}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-8 text-[var(--color-muted)]">
        Begin with the details guests notice first: your name, imagery,
        location, and the personality of the stay. Once this profile is ready,
        you can continue into rooms, rates, and bookings.
      </p>

      <div className="mt-8 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[34px] border border-[rgba(188,208,229,0.9)] bg-white/94 p-6 shadow-[var(--shadow-soft)]">
          <HotelSetupPanel profile={hotelSetupData.profile} />
        </div>

        <div className="overflow-hidden rounded-[34px] border border-[rgba(188,208,229,0.9)] bg-[linear-gradient(180deg,#ffffff,#f7fbff)] p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
            A calm launch path
          </p>
          <div className="mt-4 space-y-3 text-sm leading-8 text-[var(--color-muted)]">
            <p>1. Your property becomes the heart of the hosting workspace.</p>
            <p>2. The dashboard begins reflecting your hotel imagery and details.</p>
            <p>3. You can then add rooms, pricing, and guest-ready presentation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
