import { siteAssets } from "@/src/frontend/assets";
import { BookingInvoiceActions } from "@/src/frontend/features/bookings/booking-invoice-actions.client";
import { formatCurrency, formatDate } from "@/src/frontend/lib/format";

function formatStatusLabel(value) {
  return String(value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getInvoiceStateCopy(status) {
  if (status === "forbidden") {
    return {
      eyebrow: "Invoice access",
      title: "This invoice is not available here",
      description:
        "The link may have expired or this booking belongs to a different traveler account.",
    };
  }

  if (status === "not_found") {
    return {
      eyebrow: "Invoice access",
      title: "We could not find that invoice",
      description:
        "The booking reference may have changed or the invoice is no longer available.",
    };
  }

  return {
    eyebrow: "Invoice access",
    title: "This invoice is temporarily unavailable",
    description:
      "QuickStay could not load the invoice details right now, but your booking is still safe.",
  };
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] py-3 text-sm">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="text-right font-semibold text-[var(--color-ink)]">
        {value}
      </span>
    </div>
  );
}

function DetailCard({ eyebrow, title, children }) {
  return (
    <section className="rounded-[28px] border border-[rgba(205,220,236,0.96)] bg-white/96 p-5 shadow-[var(--shadow-soft)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-2xl text-[var(--color-ink)]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function BookingInvoiceScreen({ invoiceData, searchParams }) {
  const params = searchParams || {};
  const autoPrint = params.download === "1";

  if (invoiceData.status !== "ready" || !invoiceData.invoice) {
    const copy = getInvoiceStateCopy(invoiceData.status);

    return (
      <section className="min-h-screen bg-[linear-gradient(180deg,#eff5fb,#ffffff)] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-3">
            <img src={siteAssets.logo} alt="QuickStay" className="h-11 w-auto" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                {copy.eyebrow}
              </p>
              <h1 className="mt-1 font-display text-3xl text-[var(--color-ink)]">
                {copy.title}
              </h1>
            </div>
          </div>

          <div className="rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-white/96 p-6 shadow-[var(--shadow-lift)]">
            <p className="text-sm leading-8 text-[var(--color-muted)]">
              {invoiceData.reason || copy.description}
            </p>

            <div className="mt-6">
              <BookingInvoiceActions autoPrint={false} showPrintButton={false} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const invoice = invoiceData.invoice;
  const isPaid = invoice.paymentStatus === "paid";

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#eff5fb,#ffffff)] px-4 py-8 sm:px-6 sm:py-10 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-5xl print:max-w-none">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div className="flex items-center gap-3">
            <img src={siteAssets.logo} alt="QuickStay" className="h-11 w-auto" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                QuickStay invoice desk
              </p>
              <h1 className="mt-1 font-display text-3xl text-[var(--color-ink)]">
                {isPaid ? "Download your payment invoice" : "Review your stay summary"}
              </h1>
            </div>
          </div>

          <BookingInvoiceActions autoPrint={autoPrint} />
        </div>

        <article className="overflow-hidden rounded-[34px] border border-[rgba(205,220,236,0.96)] bg-white shadow-[var(--shadow-lift)] print:rounded-none print:border-0 print:shadow-none">
          <div className="bg-[linear-gradient(135deg,rgba(19,48,75,0.98),rgba(39,89,131,0.96),rgba(137,186,229,0.88))] px-6 py-6 text-white sm:px-8 print:bg-[linear-gradient(135deg,#13304b,#275983,#89bae5)]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <img
                  src={siteAssets.logo}
                  alt="QuickStay"
                  className="h-10 w-auto brightness-0 invert"
                />
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/72">
                  {isPaid ? "Paid booking invoice" : "Booking summary"}
                </p>
                <h2 className="mt-2 font-display text-4xl">
                  {invoice.hotel.name}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-8 text-white/82">
                  A polished QuickStay invoice for your stay, payment record, and
                  hotel contact details.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/14 bg-white/10 px-5 py-5 backdrop-blur-sm sm:min-w-[260px]">
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                    isPaid
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {isPaid ? "Payment received" : formatStatusLabel(invoice.paymentStatus)}
                </span>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-white/72">Invoice number</span>
                    <span className="text-right font-semibold text-white">
                      {invoice.invoiceNumber}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-white/72">Issued on</span>
                    <span className="text-right font-semibold text-white">
                      {formatDate(invoice.issuedAt)}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-white/72">Booking reference</span>
                    <span className="text-right font-semibold text-white">
                      {invoice.bookingId}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-white/72">Payment method</span>
                    <span className="text-right font-semibold text-white">
                      {invoice.paymentMethod
                        ? formatStatusLabel(invoice.paymentMethod)
                        : "Not captured"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 sm:px-8 sm:py-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <DetailCard eyebrow="Issued to" title="Traveler details">
                <div className="space-y-3 text-sm leading-8 text-[var(--color-muted)]">
                  <p className="font-semibold text-[var(--color-ink)]">
                    {invoice.traveler.fullName || "QuickStay traveler"}
                  </p>
                  <p>{invoice.traveler.email || "Email unavailable"}</p>
                </div>
              </DetailCard>

              <DetailCard eyebrow="Property" title="Hotel and stay details">
                <div className="grid gap-5 text-sm leading-8 text-[var(--color-muted)] sm:grid-cols-2">
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">
                      {invoice.hotel.name}
                    </p>
                    <p>{invoice.hotel.city || "City unavailable"}</p>
                    <p>{invoice.hotel.address || "Address unavailable"}</p>
                    {invoice.hotel.contactEmail ? (
                      <p>{invoice.hotel.contactEmail}</p>
                    ) : null}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">
                      {invoice.room.name}
                    </p>
                    <p>{invoice.room.roomType}</p>
                    <p>
                      {formatDate(invoice.booking.checkInDate)} to{" "}
                      {formatDate(invoice.booking.checkOutDate)}
                    </p>
                    <p>
                      {invoice.booking.guests} guest
                      {invoice.booking.guests === 1 ? "" : "s"} | {invoice.nightCount} night
                      {invoice.nightCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </DetailCard>

              <DetailCard eyebrow="Invoice lines" title="Booking charges">
                <div className="overflow-x-auto rounded-[24px] border border-[var(--color-line)]">
                  <div className="min-w-[640px]">
                    <div className="grid grid-cols-[minmax(0,1.5fr)_90px_120px_120px] gap-3 bg-[var(--color-card-soft)] px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
                      <span>Description</span>
                      <span className="text-right">Qty</span>
                      <span className="text-right">Rate</span>
                      <span className="text-right">Total</span>
                    </div>

                    {invoice.lineItems.map((item) => (
                      <div
                        key={`${invoice.bookingId}-${item.label}`}
                        className="grid grid-cols-[minmax(0,1.5fr)_90px_120px_120px] gap-3 border-t border-[var(--color-line)] px-4 py-4 text-sm text-[var(--color-muted)]"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--color-ink)]">
                            {item.label}
                          </p>
                          <p className="mt-1 leading-7">{item.description}</p>
                        </div>
                        <span className="text-right font-semibold text-[var(--color-ink)]">
                          {item.quantity}
                        </span>
                        <span className="text-right font-semibold text-[var(--color-ink)]">
                          {formatCurrency(item.unitPrice)}
                        </span>
                        <span className="text-right font-semibold text-[var(--color-ink)]">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </DetailCard>

              {invoice.notes ? (
                <DetailCard eyebrow="Traveler notes" title="Special request">
                  <p className="text-sm leading-8 text-[var(--color-muted)]">
                    {invoice.notes}
                  </p>
                </DetailCard>
              ) : null}
            </div>

            <div className="space-y-6">
              <DetailCard eyebrow="Payment summary" title="Invoice totals">
                <SummaryRow label="Stay subtotal" value={formatCurrency(invoice.totalPrice)} />
                <SummaryRow label="Taxes and fees" value="Included in booking total" />
                <SummaryRow
                  label="Payment status"
                  value={formatStatusLabel(invoice.paymentStatus)}
                />
                <SummaryRow
                  label="Amount paid"
                  value={formatCurrency(invoice.totalPrice)}
                />
                <div className="mt-4 rounded-[24px] bg-[linear-gradient(135deg,rgba(19,48,75,0.96),rgba(39,89,131,0.94))] px-5 py-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                    QuickStay total
                  </p>
                  <p className="mt-3 font-display text-4xl">
                    {formatCurrency(invoice.totalPrice)}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-white/76">
                    Captured for this booking on {formatDate(invoice.paymentPaidAt)}.
                  </p>
                </div>
              </DetailCard>

              <DetailCard eyebrow="Need support?" title="Keep this copy for your records">
                <div className="space-y-3 text-sm leading-8 text-[var(--color-muted)]">
                  <p>
                    This invoice was generated from the live QuickStay booking record
                    for your stay.
                  </p>
                  <p>
                    If you need hotel help, contact{" "}
                    <span className="font-semibold text-[var(--color-ink)]">
                      {invoice.hotel.contactEmail || "the property directly through QuickStay"}
                    </span>
                    .
                  </p>
                </div>
              </DetailCard>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
