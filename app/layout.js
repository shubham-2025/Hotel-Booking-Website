import { Montserrat } from "next/font/google";
import { NavigationLoader } from "@/src/frontend/components/feedback/navigation-loader.client";
import { AppToaster } from "@/src/frontend/components/feedback/app-toaster.client";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
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
    "Discover thoughtfully selected stays with clear pricing, polished room details, and faster booking inquiries.",
};

export const viewport = {
  themeColor: "#12243b",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full scroll-smooth`}>
      <body className="min-h-full bg-[var(--color-surface)] text-slate-950 antialiased">
        {children}
        <NavigationLoader />
        <AppToaster />
      </body>
    </html>
  );
}
