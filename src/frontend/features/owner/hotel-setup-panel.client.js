"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import {
  createOwnerHotelAction,
  updateOwnerHotelAction,
} from "@/src/backend/owner/owner-hotel-actions";
import { heroImage } from "@/src/frontend/assets";

const hotelAmenityOptions = [
  "Free WiFi",
  "Breakfast included",
  "Airport pickup",
  "Swimming pool",
  "Fitness center",
  "Parking",
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

function SubmitButton({ mode }) {
  const { pending } = useFormStatus();
  const isEditMode = mode === "edit";

  return (
    <button
      type="submit"
      disabled={pending}
      className="button-primary min-h-12 px-5 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending
        ? isEditMode
          ? "Saving property..."
          : "Saving property..."
        : isEditMode
          ? "Save property changes"
          : "Save property"}
    </button>
  );
}

export function HotelSetupPanel({ profile, hotel = null, mode = "create" }) {
  const action = mode === "edit" ? updateOwnerHotelAction : createOwnerHotelAction;
  const [state, formAction] = useActionState(
    action,
    initialFormState,
  );
  const [heroImageUrl, setHeroImageUrl] = useState(hotel?.heroImageUrl || "");
  const [selectedAmenities, setSelectedAmenities] = useState(
    hotel?.amenities?.length
      ? hotel.amenities
      : ["Free WiFi", "Breakfast included"],
  );
  const isEditMode = mode === "edit";
  const lastErrorToastRef = useRef("");

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

  return (
    <form action={formAction} className="space-y-6">
      {isEditMode ? <input type="hidden" name="hotelId" value={hotel?._id || ""} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Hotel name
          </span>
          <input
            type="text"
            name="name"
            required
            defaultValue={hotel?.name || ""}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
            placeholder="QuickStay Riverside House"
          />
          <FieldError errors={state.fieldErrors?.name} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            City
          </span>
          <input
            type="text"
            name="city"
            required
            defaultValue={hotel?.city || ""}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
            placeholder="Jaipur"
          />
          <FieldError errors={state.fieldErrors?.city} />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--color-ink)]">
          Full address
        </span>
        <input
          type="text"
          name="address"
          required
          defaultValue={hotel?.address || ""}
          className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          placeholder="123 Riverfront Road, Jaipur 302001"
        />
        <FieldError errors={state.fieldErrors?.address} />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Contact email
          </span>
          <input
            type="email"
            name="contactEmail"
            defaultValue={hotel?.contactEmail || profile?.email || ""}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
            placeholder="owner@hotel.com"
          />
          <FieldError errors={state.fieldErrors?.contactEmail} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Contact phone
          </span>
          <input
            type="text"
            name="contactPhone"
            defaultValue={hotel?.contactPhone || profile?.phone || ""}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
            placeholder="+91 98765 43210"
          />
          <FieldError errors={state.fieldErrors?.contactPhone} />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--color-ink)]">
          Description
        </span>
        <textarea
          name="description"
          rows="5"
          defaultValue={hotel?.description || ""}
          className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          placeholder="Share the property's style, neighborhood, and the kind of stay guests can expect."
        />
        <FieldError errors={state.fieldErrors?.description} />
      </label>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Hero image URL
          </span>
          <input
            type="url"
            name="heroImageUrl"
            value={heroImageUrl}
            onChange={(event) => setHeroImageUrl(event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
            placeholder="https://images.example.com/your-hotel-cover.jpg"
          />
          <p className="text-sm leading-7 text-[var(--color-muted)]">
            {isEditMode
              ? "Refresh the cover whenever your property styling or signature photo changes."
              : "Add a beautiful cover image now so the property already feels inviting before guests even open a room."}
          </p>
          <FieldError errors={state.fieldErrors?.heroImageUrl} />
        </div>

        <div className="overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[#f7fbff] shadow-[var(--shadow-soft)]">
          <img
            src={heroImageUrl || heroImage}
            alt="Hotel preview"
            className="aspect-[4/3] w-full object-cover"
          />
          <div className="p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-highlight)]">
              Live preview
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {isEditMode
                ? "Use this preview to make sure the image still reflects the mood and quality of the stay."
                : "This preview helps you shape the first impression guests will carry into the rest of the listing."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-[var(--color-ink)]">
          Property amenities
        </p>
        <div className="flex flex-wrap gap-2">
          {hotelAmenityOptions.map((amenity) => {
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

      <div className="rounded-[24px] bg-[#f7fbff] p-4 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[#d7e5f7]">
        {isEditMode
          ? "These updates refresh the property profile guests rely on when deciding whether this stay feels right for them."
          : "This becomes the foundation for every room, price, and booking moment your guests will see next."}
      </div>

      {state.status === "error" ? (
        <p className="rounded-[22px] bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
          {state.message}
        </p>
      ) : null}

      <SubmitButton mode={mode} />
    </form>
  );
}
