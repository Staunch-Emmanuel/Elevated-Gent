import crypto from "crypto";
import sharp from "sharp";
import { adminStorage } from "@/lib/firebase/admin";

export const IMAGE_UPLOAD_FOLDERS = [
  "articles",
  "wellness",
  "weekly",
  "outfits",
  "outfits/shop-items",
  "auth",
  "homepage",
  "personal-styling",
] as const;

export type ImageUploadFolder = (typeof IMAGE_UPLOAD_FOLDERS)[number];

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  const extension = "webp";

  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return `${baseName || "image"}.${extension}`;
}

function sanitizeSlug(value?: string) {
  return (value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export function isValidImageFolder(
  value: string
): value is ImageUploadFolder {
  return IMAGE_UPLOAD_FOLDERS.includes(value as ImageUploadFolder);
}

export function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error(
      "Unsupported image type. Use JPG, PNG, WEBP, SVG, or AVIF."
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Image too large (max 15MB).");
  }
}

export async function uploadImageToStorage(params: {
  file: File;
  folder: ImageUploadFolder;
  documentSlug?: string;
}) {
  const { file, folder, documentSlug } = params;

  validateImageFile(file);

  const bucket = adminStorage.bucket();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const optimizedBuffer = await sharp(buffer)
    .rotate()
    .resize({
      width: 2000,
      withoutEnlargement: true,
    })
    .webp({
      quality: 80,
    })
    .toBuffer();

  const safeFileName = sanitizeFileName(file.name);
  const randomId = crypto.randomUUID();
  const downloadToken = crypto.randomUUID();
  const slugPart = sanitizeSlug(documentSlug) || "image";

  const storagePath =
    `cms/${folder}/${slugPart}/${randomId}-${safeFileName}`;

  const storageFile = bucket.file(storagePath);

  await storageFile.save(optimizedBuffer, {
    resumable: false,
    metadata: {
      contentType: "image/webp",
      cacheControl: "public, max-age=31536000, immutable",
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  });

  const encodedPath = encodeURIComponent(storagePath);

  const publicUrl =
    `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/` +
    `${encodedPath}?alt=media&token=${downloadToken}`;

  return {
    path: storagePath,
    url: publicUrl,
    contentType: "image/webp",
    size: optimizedBuffer.length,
    name: safeFileName,
  };
}