// src/components/seo/StructuredData.tsx
import Head from "next/head";

interface StructuredDataProps {
  title: string;
  description: string;
  type: "article" | "collection" | "website";
  slug: string;
  image?: string;
}

export default function StructuredData({
  title,
  description,
  type,
  slug,
  image,
}: StructuredDataProps) {
  const jsonLd =
    type === "article"
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          image: image ? [image] : undefined,
          mainEntityOfPage: slug,
        }
      : {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          description,
          url: slug,
        };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
    </Head>
  );
}
