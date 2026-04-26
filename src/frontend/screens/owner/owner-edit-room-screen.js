import Link from "next/link";
import { getOwnerRoomForEditData } from "@/src/backend/repositories/owner-repository";
import { EditRoomPanel } from "@/src/frontend/features/owner/edit-room-panel.client";

export async function OwnerEditRoomScreen({ roomId }) {
  const roomData = await getOwnerRoomForEditData(roomId);

  if (roomData.status === "unavailable") {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Edit room
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Room editor is temporarily unavailable
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          {roomData.reason}
        </p>
      </div>
    );
  }

  if (roomData.status === "no_hotel") {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Edit room
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Create your hotel before managing rooms
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          Room management opens once a property profile is linked to your
          hosting space.
        </p>
        <div className="mt-8">
          <Link href="/owner/setup-hotel" className="button-primary min-h-11 px-5">
            Set up your hotel
          </Link>
        </div>
      </div>
    );
  }

  if (roomData.status === "not_found" || !roomData.room) {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Edit room
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          We could not find that room
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          This room may no longer exist, or it may belong to a different
          property space.
        </p>
        <div className="mt-8">
          <Link href="/owner/list-room" className="button-secondary min-h-11 px-5">
            Back to inventory
          </Link>
        </div>
      </div>
    );
  }

  return <EditRoomPanel room={roomData.room} hotel={roomData.primaryHotel} />;
}
