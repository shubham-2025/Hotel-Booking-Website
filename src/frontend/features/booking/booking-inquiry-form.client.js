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

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: "We could not send your request right now. Please try again shortly.",
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
          "Your request has been sent. The hotel can now review your preferred dates and details.",
      });
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-card rounded-[32px] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow-label">Request this stay</p>
          <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
            Check availability in a few quick steps
          </h2>
        </div>
        <span className="pill-muted">Replies usually within a day</span>
      </div>

      <div className="mt-4 rounded-[22px] bg-[var(--color-card-soft)] px-4 py-3 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
        Share your dates, guest count, and any special notes so the hotel can
        respond with the right room details.
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Full name
          </span>
          <input
            required
            autoComplete="name"
            value={formState.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="field-input"
            placeholder="Your full name"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={formState.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="field-input"
            placeholder="you@example.com"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            Phone
          </span>
          <input
            type="tel"
            autoComplete="tel"
            value={formState.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="field-input"
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
            className="field-input"
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
            className="field-input"
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
            className="field-input"
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
          className="field-textarea"
          placeholder="Mention arrival time, bed preference, accessibility needs, or any special request."
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="button-accent mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Sending request..." : "Send booking request"}
      </button>

      {feedback ? (
        <p
          className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}
    </form>
  );
}
