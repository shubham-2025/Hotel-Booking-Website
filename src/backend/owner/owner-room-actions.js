"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "@/src/backend/auth/auth-errors";
import {
  createOwnerRoomRecord,
  setOwnerRoomAvailability,
  updateOwnerRoomRecord,
} from "@/src/backend/repositories/owner-repository";
import { ownerRoomSchema } from "@/src/backend/validation/owner-room.schema";

function getFieldValue(formData, key) {
  return String(formData.get(key) || "").trim();
}

function getRoomPayload(formData) {
  return {
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
}

function revalidateOwnerRoomPaths(roomId = "") {
  revalidatePath("/owner");
  revalidatePath("/owner/list-room");
  revalidatePath("/owner/add-room");
  if (roomId) {
    revalidatePath(`/owner/rooms/${roomId}/edit`);
  }
}

export async function createOwnerRoomAction(_previousState, formData) {
  const payload = getRoomPayload(formData);

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
      revalidateOwnerRoomPaths();
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

export async function updateOwnerRoomAction(_previousState, formData) {
  const roomId = getFieldValue(formData, "roomId");
  const payload = getRoomPayload(formData);
  const parsedPayload = ownerRoomSchema.safeParse(payload);

  if (!roomId) {
    return {
      status: "error",
      message: "We could not identify which room to update. Please open the room editor again.",
      fieldErrors: {},
    };
  }

  if (!parsedPayload.success) {
    return {
      status: "error",
      message: "Please review the room details before saving.",
      fieldErrors: parsedPayload.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await updateOwnerRoomRecord(roomId, parsedPayload.data);

    if (result.status === "updated") {
      revalidateOwnerRoomPaths(roomId);
      redirect("/owner/list-room");
    }

    if (result.status === "no_hotel") {
      redirect("/owner/setup-hotel");
    }

    if (result.status === "not_found") {
      redirect("/owner/list-room");
    }

    return {
      status: "error",
      message:
        result.reason ||
        "Room update is temporarily unavailable. Please try again shortly.",
      fieldErrors: {},
    };
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/");
    }

    return {
      status: "error",
      message: "Unable to update your room right now. Please try again shortly.",
      fieldErrors: {},
    };
  }
}

export async function toggleOwnerRoomAvailabilityAction(formData) {
  const roomId = getFieldValue(formData, "roomId");
  const nextState = getFieldValue(formData, "nextState");
  const shouldBeActive = nextState === "publish";

  if (!roomId || (nextState !== "publish" && nextState !== "unpublish")) {
    redirect("/owner/list-room");
  }

  try {
    const result = await setOwnerRoomAvailability(roomId, shouldBeActive);

    if (result.status === "updated") {
      revalidateOwnerRoomPaths(roomId);
      redirect("/owner/list-room");
    }

    if (result.status === "no_hotel") {
      redirect("/owner/setup-hotel");
    }

    redirect("/owner/list-room");
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/");
    }

    redirect("/owner/list-room");
  }
}
