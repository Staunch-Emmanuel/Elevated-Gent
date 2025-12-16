// src/app/article/page.tsx
import Link from "next/link";
import { PagePadding, Container } from "@/components/layout";
import StructuredData from "@/components/seo/StructuredData";

import staticArticles from "@/lib/articles/data";
import type { ArticleDocument } from "@/lib/types/articles";
import { getAllArticlesCMS } from "@/lib/firebase/articles";

type CombinedArticle = ArticleDocument & {
  source: "static" | "cms";
  normalizedDate: number;
};

export default async function ArticleListingPage() {
  const cmsRaw = await getAllArticlesCMS();

  const cmsMapped: CombinedArticle[] = cmsRaw.map((item) => ({
    ...item,
    source: "cms",
    normalizedDate: item.createdAt
      ? new Date(item.createdAt).getTime()
      : Date.now(),
  }));

  const staticMapped: CombinedArticle[] = staticArticles.map((item) => {
    const date =
      item.datePublished ||
      item.publishDate ||
      item.createdAt ||
      item.updatedAt ||
      "";
    const normalizedDate = date ? new Date(date).getTime() : Date.now();

    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      heroImage: item.heroImage,
      category: item.category,
      tag: item.tag,
      datePublished: item.datePublished,
      publishDate: item.publishDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      occasion: item.occasion,
      source: "static",
      normalizedDate,
    };
  });

  const merged: CombinedArticle[] = [...cmsMapped, ...staticMapped].sort(
    (a, b) => b.normalizedDate - a.normalizedDate
  );

  return (
    <section>
      <StructuredData
        title="Articles"
        description="In-depth guides on style, grooming and wellness."
        type="collection"
        slug="/article"
      />

      <PagePadding>
        <Container>
          <h1 className="text-4xl font-bold mb-8">Articles</h1>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {merged.map((article) => (
              <article
                key={article.id}
                className="border rounded-xl p-6 flex flex-col gap-3"
              >
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {article.category ?? "general"}
                </p>
                <h2 className="text-xl font-semibold">
                  <Link href={`/article/${article.slug}`}>
                    {article.title ?? "Untitled"}
                  </Link>
                </h2>
                <p className="text-sm text-gray-600">
                  {article.excerpt ?? ""}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {article.source === "static" ? "Static" : "CMS"}
                  </span>
                  <Link
                    href={`/article/${article.slug}`}
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
