"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "@/src/backend/auth/auth-errors";
import {
  createOwnerRoomRecord,
  setOwnerRoomAvailability,
  updateOwnerRoomRecord,
} from "@/src/backend/repositories/owner-repository";
import {
  getRetainedRoomImageUrls,
  getRoomImageFiles,
  validateRoomImageSelection,
} from "@/src/backend/storage/owner-room-image-storage";
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
  revalidatePath("/rooms");
  if (roomId) {
    revalidatePath(`/owner/rooms/${roomId}/edit`);
    revalidatePath(`/rooms/${roomId}`);
  }
}

export async function createOwnerRoomAction(_previousState, formData) {
  const payload = getRoomPayload(formData);
  const imageFiles = getRoomImageFiles(formData);

  const parsedPayload = ownerRoomSchema.safeParse(payload);
  const imageErrors = validateRoomImageSelection({
    files: imageFiles,
  });

  if (!parsedPayload.success || imageErrors.length) {
    return {
      status: "error",
      message: "Please review the room details before saving.",
      fieldErrors: {
        ...(parsedPayload.success
          ? {}
          : parsedPayload.error.flatten().fieldErrors),
        ...(imageErrors.length ? { images: imageErrors } : {}),
      },
    };
  }

  let result;

  try {
    result = await createOwnerRoomRecord(parsedPayload.data, {
      imageFiles,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/");
    }

    console.error("createOwnerRoomAction failed", error);

    return {
      status: "error",
      message: "Unable to save your room right now. Please try again shortly.",
      fieldErrors: {},
    };
  }

  if (result.status === "created") {
    revalidateOwnerRoomPaths(result.room?._id || "");
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
}

export async function updateOwnerRoomAction(_previousState, formData) {
  const roomId = getFieldValue(formData, "roomId");
  const payload = getRoomPayload(formData);
  const imageFiles = getRoomImageFiles(formData);
  const retainedImageUrls = getRetainedRoomImageUrls(formData);
  const parsedPayload = ownerRoomSchema.safeParse(payload);
  const imageErrors = validateRoomImageSelection({
    files: imageFiles,
    existingImageUrls: retainedImageUrls,
  });

  if (!roomId) {
    return {
      status: "error",
      message: "We could not identify which room to update. Please open the room editor again.",
      fieldErrors: {},
    };
  }

  if (!parsedPayload.success || imageErrors.length) {
    return {
      status: "error",
      message: "Please review the room details before saving.",
      fieldErrors: {
        ...(parsedPayload.success
          ? {}
          : parsedPayload.error.flatten().fieldErrors),
        ...(imageErrors.length ? { images: imageErrors } : {}),
      },
    };
  }

  let result;

  try {
    result = await updateOwnerRoomRecord(roomId, parsedPayload.data, {
      imageFiles,
      retainedImageUrls,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/");
    }

    console.error("updateOwnerRoomAction failed", error);

    return {
      status: "error",
      message: "Unable to update your room right now. Please try again shortly.",
      fieldErrors: {},
    };
  }

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
}

export async function toggleOwnerRoomAvailabilityAction(formData) {
  const roomId = getFieldValue(formData, "roomId");
  const nextState = getFieldValue(formData, "nextState");
  const shouldBeActive = nextState === "publish";

  if (!roomId || (nextState !== "publish" && nextState !== "unpublish")) {
    redirect("/owner/list-room");
  }

  let result;

  try {
    result = await setOwnerRoomAvailability(roomId, shouldBeActive);
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/");
    }

    console.error("toggleOwnerRoomAvailabilityAction failed", error);

    redirect("/owner/list-room");
  }

  if (result.status === "updated") {
    revalidateOwnerRoomPaths(roomId);
    redirect("/owner/list-room");
  }

  if (result.status === "no_hotel") {
    redirect("/owner/setup-hotel");
  }

  redirect("/owner/list-room");
}
