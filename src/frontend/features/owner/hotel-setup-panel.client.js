"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createOwnerHotelAction } from "@/src/backend/owner/owner-hotel-actions";

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
      {pending ? "Creating hotel..." : "Create hotel"}
    </button>
  );
}

export function HotelSetupPanel({ profile }) {
  const [state, formAction] = useActionState(
    createOwnerHotelAction,
    initialFormState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Hotel name
          </span>
          <input
            type="text"
            name="name"
            required
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
            defaultValue={profile?.email || ""}
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
            defaultValue={profile?.phone || ""}
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
          className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          placeholder="Share the property's style, neighborhood, and the kind of stay guests can expect."
        />
        <FieldError errors={state.fieldErrors?.description} />
      </label>

      <div className="rounded-[24px] bg-[#f7fbff] p-4 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[#d7e5f7]">
        This creates the first hotel record for your authenticated owner/admin
        account. Room creation, image uploads, and property amenities can be
        added in the next product batch.
      </div>

      {state.status === "error" ? (
        <p className="rounded-[22px] bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
