"use client";

import { useState } from "react";

const amenityOptions = [
  "Free WiFi",
  "Free Breakfast",
  "Room Service",
  "Mountain View",
  "Pool Access",
];

export function AddRoomPanel() {
  const [formState, setFormState] = useState({
    roomType: "Double Bed",
    pricePerNight: "299",
    maxGuests: "2",
    description: "",
    amenities: ["Free WiFi", "Room Service"],
    files: [],
  });
  const [notice, setNotice] = useState("");

  function updateField(key, value) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleAmenity(amenity) {
    setFormState((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setNotice(
      "Room form is now structured for backend integration. Next step is wiring authenticated inserts plus Supabase Storage uploads.",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
          Add room
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--color-ink)]">
          Prepare the owner form for Supabase writes
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          The responsive form is ready. What remains is owner auth, image uploads
          to Supabase Storage, and real insert actions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Room type
          </span>
          <select
            value={formState.roomType}
            onChange={(event) => updateField("roomType", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          >
            <option>Single Bed</option>
            <option>Double Bed</option>
            <option>Luxury Room</option>
            <option>Family Suite</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Price per night
          </span>
          <input
            type="number"
            value={formState.pricePerNight}
            onChange={(event) =>
              updateField("pricePerNight", event.target.value)
            }
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Max guests
          </span>
          <input
            type="number"
            min="1"
            max="8"
            value={formState.maxGuests}
            onChange={(event) => updateField("maxGuests", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Room images
          </span>
          <input
            type="file"
            multiple
            onChange={(event) =>
              updateField(
                "files",
                Array.from(event.target.files || []).map((file) => file.name),
              )
            }
            className="w-full rounded-2xl border border-dashed border-[var(--color-line)] bg-[#fbfcfe] px-4 py-3 text-sm outline-none"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--color-ink)]">
          Description
        </span>
        <textarea
          rows="5"
          value={formState.description}
          onChange={(event) => updateField("description", event.target.value)}
          className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          placeholder="Describe the room, bed type, view, bathroom and standout experience."
        />
      </label>

      <div>
        <p className="text-sm font-medium text-[var(--color-ink)]">Amenities</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {amenityOptions.map((amenity) => {
            const active = formState.amenities.includes(amenity);

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
      </div>

      {formState.files.length ? (
        <div className="rounded-3xl bg-[#f8fafc] p-4 text-sm text-[var(--color-muted)]">
          Selected files: {formState.files.join(", ")}
        </div>
      ) : null}

      <button
        type="submit"
        className="rounded-2xl bg-[var(--color-ink)] px-5 py-4 text-sm font-semibold text-white"
      >
        Save room draft
      </button>

      {notice ? (
        <p className="rounded-3xl bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
          {notice}
        </p>
      ) : null}
    </form>
  );
}
