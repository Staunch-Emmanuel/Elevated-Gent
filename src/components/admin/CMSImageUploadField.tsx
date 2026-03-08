"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { auth } from "@/lib/firebase/config";
import type { ImageUploadFolder } from "@/lib/uploads/image-upload";

type UploadMode = "single" | "multiple";

interface CMSImageUploadFieldProps {
  label: string;
  folder: ImageUploadFolder;
  documentSlug?: string;
  mode?: UploadMode;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  helpText?: string;
  disabled?: boolean;
}

interface LocalPreviewFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface UploadResponse {
  success: boolean;
  error?: string;
  uploads?: Array<{
    url: string;
    path: string;
    contentType: string;
    size: number;
    name: string;
  }>;
}

export default function CMSImageUploadField({
  label,
  folder,
  documentSlug,
  mode = "single",
  value,
  onChange,
  helpText,
  disabled = false,
}: CMSImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [localFiles, setLocalFiles] = useState<LocalPreviewFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const remoteUrls = useMemo(() => {
    if (mode === "multiple") {
      return Array.isArray(value) ? value : [];
    }

    return typeof value === "string" && value ? [value] : [];
  }, [mode, value]);

  useEffect(() => {
    return () => {
      localFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [localFiles]);

  function openFileDialog() {
    if (disabled || uploading) return;
    inputRef.current?.click();
  }

  function clearLocalFiles() {
    localFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setLocalFiles([]);
  }

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    setError("");

    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) return;

    clearLocalFiles();

    const nextLocalFiles = selectedFiles.map((file, index) => ({
      id: `${file.name}-${file.size}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    if (mode === "single") {
      setLocalFiles(nextLocalFiles.slice(0, 1));
    } else {
      setLocalFiles(nextLocalFiles);
    }

    event.target.value = "";
  }

  async function uploadFiles() {
    try {
      setError("");

      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("You must be signed in as an admin to upload images");
      }

      if (!localFiles.length) {
        throw new Error("Please choose an image first");
      }

      setUploading(true);

      const token = await currentUser.getIdToken();
      const formData = new FormData();

      formData.append("folder", folder);

      if (documentSlug) {
        formData.append("documentSlug", documentSlug);
      }

      const filesToUpload =
        mode === "single" ? localFiles.slice(0, 1) : localFiles;

      filesToUpload.forEach((item) => {
        formData.append("files", item.file);
      });

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = (await response.json()) as UploadResponse;

      if (!response.ok || !data.success || !data.uploads) {
        throw new Error(data.error || "Upload failed");
      }

      const uploadedUrls = data.uploads.map((item) => item.url);

      if (mode === "single") {
        onChange(uploadedUrls[0] ?? "");
      } else {
        const existing = Array.isArray(value) ? value : [];
        onChange([...existing, ...uploadedUrls]);
      }

      clearLocalFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeExistingImage(index: number) {
    if (mode === "single") {
      onChange("");
      return;
    }

    const current = Array.isArray(value) ? value : [];
    const next = current.filter((_, currentIndex) => currentIndex !== index);
    onChange(next);
  }

  const previewItems = [
    ...remoteUrls.map((url, index) => ({
      key: `remote-${index}`,
      url,
      isLocal: false,
      index,
    })),
    ...localFiles.map((item, index) => ({
      key: `local-${item.id}-${index}`,
      url: item.previewUrl,
      isLocal: true,
      index,
    })),
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        {helpText ? <p className="text-xs text-gray-500">{helpText}</p> : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={mode === "multiple"}
        className="hidden"
        onChange={handleFilesSelected}
        disabled={disabled || uploading}
      />

      {previewItems.length > 0 ? (
        <div
          className={
            mode === "multiple"
              ? "grid grid-cols-2 md:grid-cols-3 gap-4"
              : "grid grid-cols-1 gap-4"
          }
        >
          {previewItems.map((item) => (
            <div
              key={item.key}
              className="border rounded-md overflow-hidden bg-white"
            >
              <div className="aspect-[4/3] bg-gray-100">
                <img
                  src={item.url}
                  alt={label}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="text-xs text-gray-500">
                  {item.isLocal ? "Selected preview" : "Saved image"}
                </span>

                {!item.isLocal ? (
                  <button
                    type="button"
                    onClick={() => removeExistingImage(item.index)}
                    className="text-xs text-red-600"
                    disabled={disabled || uploading}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-gray-500">
          No image selected yet
        </div>
      )}

      {error ? (
        <p className="text-sm text-red-600 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={openFileDialog}
          disabled={disabled || uploading}
          className="px-4 py-2 rounded-md border text-sm disabled:opacity-60"
        >
          {mode === "single"
            ? remoteUrls.length
              ? "Choose Replacement"
              : "Choose Image"
            : "Choose Images"}
        </button>

        {localFiles.length > 0 ? (
          <button
            type="button"
            onClick={uploadFiles}
            disabled={disabled || uploading}
            className="px-4 py-2 rounded-md bg-black text-white text-sm disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload Selected"}
          </button>
        ) : null}

        {localFiles.length > 0 ? (
          <button
            type="button"
            onClick={clearLocalFiles}
            disabled={disabled || uploading}
            className="px-4 py-2 rounded-md border text-sm disabled:opacity-60"
          >
            Clear Selection
          </button>
        ) : null}
      </div>
    </div>
  );
}