"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event) {
    event.preventDefault();

    startTransition(async () => {
      const toastId = toast.loading("Joining the QuickStay list...");
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        toast.error(
          "We could not add you right now. Please try again shortly.",
          { id: toastId },
        );
        return;
      }

      setEmail("");
      toast.success("You're on the list. Fresh stays and offers are on the way.", {
        id: toastId,
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/72">
          QuickStay list
        </p>
        <h3 className="mt-3 font-display text-3xl text-white">
          Join for fresh rooms, travel ideas, and limited-time offers
        </h3>
        <p className="mt-3 text-sm leading-7 text-white/76">
          A simple email list for travelers who want better stay options
          without the clutter.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="Enter your email"
          className="field-dark min-h-13 flex-1"
        />
        <button
          type="submit"
          disabled={isPending}
          className="button-accent min-h-13 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Saving..." : "Join the list"}
        </button>
      </div>
    </form>
  );
}
