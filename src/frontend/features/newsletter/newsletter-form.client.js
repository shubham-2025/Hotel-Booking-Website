"use client";

import { useState, useTransition } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: result.message || "Unable to subscribe right now.",
        });
        return;
      }

      setEmail("");
      setFeedback({
        type: "success",
        message: result.message || "Subscription saved successfully.",
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          className="min-h-13 flex-1 rounded-2xl border border-white/20 bg-white/10 px-4 text-white outline-none placeholder:text-white/55 focus:border-white/45"
        />
        <button
          type="submit"
          disabled={isPending}
          className="min-h-13 rounded-2xl bg-white px-5 text-sm font-semibold text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Saving..." : "Join newsletter"}
        </button>
      </div>
      {feedback ? (
        <p
          className={`text-sm ${
            feedback.type === "success" ? "text-emerald-200" : "text-rose-200"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}
    </form>
  );
}
