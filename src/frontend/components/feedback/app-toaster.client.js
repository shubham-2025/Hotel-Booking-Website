"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      closeButton
      expand
      position="top-right"
      richColors
      toastOptions={{
        duration: 4200,
        classNames: {
          toast:
            "rounded-[26px] border border-white/75 bg-[rgba(255,255,255,0.96)] text-[var(--color-ink)] shadow-[0_28px_70px_rgba(18,36,59,0.18)] backdrop-blur-xl",
          title: "text-sm font-semibold text-[var(--color-ink)]",
          description: "text-sm leading-6 text-[var(--color-muted)]",
          actionButton:
            "rounded-full bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-white",
          cancelButton:
            "rounded-full border border-[var(--color-line)] bg-white px-4 py-2 text-xs font-semibold text-[var(--color-ink)]",
          closeButton:
            "border border-[var(--color-line)] bg-white text-[var(--color-muted)] hover:text-[var(--color-ink)]",
        },
      }}
    />
  );
}
