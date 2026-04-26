"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "@/src/backend/auth/auth-errors";
import {
  createOwnerHotelRecord,
  setOwnerHotelAvailability,
  updateOwnerHotelRecord,
} from "@/src/backend/repositories/owner-repository";
import { ownerHotelSchema } from "@/src/backend/validation/owner-hotel.schema";

function buildOwnerHotelRedirect(pathname, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function buildHotelSlugBase(name, city) {
  const slug = `${name}-${city}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || "hotel";
}

function getFieldValue(formData, key) {
  return String(formData.get(key) || "").trim();
}

function getHotelPayload(formData) {
  return {
    name: getFieldValue(formData, "name"),
    city: getFieldValue(formData, "city"),
    address: getFieldValue(formData, "address"),
    contactEmail: getFieldValue(formData, "contactEmail"),
    contactPhone: getFieldValue(formData, "contactPhone"),
    description: getFieldValue(formData, "description"),
    heroImageUrl: getFieldValue(formData, "heroImageUrl"),
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

function revalidateOwnerHotelPaths() {
  revalidatePath("/host");
  revalidatePath("/");
  revalidatePath("/rooms");
  revalidatePath("/rooms/[id]", "page");
  revalidatePath("/owner");
  revalidatePath("/owner/list-room");
  revalidatePath("/owner/add-room");
  revalidatePath("/owner/setup-hotel");
}

export async function createOwnerHotelAction(_previousState, formData) {
  const payload = getHotelPayload(formData);

  const parsedPayload = ownerHotelSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return {
      status: "error",
      message: "Please review the highlighted hotel details.",
      fieldErrors: parsedPayload.error.flatten().fieldErrors,
    };
  }

  let result;

  try {
    result = await createOwnerHotelRecord({
      ...parsedPayload.data,
      slugBase: buildHotelSlugBase(
        parsedPayload.data.name,
        parsedPayload.data.city,
      ),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/");
    }

    console.error("createOwnerHotelAction failed", error);

    return {
      status: "error",
      message: "Unable to save your hotel right now. Please try again shortly.",
      fieldErrors: {},
    };
  }

  if (result.status === "created") {
    revalidateOwnerHotelPaths();
    redirect(
      buildOwnerHotelRedirect("/owner/list-room", { notice: "hotel_created" }),
    );
  }

  if (result.status === "already_exists") {
    redirect(
      buildOwnerHotelRedirect("/owner/list-room", { notice: "hotel_exists" }),
    );
  }

  return {
    status: "error",
    message:
      result.reason ||
      "Hotel setup is temporarily unavailable. Please try again shortly.",
    fieldErrors: {},
  };
}

export async function updateOwnerHotelAction(_previousState, formData) {
  const hotelId = getFieldValue(formData, "hotelId");
  const payload = getHotelPayload(formData);
  const parsedPayload = ownerHotelSchema.safeParse(payload);

  if (!hotelId) {
    return {
      status: "error",
      message: "We could not identify which hotel to update. Please reopen hotel setup.",
      fieldErrors: {},
    };
  }

  if (!parsedPayload.success) {
    return {
      status: "error",
      message: "Please review the highlighted hotel details.",
      fieldErrors: parsedPayload.error.flatten().fieldErrors,
    };
  }

  let result;

  try {
    result = await updateOwnerHotelRecord(hotelId, parsedPayload.data);
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/");
    }

    console.error("updateOwnerHotelAction failed", error);

    return {
      status: "error",
      message: "Unable to update your hotel right now. Please try again shortly.",
      fieldErrors: {},
    };
  }

  if (result.status === "updated") {
    revalidateOwnerHotelPaths();
    redirect(
      buildOwnerHotelRedirect("/owner/setup-hotel", {
        notice: "hotel_updated",
      }),
    );
  }

  if (result.status === "no_hotel" || result.status === "not_found") {
    redirect(
      buildOwnerHotelRedirect("/owner/setup-hotel", { error: "hotel_not_found" }),
    );
  }

  return {
    status: "error",
    message:
      result.reason ||
      "Hotel update is temporarily unavailable. Please try again shortly.",
    fieldErrors: {},
  };
}

export async function toggleOwnerHotelAvailabilityAction(formData) {
  const hotelId = getFieldValue(formData, "hotelId");
  const nextState = getFieldValue(formData, "nextState");
  const shouldBeActive = nextState === "publish";

  if (!hotelId || (nextState !== "publish" && nextState !== "unpublish")) {
    redirect(
      buildOwnerHotelRedirect("/owner/setup-hotel", {
        error: "hotel_action_invalid",
      }),
    );
  }

  let result;

  try {
    result = await setOwnerHotelAvailability(hotelId, shouldBeActive);
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/");
    }

    console.error("toggleOwnerHotelAvailabilityAction failed", error);
    redirect(
      buildOwnerHotelRedirect("/owner/setup-hotel", {
        error: "hotel_visibility_failed",
      }),
    );
  }

  if (result.status === "updated") {
    revalidateOwnerHotelPaths();
    redirect(
      buildOwnerHotelRedirect("/owner/setup-hotel", {
        notice: shouldBeActive ? "hotel_published" : "hotel_unpublished",
      }),
    );
  }

  if (result.status === "no_hotel" || result.status === "not_found") {
    redirect(
      buildOwnerHotelRedirect("/owner/setup-hotel", { error: "hotel_not_found" }),
    );
  }

  redirect(
    buildOwnerHotelRedirect("/owner/setup-hotel", {
      error: "hotel_visibility_failed",
    }),
  );
}
