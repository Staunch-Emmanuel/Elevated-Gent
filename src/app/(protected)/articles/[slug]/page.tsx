import { notFound } from "next/navigation";
import { PagePadding, Container } from "@/components/layout";
import { StructuredData } from "@/components/seo/StructuredData";

import staticArticles from "@/lib/articles/data";
import { getArticleBySlugCMS } from "@/lib/firebase/articles";
import type { ArticleDocument } from "@/lib/types/articles";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function normalizeSlug(value: string): string {
  return decodeURIComponent(value).trim().toLowerCase();
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const normalizedSlug = normalizeSlug(slug);

  // 1️⃣ Try CMS
  let article: ArticleDocument | null =
    await getArticleBySlugCMS(normalizedSlug);

  // 2️⃣ Fallback to static
  if (!article) {
    article =
      staticArticles.find(
        (a) => normalizeSlug(a.slug ?? "") === normalizedSlug
      ) ?? null;
  }

  if (!article) {
    notFound();
  }

  return (
    <section>
      <StructuredData pageKey="article" />

      <PagePadding>
        <Container className="max-w-3xl pb-24">
          <h1 className="text-4xl font-bold mb-4">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-lg text-gray-600 mb-8">
              {article.excerpt}
            </p>
          )}

          {article.content && (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: article.content,
              }}
            />
          )}
        </Container>
      </PagePadding>
    </section>
  );
}
