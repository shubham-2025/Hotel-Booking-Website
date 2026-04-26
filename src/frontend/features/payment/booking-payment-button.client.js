"use client";

import { useTransition } from "react";
import { toast } from "sonner";

export function BookingPaymentButton({ bookingId }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const toastId = toast.loading("Opening secure payment...");
      const response = await fetch(`/api/bookings/${bookingId}/checkout`, {
        method: "POST",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.url) {
        toast.error(
          payload.message ||
            "We could not open secure payment right now. Please try again shortly.",
          { id: toastId },
        );
        return;
      }

      toast.success("Redirecting to secure checkout...", { id: toastId });
      window.location.assign(payload.url);
    });
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="button-primary min-h-11 w-full px-4 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Redirecting to payment..." : "Pay now"}
      </button>
    </div>
  );
}
