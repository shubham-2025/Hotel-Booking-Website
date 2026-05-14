"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export function BookingInvoiceActions({
  autoPrint = false,
  backHref = "/my-bookings",
  showPrintButton = true,
}) {
  const hasTriggeredPrintRef = useRef(false);

  useEffect(() => {
    if (!autoPrint || hasTriggeredPrintRef.current) {
      return;
    }

    hasTriggeredPrintRef.current = true;
    const timeoutId = window.setTimeout(() => {
      window.print();
    }, 260);

    return () => window.clearTimeout(timeoutId);
  }, [autoPrint]);

  return (
    <div className="print:hidden">
      <div className="flex flex-wrap items-center gap-3">
        {showPrintButton ? (
          <button
            type="button"
            onClick={() => window.print()}
            className="button-primary min-h-11 px-5"
          >
            Download invoice
          </button>
        ) : null}
        <Link href={backHref} className="button-secondary min-h-11 px-5">
          Back to my bookings
        </Link>
      </div>
      {showPrintButton ? (
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
          Choose <strong>Save as PDF</strong> in the print dialog if you want a
          polished file copy.
        </p>
      ) : null}
    </div>
  );
}
