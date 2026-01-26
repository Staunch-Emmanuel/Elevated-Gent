import React from "react";

export type StructuredDataJson = Record<string, any>;

export type StructuredDataProps = {
  /**
   * Existing project API (already used across the app)
   */
  pageKey?: string;

  /**
   * Optional custom JSON-LD payload (fixes weekly page build error)
   */
  data?: StructuredDataJson;
};

/**
 * Minimal built-in schema presets so existing "pageKey" usage keeps working.
 * You can expand these later, but this will keep builds stable now.
 */
function buildPreset(pageKey?: string): StructuredDataJson | null {
  if (!pageKey) return null;

  switch (pageKey) {
    case "weekly":
      return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Weekly Finds",
        description: "Curated weekly fashion finds including products and outfit inspiration.",
      };

    case "article":
      return {
        "@context": "https://schema.org",
        "@type": "Article",
      };

    case "wellness":
      return {
        "@context": "https://schema.org",
        "@type": "Article",
      };

    default:
      return {
        "@context": "https://schema.org",
        "@type": "WebPage",
      };
  }
}

export function StructuredData({ pageKey, data }: StructuredDataProps) {
  const payload = data ?? buildPreset(pageKey);

  if (!payload) return null;

  return (
    <script
      type="application/ld+json"
      // JSON-LD must be a JSON string
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

export default StructuredData;
