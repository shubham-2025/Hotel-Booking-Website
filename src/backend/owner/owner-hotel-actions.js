"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "@/src/backend/auth/auth-errors";
import { createOwnerHotelRecord } from "@/src/backend/repositories/owner-repository";
import { ownerHotelSchema } from "@/src/backend/validation/owner-hotel.schema";

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

export async function createOwnerHotelAction(_previousState, formData) {
  const payload = {
    name: getFieldValue(formData, "name"),
    city: getFieldValue(formData, "city"),
    address: getFieldValue(formData, "address"),
    contactEmail: getFieldValue(formData, "contactEmail"),
    contactPhone: getFieldValue(formData, "contactPhone"),
    description: getFieldValue(formData, "description"),
  };

  const parsedPayload = ownerHotelSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return {
      status: "error",
      message: "Please review the highlighted hotel details.",
      fieldErrors: parsedPayload.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await createOwnerHotelRecord({
      ...parsedPayload.data,
      slugBase: buildHotelSlugBase(
        parsedPayload.data.name,
        parsedPayload.data.city,
      ),
    });

    if (result.status === "created") {
      revalidatePath("/owner");
      revalidatePath("/owner/list-room");
      revalidatePath("/owner/add-room");
      revalidatePath("/owner/setup-hotel");
      redirect("/owner/list-room");
    }

    if (result.status === "already_exists") {
      redirect("/owner/list-room");
    }

    return {
      status: "error",
      message:
        result.reason ||
        "Hotel setup is temporarily unavailable. Please try again shortly.",
      fieldErrors: {},
    };
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/");
    }

    return {
      status: "error",
      message: "Unable to save your hotel right now. Please try again shortly.",
      fieldErrors: {},
    };
  }
}
