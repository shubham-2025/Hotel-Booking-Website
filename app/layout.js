import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "QuickStay | Hotel Booking Platform",
    template: "%s | QuickStay",
  },
  description:
    "A hotel booking platform being migrated from a frontend-only React app into a full-stack Next.js + Supabase experience.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${playfair.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-[var(--color-surface)] text-slate-950 antialiased">
        {children}
      </body>
    </html>
  );
}
