// src/app/article/[slug]/page.tsx
import { PagePadding, Container } from "@/components/layout";
import StructuredData from "@/components/seo/StructuredData";

import type { Article, ArticleDocument } from "@/lib/types/articles";
import { getStaticArticleBySlug } from "@/lib/articles/data";
import { getArticleBySlugCMS } from "@/lib/firebase/articles";

interface ArticlePageProps {
  params: { slug: string };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const slug = params.slug;

  let article: Article | ArticleDocument | null =
    getStaticArticleBySlug(slug);

  if (!article) {
    article = await getArticleBySlugCMS(slug);
  }

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
        slug={`/article/${slug}`}
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
