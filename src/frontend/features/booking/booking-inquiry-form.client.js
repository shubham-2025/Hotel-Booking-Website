"use client";

import { useState, useTransition } from "react";

export function BookingInquiryForm({ room }) {
  const [feedback, setFeedback] = useState(null);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    checkInDate: "",
    checkOutDate: "",
    guests: 2,
    message: "",
  });
  const [isPending, startTransition] = useTransition();

  function updateField(key, value) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const response = await fetch("/api/booking-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          roomId: room._id,
          hotelId: room.hotel._id,
          hotelName: room.hotel.name,
          roomType: room.roomType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: result.message || "Unable to submit your inquiry right now.",
        });
        return;
      }

      setFormState({
        name: "",
        email: "",
        phone: "",
        checkInDate: "",
        checkOutDate: "",
        guests: 2,
        message: "",
      });
      setFeedback({
        type: "success",
        message:
          result.message ||
          "Inquiry received. The backend pipeline is now ready for Supabase + Resend.",
      });
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[32px] border border-[var(--color-line)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-soft)] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Booking inquiry
          </p>
          <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
            Check availability with real submission hooks
          </h2>
        </div>
        <span className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-xs font-semibold text-[var(--color-accent-strong)]">
          API route ready
        </span>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Full name
          </span>
          <input
            required
            value={formState.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
            placeholder="Shubham Mahapure"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Email
          </span>
          <input
            type="email"
            required
            value={formState.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
            placeholder="you@example.com"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Phone
          </span>
          <input
            value={formState.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
            placeholder="+91 98765 43210"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Guests
          </span>
          <input
            type="number"
            min="1"
            max="8"
            required
            value={formState.guests}
            onChange={(event) => updateField("guests", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Check in
          </span>
          <input
            type="date"
            required
            value={formState.checkInDate}
            onChange={(event) => updateField("checkInDate", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Check out
          </span>
          <input
            type="date"
            required
            value={formState.checkOutDate}
            onChange={(event) =>
              updateField("checkOutDate", event.target.value)
            }
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          />
        </label>
      </div>

      <label className="mt-4 block space-y-2">
        <span className="text-sm font-medium text-[var(--color-ink)]">
          Notes for the hotel
        </span>
        <textarea
          rows="4"
          value={formState.message}
          onChange={(event) => updateField("message", event.target.value)}
          className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-highlight)]"
          placeholder="Tell us about your arrival time, special requests, or room preference."
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 w-full rounded-2xl bg-[var(--color-ink)] px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Sending inquiry..." : "Submit inquiry"}
      </button>

      {feedback ? (
        <p
          className={`mt-4 text-sm ${
            feedback.type === "success"
              ? "text-emerald-700"
              : "text-rose-700"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}
    </form>
  );
}
