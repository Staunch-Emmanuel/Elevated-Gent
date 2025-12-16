// src/app/wellness/[slug]/page.tsx
import { PagePadding, Container } from "@/components/layout";
import StructuredData from "@/components/seo/StructuredData";

import type { ArticleDocument } from "@/lib/types/articles";
import { getWellnessBySlug } from "@/lib/firebase/wellness";

interface ArticlePageProps {
  params: { slug: string };
}

export default async function WellnessArticlePage({ params }: ArticlePageProps) {
  const slug = params.slug;

  const article: ArticleDocument | null = await getWellnessBySlug(slug);

  if (!article) {
    return (
      <PagePadding>
        <Container>
          <h1 className="text-2xl font-bold">Article not found</h1>
        </Container>
      </PagePadding>
    );
  }

  const title = article.title ?? "Untitled article";
  const excerpt = article.excerpt ?? "";
  const heroImage = article.heroImage;

  return (
    <section>
      <StructuredData
        title={title}
        description={excerpt}
        type="article"
        slug={`/wellness/${slug}`}
        image={heroImage}
      />

      <PagePadding>
        <Container className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          {excerpt && <p className="text-lg text-gray-600 mb-6">{excerpt}</p>}
          {heroImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt={title}
              className="w-full rounded-xl mb-8"
            />
          )}

          <div
            className="prose prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
          />
        </Container>
      </PagePadding>
    </section>
  );
}
