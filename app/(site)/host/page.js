import { env } from "@/src/backend/config/env";
import { getCurrentProfile } from "@/src/backend/auth/get-current-profile";
import { getCurrentUser } from "@/src/backend/auth/get-current-user";
import { hasManagementRole } from "@/src/backend/auth/get-current-role";
import { getOwnerHotelBootstrapData } from "@/src/backend/repositories/owner-repository";
import { OwnerAccessScreen } from "@/src/frontend/screens/site/owner-access-screen";

export default async function HostPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <OwnerAccessScreen state="logged_out" supportEmail={env.notificationEmail} />;
  }

  let profile = null;

  try {
    profile = await getCurrentProfile(user);
  } catch {
    profile = null;
  }

  if (!hasManagementRole(profile?.role)) {
    return (
      <OwnerAccessScreen
        state="guest"
        supportEmail={env.notificationEmail}
        fullName={profile?.full_name || user.email || ""}
      />
    );
  }

  const ownerHotelData = await getOwnerHotelBootstrapData();

  if (ownerHotelData.status === "no_hotel") {
    return <OwnerAccessScreen state="owner_no_hotel" supportEmail={env.notificationEmail} />;
  }

  if (ownerHotelData.status === "unavailable") {
    return (
      <OwnerAccessScreen
        state="owner_unavailable"
        supportEmail={env.notificationEmail}
        reason={ownerHotelData.reason}
      />
    );
  }

  return (
    <OwnerAccessScreen
      state="owner_ready"
      supportEmail={env.notificationEmail}
      hotelName={ownerHotelData.primaryHotel?.name || ""}
    />
  );
}
