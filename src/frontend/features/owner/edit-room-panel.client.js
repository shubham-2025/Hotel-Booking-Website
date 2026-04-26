"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { updateOwnerRoomAction } from "@/src/backend/owner/owner-room-actions";

const amenityOptions = [
  "Free WiFi",
  "Free Breakfast",
  "Room Service",
  "Mountain View",
  "Pool Access",
];

const initialFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

function FieldError({ errors }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-sm text-rose-600">{errors[0]}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="button-primary min-h-12 px-5 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Saving room..." : "Save room changes"}
    </button>
  );
}

export function EditRoomPanel({ room, hotel }) {
  const [state, formAction] = useActionState(
    updateOwnerRoomAction,
    initialFormState,
  );
  const [roomType, setRoomType] = useState(room.roomType);
  const [selectedAmenities, setSelectedAmenities] = useState(room.amenities || []);
  const [retainedImageUrls, setRetainedImageUrls] = useState(
    room.uploadedImages || [],
  );
  const [selectedImageNames, setSelectedImageNames] = useState([]);
  const lastErrorToastRef = useRef("");
  const [roomSummary, setRoomSummary] = useState({
    pricePerNight: String(room.pricePerNight || ""),
    guestCapacity: String(room.guestCapacity || "1"),
    bedroomCount: String(room.bedroomCount || "1"),
    bathroomCount: String(room.bathroomCount || "1"),
    description: room.description || "",
    name: room.name || "",
  });

  useEffect(() => {
    if (state.status !== "error" || !state.message) {
      return;
    }

    if (lastErrorToastRef.current === state.message) {
      return;
    }

    lastErrorToastRef.current = state.message;
    toast.error(state.message);
  }, [state.message, state.status]);

  function toggleAmenity(amenity) {
    setSelectedAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity],
    );
  }

  function updateSummaryField(key, value) {
    setRoomSummary((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function removeExistingImage(imageUrl) {
    setRetainedImageUrls((current) =>
      current.filter((value) => value !== imageUrl),
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="roomId" value={room._id} />
      {retainedImageUrls.map((imageUrl) => (
        <input
          key={imageUrl}
          type="hidden"
          name="existingImageUrls"
          value={imageUrl}
        />
      ))}

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Edit room
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Update {room.name || room.roomType}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          Refresh the details, imagery, and comfort notes so the room feels
          polished, welcoming, and ready for the right guest.
        </p>
      </div>

      <div className="rounded-[26px] bg-[#f7fbff] p-4 ring-1 ring-[#d7e5f7]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
          Property
        </p>
        <p className="mt-2 text-xl font-semibold text-[var(--color-ink)]">
          {hotel?.name}
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {hotel?.city} | {hotel?.address}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">Room name</span>
          <input
            type="text"
            name="name"
            value={roomSummary.name}
            onChange={(event) => updateSummaryField("name", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
            placeholder="River View Deluxe"
          />
          <FieldError errors={state.fieldErrors?.name} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">Room type</span>
          <select
            name="roomType"
            value={roomType}
            onChange={(event) => setRoomType(event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          >
            <option>Single Bed</option>
            <option>Double Bed</option>
            <option>Luxury Room</option>
            <option>Family Suite</option>
          </select>
          <FieldError errors={state.fieldErrors?.roomType} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">Price per night</span>
          <input
            type="number"
            name="pricePerNight"
            min="0"
            value={roomSummary.pricePerNight}
            onChange={(event) => updateSummaryField("pricePerNight", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          />
          <FieldError errors={state.fieldErrors?.pricePerNight} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">Guest capacity</span>
          <input
            type="number"
            name="guestCapacity"
            min="1"
            max="12"
            value={roomSummary.guestCapacity}
            onChange={(event) => updateSummaryField("guestCapacity", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          />
          <FieldError errors={state.fieldErrors?.guestCapacity} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">Bedroom count</span>
          <input
            type="number"
            name="bedroomCount"
            min="1"
            max="12"
            value={roomSummary.bedroomCount}
            onChange={(event) => updateSummaryField("bedroomCount", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          />
          <FieldError errors={state.fieldErrors?.bedroomCount} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">Bathroom count</span>
          <input
            type="number"
            name="bathroomCount"
            min="1"
            max="12"
            value={roomSummary.bathroomCount}
            onChange={(event) => updateSummaryField("bathroomCount", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          />
          <FieldError errors={state.fieldErrors?.bathroomCount} />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--color-ink)]">Description</span>
        <textarea
          name="description"
          rows="5"
          value={roomSummary.description}
          onChange={(event) => updateSummaryField("description", event.target.value)}
          className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          placeholder="Describe the room, bed type, view, bathroom and standout experience."
        />
        <FieldError errors={state.fieldErrors?.description} />
      </label>

      <div>
        <p className="text-sm font-medium text-[var(--color-ink)]">Amenities</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {amenityOptions.map((amenity) => {
            const active = selectedAmenities.includes(amenity);

            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`rounded-full px-4 py-2 text-sm ${
                  active
                    ? "bg-[var(--color-ink)] text-white"
                    : "bg-white text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
                }`}
              >
                {amenity}
              </button>
            );
          })}
        </div>

        {selectedAmenities.map((amenity) => (
          <input key={amenity} type="hidden" name="amenities" value={amenity} />
        ))}

        <FieldError errors={state.fieldErrors?.amenities} />
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-[var(--color-ink)]">Room photos</p>
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            Keep the best existing shots, remove anything outdated, and add new
            JPG, PNG, or WEBP files here.
          </p>
        </div>

        {retainedImageUrls.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {retainedImageUrls.map((imageUrl) => (
              <div
                key={imageUrl}
                className="overflow-hidden rounded-[24px] border border-[var(--color-line)] bg-white"
              >
                <img
                  src={imageUrl}
                  alt={room.name || room.roomType}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-3">
                  <button
                    type="button"
                    onClick={() => removeExistingImage(imageUrl)}
                    className="button-secondary min-h-10 w-full"
                  >
                    Remove photo
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-[#f8fafc] p-4 text-sm leading-7 text-[var(--color-muted)]">
            {room.usesFallbackImages
              ? "No dedicated room photography has been added yet. You can still keep refining the room now and add imagery when it is ready."
              : "No uploaded photos are currently being kept in this editing session."}
          </div>
        )}

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Add more photos
          </span>
          <input
            type="file"
            name="images"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="w-full rounded-2xl border border-dashed border-[var(--color-line)] bg-white px-4 py-4 text-sm text-[var(--color-muted)] outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[var(--color-accent-soft)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-accent-strong)]"
            onChange={(event) =>
              setSelectedImageNames(
                Array.from(event.target.files || []).map((file) => file.name),
              )
            }
          />
          {selectedImageNames.length ? (
            <div className="flex flex-wrap gap-2">
              {selectedImageNames.map((fileName, index) => (
                <span
                  key={`${fileName}-${index}`}
                  className="rounded-full bg-white px-3 py-1 text-xs text-[var(--color-muted)] ring-1 ring-[var(--color-line)]"
                >
                  {fileName}
                </span>
              ))}
            </div>
          ) : null}
          <FieldError errors={state.fieldErrors?.images} />
        </label>
      </div>

      <div className="rounded-3xl bg-[#f8fafc] p-4 text-sm leading-7 text-[var(--color-muted)]">
        Visibility is managed from the room collection page. This editor keeps
        the details and imagery beautifully in sync.
      </div>

      {state.status === "error" ? (
        <p className="rounded-[22px] bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <SubmitButton />
        <Link href="/owner/list-room" className="button-secondary min-h-12 px-5">
          Cancel
        </Link>
      </div>
    </form>
  );
}
