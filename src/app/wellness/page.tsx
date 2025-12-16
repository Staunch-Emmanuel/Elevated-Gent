// src/app/wellness/page.tsx
import Link from "next/link";
import { PagePadding, Container } from "@/components/layout";
import StructuredData from "@/components/seo/StructuredData";

import type { ArticleDocument } from "@/lib/types/articles";
import { getWellnessArticles } from "@/lib/firebase/wellness";

interface CombinedWellness extends ArticleDocument {
  source: "cms";
  normalizedDate: number;
}

export default async function WellnessListingPage() {
  const cmsRaw = await getWellnessArticles();

  const merged: CombinedWellness[] = cmsRaw
    .map((item) => ({
      ...item,
      source: "cms" as const,
      normalizedDate: item.createdAt
        ? new Date(item.createdAt).getTime()
        : Date.now(),
    }))
    .sort((a, b) => b.normalizedDate - a.normalizedDate);

  return (
    <section>
      <StructuredData
        title="Wellness"
        description="Wellness guides for the modern gentleman."
        type="collection"
        slug="/wellness"
      />

      <PagePadding>
        <Container>
          <h1 className="text-4xl font-bold mb-8">Wellness</h1>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {merged.map((article) => (
              <article
                key={article.id}
                className="border rounded-xl p-6 flex flex-col gap-3"
              >
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  wellness
                </p>
                <h2 className="text-xl font-semibold">
                  <Link href={`/wellness/${article.slug}`}>
                    {article.title ?? "Untitled"}
                  </Link>
                </h2>
                <p className="text-sm text-gray-600">
                  {article.excerpt ?? ""}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">CMS</span>
                  <Link
                    href={`/wellness/${article.slug}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Read
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </PagePadding>
    </section>
  );
}
