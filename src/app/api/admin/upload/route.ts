import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  isValidImageFolder,
  uploadImageToStorage,
} from "@/lib/uploads/image-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ParsedMultipartBody = {
  fields: Map<string, string[]>;
  files: Map<string, File[]>;
};

function getMultipartBoundary(contentType: string): string {
  const boundaryMatch = contentType.match(
    /boundary=(?:"([^"]+)"|([^;]+))/i
  );

  const boundary = boundaryMatch?.[1] || boundaryMatch?.[2];

  if (!boundary) {
    throw new Error("Missing multipart boundary");
  }

  return boundary.trim();
}

function parseContentDisposition(value: string): {
  name?: string;
  filename?: string;
} {
  const nameMatch = value.match(/(?:^|;)\s*name="([^"]*)"/i);
  const filenameMatch = value.match(/(?:^|;)\s*filename="([^"]*)"/i);

  return {
    name: nameMatch?.[1],
    filename: filenameMatch?.[1],
  };
}

function parseMultipartBody(
  body: Buffer,
  boundary: string
): ParsedMultipartBody {
  const fields = new Map<string, string[]>();
  const files = new Map<string, File[]>();

  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const headerSeparator = Buffer.from("\r\n\r\n");

  let cursor = 0;

  while (cursor < body.length) {
    const boundaryStart = body.indexOf(boundaryBuffer, cursor);

    if (boundaryStart === -1) break;

    const partStart = boundaryStart + boundaryBuffer.length;

    if (
      body[partStart] === 45 &&
      body[partStart + 1] === 45
    ) {
      break;
    }

    let contentStart = partStart;

    if (
      body[contentStart] === 13 &&
      body[contentStart + 1] === 10
    ) {
      contentStart += 2;
    }

    const headerEnd = body.indexOf(headerSeparator, contentStart);

    if (headerEnd === -1) {
      throw new Error("Invalid multipart body");
    }

    const headersText = body
      .subarray(contentStart, headerEnd)
      .toString("utf8");

    const headers = new Map<string, string>();

    headersText.split("\r\n").forEach((line) => {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) return;

      const key = line.slice(0, separatorIndex).trim().toLowerCase();
      const value = line.slice(separatorIndex + 1).trim();

      headers.set(key, value);
    });

    const disposition = headers.get("content-disposition");

    if (!disposition) {
      cursor = headerEnd + headerSeparator.length;
      continue;
    }

    const { name, filename } = parseContentDisposition(disposition);

    if (!name) {
      cursor = headerEnd + headerSeparator.length;
      continue;
    }

    const valueStart = headerEnd + headerSeparator.length;
    const nextBoundary = body.indexOf(boundaryBuffer, valueStart);

    if (nextBoundary === -1) {
      throw new Error("Invalid multipart body");
    }

    let valueEnd = nextBoundary;

    if (
      body[valueEnd - 2] === 13 &&
      body[valueEnd - 1] === 10
    ) {
      valueEnd -= 2;
    }

    const valueBuffer = body.subarray(valueStart, valueEnd);

    if (filename !== undefined && filename !== "") {
      const contentType =
        headers.get("content-type") || "application/octet-stream";

      const fileBytes = Uint8Array.from(valueBuffer);

      const file = new File([fileBytes], filename, {
        type: contentType,
      });

      const currentFiles = files.get(name) || [];
      currentFiles.push(file);
      files.set(name, currentFiles);
    } else {
      const currentValues = fields.get(name) || [];
      currentValues.push(valueBuffer.toString("utf8"));
      fields.set(name, currentValues);
    }

    cursor = nextBoundary;
  }

  return {
    fields,
    files,
  };
}

async function readMultipartRequest(
  request: NextRequest
): Promise<ParsedMultipartBody> {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    throw new Error("Upload request must use multipart/form-data");
  }

  const boundary = getMultipartBoundary(contentType);
  const arrayBuffer = await request.arrayBuffer();
  const body = Buffer.from(arrayBuffer);

  if (!body.length) {
    throw new Error("Upload request body is empty");
  }

  return parseMultipartBody(body, boundary);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { fields, files } = await readMultipartRequest(request);

    const folderValue = fields.get("folder")?.[0];
    const documentSlugValue = fields.get("documentSlug")?.[0];

    if (!folderValue || !isValidImageFolder(folderValue)) {
      return NextResponse.json(
        { success: false, error: "Invalid upload folder" },
        { status: 400 }
      );
    }

    const documentSlug = documentSlugValue || undefined;
    const uploadFiles = files.get("files") || [];

    if (!uploadFiles.length) {
      return NextResponse.json(
        { success: false, error: "No files were provided" },
        { status: 400 }
      );
    }

    const uploads = await Promise.all(
      uploadFiles.map((file) =>
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
            : message === "Missing multipart boundary" ||
                message === "Invalid multipart body" ||
                message === "Upload request must use multipart/form-data" ||
                message === "Upload request body is empty"
              ? 400
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