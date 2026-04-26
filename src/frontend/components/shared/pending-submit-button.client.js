"use client";

import { useFormStatus } from "react-dom";

export function PendingSubmitButton({
  idleLabel,
  pendingLabel = "Working...",
  className = "",
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
