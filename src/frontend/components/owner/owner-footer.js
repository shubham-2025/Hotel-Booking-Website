import Link from "next/link";

const footerLinks = [
  { label: "Dashboard", href: "/owner" },
  { label: "Property Details", href: "/owner/setup-hotel" },
  { label: "Room Collection", href: "/owner/list-room" },
  { label: "Bookings", href: "/owner/bookings" },
];

export function OwnerFooter() {
  return (
    <footer className="relative mt-12 border-t border-[rgba(255,255,255,0.12)] bg-[linear-gradient(135deg,#16324f_0%,#204d76_58%,#2d6e9f_100%)] text-white shadow-[0_-20px_40px_rgba(10,25,40,0.16)]">
      <div className="page-shell flex flex-col gap-5 py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/84">
            Host Suite
          </p>
          <p className="mt-2 text-sm leading-7 text-white/82">
            A calmer workspace for property details, room visibility, and guest
            operations.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-white/22 bg-white/14 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
