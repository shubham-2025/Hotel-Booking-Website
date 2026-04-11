"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "@/src/backend/auth/auth-errors";
import { createOwnerRoomRecord } from "@/src/backend/repositories/owner-repository";
import { ownerRoomSchema } from "@/src/backend/validation/owner-room.schema";

function getFieldValue(formData, key) {
  return String(formData.get(key) || "").trim();
}

export async function createOwnerRoomAction(_previousState, formData) {
  const payload = {
    name: getFieldValue(formData, "name"),
    roomType: getFieldValue(formData, "roomType"),
    pricePerNight: getFieldValue(formData, "pricePerNight"),
    guestCapacity: getFieldValue(formData, "guestCapacity"),
    bedroomCount: getFieldValue(formData, "bedroomCount"),
    bathroomCount: getFieldValue(formData, "bathroomCount"),
    description: getFieldValue(formData, "description"),
    amenities: Array.from(
      new Set(
        formData
          .getAll("amenities")
          .map((value) => String(value || "").trim())
          .filter(Boolean),
      ),
    ),
  };

  const parsedPayload = ownerRoomSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return {
      status: "error",
      message: "Please review the room details before saving.",
      fieldErrors: parsedPayload.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await createOwnerRoomRecord(parsedPayload.data);

    if (result.status === "created") {
      revalidatePath("/owner");
      revalidatePath("/owner/list-room");
      revalidatePath("/owner/add-room");
      redirect("/owner/list-room");
    }

    if (result.status === "no_hotel") {
      redirect("/owner/setup-hotel");
    }

    return {
      status: "error",
      message:
        result.reason ||
        "Room creation is temporarily unavailable. Please try again shortly.",
      fieldErrors: {},
    };
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/");
    }

    return {
      status: "error",
      message: "Unable to save your room right now. Please try again shortly.",
      fieldErrors: {},
    };
  }
}
