import { redirect } from "next/navigation";
import { env } from "@/src/backend/config/env";
import { getCurrentProfile } from "@/src/backend/auth/get-current-profile";
import { getCurrentUser } from "@/src/backend/auth/get-current-user";
import { hasManagementRole } from "@/src/backend/auth/get-current-role";
import { getOwnerHotelBootstrapData } from "@/src/backend/repositories/owner-repository";
import { OwnerAccessScreen } from "@/src/frontend/screens/site/owner-access-screen";

export default async function HostPage({ searchParams }) {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <OwnerAccessScreen
        state="logged_out"
        supportEmail={env.notificationEmail}
        errorCode={typeof params?.error === "string" ? params.error : ""}
      />
    );
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
        errorCode={typeof params?.error === "string" ? params.error : ""}
      />
    );
  }

  const ownerHotelData = await getOwnerHotelBootstrapData();

  if (ownerHotelData.status === "no_hotel") {
    redirect("/owner/setup-hotel");
  }

  if (ownerHotelData.status === "unavailable") {
    redirect("/owner");
  }

  redirect("/owner");
}
