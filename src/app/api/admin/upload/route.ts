import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  isValidImageFolder,
  uploadImageToStorage,
} from "@/lib/uploads/image-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const formData = await request.formData();

    const folderValue = formData.get("folder");
    const documentSlugValue = formData.get("documentSlug");

    if (typeof folderValue !== "string" || !isValidImageFolder(folderValue)) {
      return NextResponse.json(
        { success: false, error: "Invalid upload folder" },
        { status: 400 }
      );
    }

    const documentSlug =
      typeof documentSlugValue === "string" ? documentSlugValue : undefined;

    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    if (!files.length) {
      return NextResponse.json(
        { success: false, error: "No files were provided" },
        { status: 400 }
      );
    }

    const uploads = await Promise.all(
      files.map((file) =>
        uploadImageToStorage({
          file,
          folder: folderValue,
          documentSlug,
        })
      )
    );

    return NextResponse.json(
      {
        success: true,
        uploads,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin upload error:", error);

    const message =
      error instanceof Error ? error.message : "Upload failed unexpectedly";

    const status =
      message === "Missing or invalid authorization token"
        ? 401
        : message === "Admin access required"
          ? 403
          : message === "User profile not found"
            ? 403
            : 500;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}