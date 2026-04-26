import Link from "next/link";
import { toggleOwnerRoomAvailabilityAction } from "@/src/backend/owner/owner-room-actions";
import { PendingSubmitButton } from "@/src/frontend/components/shared/pending-submit-button.client";
import { formatCurrency } from "@/src/frontend/lib/format";
import { getOwnerRoomsData } from "@/src/backend/repositories/owner-repository";
import { QueryStatusToast } from "@/src/frontend/components/feedback/query-status-toast.client";

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
      <div>
        {feedbackToast}
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Inventory
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Your room collection is temporarily unavailable
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          {ownerRoomsData.reason}
        </p>
      </div>
    );
  }

  if (ownerRoomsData.status === "no_hotel") {
    return (
      <div>
        {feedbackToast}
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Inventory
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Add a property before styling your rooms
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          Rooms are designed around a property profile. Once your hotel is in
          place, this page will become your full room collection.
        </p>

        <div className="mt-8 rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
            First step
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
            Create the property profile first. After that, every room you add
            here will feel connected, polished, and ready to present.
            </p>
          <div className="mt-5">
            <Link href="/owner/setup-hotel" className="button-primary min-h-11 px-5">
              Set up your hotel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {feedbackToast}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Inventory
          </p>
          <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
            Your room collection
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
            Shape the rooms guests will browse, compare, and remember. This is
            your quiet workspace for styling availability, pricing, and imagery.
          </p>
        </div>

        {ownerRoomsData.rooms.length ? (
          <span className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            {ownerRoomsData.metrics.totalRooms} room
            {ownerRoomsData.metrics.totalRooms === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <div className="mt-8 rounded-[30px] border border-[var(--color-line)] bg-[#fbfcfe] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
              Property
            </p>
            <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
              {primaryHotel?.name}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {primaryHotel?.city} | {primaryHotel?.address}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)] ring-1 ring-[var(--color-line)]">
              {formatHotelStatus(primaryHotel?.status)}
            </span>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
              {ownerRoomsData.metrics.totalHotels} hotel
              {ownerRoomsData.metrics.totalHotels === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      {ownerRoomsData.status === "no_rooms" ? (
        <div className="mt-8 rounded-[30px] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            No rooms yet
          </p>
          <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
            Your property is ready for its first room
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
            Start with the room that best represents the stay you want guests
            to discover first.
          </p>
          <div className="mt-5">
            <Link href="/owner/add-room" className="button-primary min-h-11 px-5">
              Add your first room
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {ownerRoomsData.rooms.map((room) => (
            <article
              key={room._id}
              className="rounded-[28px] border border-[var(--color-line)] bg-[#fbfcfe] p-4 shadow-[var(--shadow-soft)]"
            >
              <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_240px]">
                <img
                  src={room.images[0]}
                  alt={room.hotel?.name}
                  className="aspect-[4/3] w-full rounded-[24px] object-cover"
                />
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                    {room.hotel?.city}
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                    {room.name || room.roomType}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {room.roomType}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                    Capacity {room.guestCapacity} | {room.bedroomCount} bedroom
                    {room.bedroomCount === 1 ? "" : "s"} | {room.bathroomCount} bathroom
                    {room.bathroomCount === 1 ? "" : "s"}
                  </p>
                  {room.description ? (
                    <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                      {room.description}
                    </p>
                  ) : null}
                  <p className="mt-3 text-sm text-[var(--color-muted)]">
                    {room.uploadedImages?.length
                      ? `${room.uploadedImages.length} uploaded photo${
                          room.uploadedImages.length === 1 ? "" : "s"
                        } uploaded`
                      : "Preview image in place until your room photos are added"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {room.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full bg-white px-3 py-1 text-xs text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-between rounded-[24px] bg-white p-4 ring-1 ring-[var(--color-line)]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                      Nightly price
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
                      {formatCurrency(room.pricePerNight)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                      Status
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-2 text-xs font-semibold ${
                        room.isAvailable
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {room.isAvailable ? "Active" : "Draft"}
                    </span>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                      {room.isAvailable
                        ? "Visible to guests while the property is also open."
                        : "Kept private until you are ready to share it."}
                    </p>
                  </div>

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
                        idleLabel={room.isAvailable ? "Unpublish room" : "Publish room"}
                        pendingLabel={
                          room.isAvailable ? "Unpublishing room..." : "Publishing room..."
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
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
