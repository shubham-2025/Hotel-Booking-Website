import { OwnerEditRoomScreen } from "@/src/frontend/screens/owner/owner-edit-room-screen";

export default async function OwnerEditRoomPage({ params }) {
  const { id } = await params;
  return <OwnerEditRoomScreen roomId={id} />;
}
