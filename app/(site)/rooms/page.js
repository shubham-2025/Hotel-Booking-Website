import { RoomsBrowser } from "@/components/site/rooms-browser";
import { SectionHeading } from "@/components/site/section-heading";
import { getRooms } from "@/lib/data";

export const metadata = {
  title: "Rooms",
};

export default async function RoomsPage({ searchParams }) {
  const params = await searchParams;
  const initialCity = params?.city || "";
  const roomData = await getRooms({ city: initialCity });

  return (
    <section className="section-space">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Room discovery"
          title="Browse the current inventory with cleaner responsive filters"
          description="This route now works as a real Next.js page instead of a client-side SPA view. The filter panel collapses on mobile and the card layout no longer depends on rigid widths."
          align="left"
        />

        <div className="mt-10">
          <RoomsBrowser rooms={roomData} initialCity={initialCity} />
        </div>
      </div>
    </section>
  );
}
