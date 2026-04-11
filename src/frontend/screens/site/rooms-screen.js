import { RoomsBrowser } from "@/src/frontend/features/rooms/rooms-browser.client";
import { SectionHeading } from "@/src/frontend/components/shared/section-heading";
import { getRooms } from "@/lib/data";

export async function RoomsScreen({ searchParams }) {
  const params = await searchParams;
  const initialCity = params?.city || "";
  const roomData = await getRooms({ city: initialCity });

  return (
    <section className="section-space">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Find your stay"
          title="Browse rooms with filters that stay easy to use on every screen"
          description="Compare price, room type, and location without losing the clean reading flow that makes travel decisions feel simpler."
          align="left"
        />

        <div className="mt-10">
          <RoomsBrowser rooms={roomData} initialCity={initialCity} />
        </div>
      </div>
    </section>
  );
}
