import { RoomsScreen } from "@/src/frontend/screens/site/rooms-screen";

export const metadata = {
  title: "Rooms",
};

export default function RoomsPage({ searchParams }) {
  return <RoomsScreen searchParams={searchParams} />;
}
