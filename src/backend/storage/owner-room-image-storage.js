import { env } from "@/src/backend/config/env";

export const OWNER_ROOM_IMAGE_BUCKET = "room-images";
export const OWNER_ROOM_IMAGE_MAX_FILES = 6;
export const OWNER_ROOM_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_ROOM_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function isRoomImageFile(value) {
  return (
    typeof File !== "undefined" &&
    value instanceof File &&
    value.size > 0 &&
    Boolean(value.name)
  );
}

function sanitizeFilename(fileName) {
  const extension =
    fileName.includes(".") && fileName.split(".").pop()
      ? fileName.split(".").pop().toLowerCase()
      : "jpg";
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const safeBaseName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${safeBaseName || "room-image"}.${extension}`;
}

function getPublicUrlPrefix() {
  if (!env.supabaseUrl) {
    return "";
  }

  return `${env.supabaseUrl}/storage/v1/object/public/${OWNER_ROOM_IMAGE_BUCKET}/`;
}

export function getRoomImageFiles(formData) {
  return formData.getAll("images").filter(isRoomImageFile);
}

export function getRetainedRoomImageUrls(formData) {
  return Array.from(
    new Set(
      formData
        .getAll("existingImageUrls")
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );
}

export function validateRoomImageSelection({
  files = [],
  existingImageUrls = [],
} = {}) {
  const errors = [];

  if (existingImageUrls.length + files.length > OWNER_ROOM_IMAGE_MAX_FILES) {
    errors.push(
      `Please keep room galleries to ${OWNER_ROOM_IMAGE_MAX_FILES} images or fewer.`,
    );
  }

  files.forEach((file) => {
    if (!ALLOWED_ROOM_IMAGE_TYPES.has(file.type)) {
      errors.push("Only JPG, PNG, and WEBP room images are supported.");
    }

    if (file.size > OWNER_ROOM_IMAGE_MAX_SIZE_BYTES) {
      errors.push("Each room image must be 5 MB or smaller.");
    }
  });

  return Array.from(new Set(errors));
}

export function getRoomImagePublicUrl(storagePath) {
  const prefix = getPublicUrlPrefix();
  if (!prefix) {
    return "";
  }

  return `${prefix}${storagePath}`;
}

export function getStoragePathFromRoomImageUrl(publicUrl, ownerId) {
  const prefix = getPublicUrlPrefix();

  if (!prefix || !publicUrl.startsWith(prefix)) {
    return null;
  }

  const storagePath = decodeURIComponent(publicUrl.slice(prefix.length));
  const [pathOwnerId] = storagePath.split("/");

  if (!storagePath || pathOwnerId !== ownerId) {
    return null;
  }

  return storagePath;
}

export async function uploadOwnerRoomImages({
  supabase,
  ownerId,
  roomId,
  files = [],
}) {
  const uploadedImages = [];

  try {
    for (const [index, file] of files.entries()) {
      const timestamp = Date.now();
      const safeFileName = sanitizeFilename(file.name);
      const storagePath = `${ownerId}/${roomId}/${timestamp}-${index}-${safeFileName}`;
      const { error } = await supabase.storage
        .from(OWNER_ROOM_IMAGE_BUCKET)
        .upload(storagePath, file, {
          cacheControl: "3600",
          contentType: file.type || "image/jpeg",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      uploadedImages.push({
        path: storagePath,
        url: getRoomImagePublicUrl(storagePath),
      });
    }
  } catch (error) {
    if (uploadedImages.length) {
      await supabase.storage
        .from(OWNER_ROOM_IMAGE_BUCKET)
        .remove(uploadedImages.map((image) => image.path));
    }

    throw error;
  }

  return uploadedImages;
}

export async function deleteOwnerRoomImages({
  supabase,
  ownerId,
  publicUrls = [],
}) {
  const storagePaths = publicUrls
    .map((publicUrl) => getStoragePathFromRoomImageUrl(publicUrl, ownerId))
    .filter(Boolean);

  if (!storagePaths.length) {
    return;
  }

  const { error } = await supabase.storage
    .from(OWNER_ROOM_IMAGE_BUCKET)
    .remove(storagePaths);

  if (error) {
    throw error;
  }
}
