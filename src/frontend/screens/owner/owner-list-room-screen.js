import Link from "next/link";
import { toggleOwnerRoomAvailabilityAction } from "@/src/backend/owner/owner-room-actions";
import { PendingSubmitButton } from "@/src/frontend/components/shared/pending-submit-button.client";
import { formatCurrency } from "@/src/frontend/lib/format";
import { getOwnerRoomsData } from "@/src/backend/repositories/owner-repository";
import { QueryStatusToast } from "@/src/frontend/components/feedback/query-status-toast.client";
import { OwnerPageHeader } from "@/src/frontend/components/owner/owner-page-header";
import { OwnerStatGrid } from "@/src/frontend/components/owner/owner-stat-grid";

const noticeMessages = {
  hotel_created:
    "Your property was saved beautifully. You can start adding rooms right away.",
  hotel_exists:
    "Your property is already in place. You can continue with your room collection.",
  room_created: "Your room was saved successfully.",
  room_updated: "Your room details were refreshed successfully.",
  room_published:
    "This room is now ready to appear to guests when the property is visible.",
  room_unpublished: "This room has been returned to private viewing.",
};

const errorMessages = {
  room_not_found:
    "We could not find that room in your hosting space. Refresh and try again.",
  room_action_invalid: "We could not understand that room action.",
  room_visibility_failed:
    "We could not update room visibility right now. Please try again shortly.",
};

function formatHotelStatus(status) {
  if (!status) {
    return "Draft";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function summarizeDescription(value = "", maxLength = 150) {
  const normalized = value.trim();

  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function InventoryRow({ room }) {
  const amenityPreview = room.amenities.slice(0, 4);
  const hiddenAmenityCount = Math.max(room.amenities.length - amenityPreview.length, 0);
  const photoSummary = room.uploadedImages?.length
    ? `${room.uploadedImages.length} uploaded`
    : "Preview image only";

  return (
    <article className="px-5 py-6">
      <img
        src={room.images[0]}
        alt={room.hotel?.name}
        className="aspect-[16/8] w-full rounded-[24px] object-cover"
      />

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-[var(--color-card-soft)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)] ring-1 ring-[var(--color-line)]">
          {room.roomType}
        </span>
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${
            room.isAvailable
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-200 text-slate-700"
          }`}
        >
          {room.isAvailable ? "Active" : "Draft"}
        </span>
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <h2 className="break-words font-display text-[clamp(2rem,2.6vw,3rem)] leading-[1.02] text-[var(--color-ink)] [overflow-wrap:anywhere]">
            {room.name || room.roomType}
          </h2>

          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            {room.hotel?.city || "Property location"} | {room.hotel?.name || "Private stay"}
          </p>

          {room.description ? (
            <p className="mt-4 max-w-3xl break-words text-sm leading-7 text-[var(--color-muted)] [overflow-wrap:anywhere]">
              {summarizeDescription(room.description, 180)}
            </p>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] bg-[var(--color-card-soft)] px-4 py-4 ring-1 ring-[var(--color-line)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
                Guests
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
                {room.guestCapacity}
              </p>
            </div>
            <div className="rounded-[22px] bg-[var(--color-card-soft)] px-4 py-4 ring-1 ring-[var(--color-line)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
                Beds
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
                {room.bedroomCount}
              </p>
            </div>
            <div className="rounded-[22px] bg-[var(--color-card-soft)] px-4 py-4 ring-1 ring-[var(--color-line)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
                Baths
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
                {room.bathroomCount}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {amenityPreview.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
              >
                {amenity}
              </span>
            ))}
            {hiddenAmenityCount ? (
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
                +{hiddenAmenityCount} more
              </span>
            ) : null}
          </div>
        </div>

        <aside className="xl:border-l xl:border-[var(--color-line)] xl:pl-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[24px] bg-[var(--color-card-soft)] px-4 py-4 ring-1 ring-[var(--color-line)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                Nightly rate
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
                {formatCurrency(room.pricePerNight)}
              </p>
            </div>

            <div className="rounded-[24px] bg-white px-4 py-4 ring-1 ring-[var(--color-line)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                Photos
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                {photoSummary}
              </p>
            </div>

            <div className="rounded-[24px] bg-white px-4 py-4 ring-1 ring-[var(--color-line)] sm:col-span-2 xl:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                Actions
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                {room.isAvailable
                  ? "Visible to travelers while the property is also open."
                  : "Kept private until you are ready to share it."}
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href={`/owner/rooms/${room._id}/edit`}
                  className="button-secondary min-h-11 w-full"
                >
                  Refine room
                </Link>

                <form action={toggleOwnerRoomAvailabilityAction}>
                  <input type="hidden" name="roomId" value={room._id} />
                  <input
                    type="hidden"
                    name="nextState"
                    value={room.isAvailable ? "unpublish" : "publish"}
                  />
                  <PendingSubmitButton
                    idleLabel={room.isAvailable ? "Pause visibility" : "Open to guests"}
                    pendingLabel={
                      room.isAvailable ? "Updating visibility..." : "Opening room..."
                    }
                    className={`min-h-11 w-full rounded-full px-4 text-sm font-semibold transition ${
                      room.isAvailable
                        ? "border border-[var(--color-line)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-card-soft)]"
                        : "button-primary"
                    }`}
                  />
                </form>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

export async function OwnerListRoomScreen({ searchParams }) {
  const ownerRoomsData = await getOwnerRoomsData();
  const params = (await searchParams) || {};
  const primaryHotel = ownerRoomsData.primaryHotel;
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

  if (ownerRoomsData.status === "unavailable") {
    return (
      <div className="space-y-8">
        {feedbackToast}
        <OwnerPageHeader
          eyebrow="Room collection"
          title="Your room collection is temporarily unavailable"
          description={ownerRoomsData.reason}
        />
      </div>
    );
  }

  if (ownerRoomsData.status === "no_hotel") {
    return (
      <div className="space-y-8">
        {feedbackToast}
        <OwnerPageHeader
          eyebrow="Room collection"
          title="Add a property before building rooms"
          description="Rooms are managed around a hotel profile. Once the property is in place, this page becomes your room inventory workspace."
          actions={
            <Link href="/owner/setup-hotel" className="button-primary min-h-11 px-5">
              Set up property
            </Link>
          }
        />

        <section className="rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-white/96 p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm leading-8 text-[var(--color-muted)]">
            Create the property profile first. After that, every room you add
            here will feel connected, organized, and ready for operational
            review.
          </p>
        </section>
      </div>
    );
  }

  const draftCount =
    ownerRoomsData.metrics.totalRooms - ownerRoomsData.metrics.activeRooms;
  const stats = [
    {
      label: "Total rooms",
      value: ownerRoomsData.metrics.totalRooms,
      tone: "accent",
    },
    {
      label: "Open to guests",
      value: ownerRoomsData.metrics.activeRooms,
      tone: "success",
    },
    {
      label: "Private rooms",
      value: draftCount,
      tone: "warm",
    },
    {
      label: "Property status",
      value: formatHotelStatus(primaryHotel?.status),
      tone: "neutral",
    },
  ];

  return (
    <div className="space-y-8">
      {feedbackToast}
      <OwnerPageHeader
        eyebrow="Room collection"
        title="Manage your room inventory with clarity"
        description={`Review pricing, guest capacity, imagery, and visibility for rooms at ${primaryHotel?.name}.`}
        meta={
          <>
            <span className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)]">
              {primaryHotel?.city}
            </span>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
              {formatHotelStatus(primaryHotel?.status)}
            </span>
          </>
        }
        actions={
          <>
            <Link href="/owner/add-room" className="button-primary min-h-11 px-5">
              Add room
            </Link>
            <Link href="/owner" className="button-secondary min-h-11 px-5">
              Back to dashboard
            </Link>
          </>
        }
      />

      <OwnerStatGrid items={stats} />

      <section className="rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-white/96 p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              Inventory
            </p>
            <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
              Rooms in this property
            </h2>
          </div>

          <p className="text-sm leading-7 text-[var(--color-muted)]">
            Keep visibility, pricing, and room details aligned from one quieter
            operational view.
          </p>
        </div>

        {ownerRoomsData.status === "no_rooms" ? (
          <div className="mt-6 rounded-[24px] bg-[var(--color-card-soft)] px-5 py-5 ring-1 ring-[var(--color-line)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              No rooms yet
            </p>
            <h3 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
              Add the first room for this property
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-[var(--color-muted)]">
              Start with the room that best represents the stay you want guests
              to discover first.
            </p>
            <div className="mt-6">
              <Link href="/owner/add-room" className="button-primary min-h-11 px-5">
                Add first room
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[rgba(250,252,254,0.96)]">
            {ownerRoomsData.rooms.map((room, index) => (
              <div
                key={room._id}
                className={index === 0 ? "" : "border-t border-[var(--color-line)]"}
              >
                <InventoryRow room={room} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
