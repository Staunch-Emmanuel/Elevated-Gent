// src/components/seo/StructuredData.tsx

type StructuredDataProps = {
  pageKey: "articles" | "article" | "collection";
  title?: string;
  description?: string;
  slug?: string;
};

export function StructuredData({
  pageKey,
  title,
  description,
  slug,
}: StructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": pageKey === "article" ? "Article" : "CollectionPage",
    headline: title,
    description,
    url: slug,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
