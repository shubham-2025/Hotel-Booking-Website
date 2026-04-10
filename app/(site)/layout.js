import { SiteFooter } from "@/src/frontend/components/site/site-footer";
import { SiteHeader } from "@/src/frontend/components/site/site-header";

export default function SiteLayout({ children }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
