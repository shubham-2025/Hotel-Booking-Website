"use client";

import { useEffect, useState } from "react";

function getProgressValue(previous) {
  if (previous >= 90) {
    return previous;
  }

  if (previous >= 78) {
    return previous + 1;
  }

  if (previous >= 58) {
    return previous + 2;
  }

  return previous + 3;
}

export function RouteLoadingState({ mode = "floating" }) {
  const isFullscreen = mode === "fullscreen";
  const [progress, setProgress] = useState(14);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((previous) => {
        const nextValue = getProgressValue(previous);
        return nextValue > 92 ? 92 : nextValue;
      });
    }, 160);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-[140] flex items-center justify-center overflow-hidden px-4 py-10"
          : "fixed inset-0 z-[140] flex items-center justify-center overflow-hidden bg-[rgba(237,244,250,0.44)] px-4 py-10 backdrop-blur-[3px]"
      }
      aria-live="polite"
      aria-busy="true"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(155,205,245,0.18),transparent_30%),linear-gradient(180deg,rgba(243,247,251,0.62),rgba(248,251,253,0.82))]" />
      <div className="pointer-events-none absolute left-[-9rem] top-16 h-72 w-72 rounded-full bg-[rgba(137,186,229,0.16)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] bottom-14 h-80 w-80 rounded-full bg-[rgba(36,91,156,0.12)] blur-3xl" />

      <div
        className={`relative w-full overflow-hidden rounded-[34px] border border-[rgba(196,216,237,0.96)] bg-[rgba(255,255,255,0.96)] shadow-[0_30px_70px_rgba(18,36,59,0.16)] backdrop-blur-xl ${
          isFullscreen ? "max-w-xl p-7 sm:p-8" : "max-w-lg p-6 sm:p-7"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 overflow-hidden bg-[rgba(223,236,248,0.9)]">
          <div
            className="route-loader-fill h-full rounded-full bg-[linear-gradient(90deg,#4d91d0,#9fd3ff,#4d91d0)] shadow-[0_0_22px_rgba(104,170,230,0.44)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,#153250,#2c6d9f)] shadow-[0_18px_36px_rgba(23,50,77,0.24)]">
            <div className="route-loader-ring h-11 w-11 rounded-full border-[3px] border-white/26 border-t-white" />
            <div className="absolute text-sm font-semibold text-white">
              {progress}%
            </div>
          </div>

          <p className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">
            Loading your next page
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.85rem,3vw,2.45rem)] text-[var(--color-ink)]">
            Enhancing your stay experience
          </h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-[var(--color-muted)] sm:text-[0.98rem]">
            Preparing a smoother, clearer view so the next step feels instant and
            reassuring.
          </p>

          <div className="mt-6 w-full max-w-md">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[rgba(227,239,249,0.98)] ring-1 ring-[rgba(196,216,237,0.92)]">
              <div
                className="route-loader-fill h-full rounded-full bg-[linear-gradient(90deg,#5ca7e8,#9fd3ff,#5ca7e8)] shadow-[0_0_24px_rgba(92,167,232,0.3)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-5 rounded-[22px] bg-[var(--color-card-soft)] px-4 py-3 text-sm leading-7 text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
            Your next page is on the way. No need to click again.
          </div>
        </div>
      </div>
    </div>
  );
}
