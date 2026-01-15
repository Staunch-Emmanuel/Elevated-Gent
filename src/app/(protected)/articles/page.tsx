import Link from "next/link";
import { PagePadding, Container } from "@/components/layout";
import { StructuredData } from "@/components/seo/StructuredData";

import staticArticles from "@/lib/articles/data";
import type { ArticleDocument } from "@/lib/types/articles";
import { getAllArticlesCMS } from "@/lib/firebase/articles";

type CombinedArticle = ArticleDocument & {
  source: "static" | "cms";
  normalizedDate: number;
};

export default async function ArticlesPage() {
  const cms = await getAllArticlesCMS();

  const cmsMapped: CombinedArticle[] = cms.map((a) => ({
    ...a,
    source: "cms",
    normalizedDate: a.createdAt
      ? new Date(a.createdAt).getTime()
      : Date.now(),
  }));

  const staticMapped: CombinedArticle[] = staticArticles.map((a) => ({
    ...a,
    source: "static",
    normalizedDate: a.createdAt
      ? new Date(a.createdAt).getTime()
      : Date.now(),
  }));

  const merged = [...cmsMapped, ...staticMapped].sort(
    (a, b) => b.normalizedDate - a.normalizedDate
  );

  return (
    <section>
      <StructuredData pageKey="articles" />

      <PagePadding>
        <Container className="pb-24">
          <h1 className="text-4xl font-bold mb-8">Articles</h1>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {merged.map((article) => {
              const href =
                article.source === "cms"
                  ? `/articles/${article.id}`
                  : `/articles/${article.slug}`;

              return (
                <article
                  key={`${article.source}-${article.id ?? article.slug}`}
                  className="border rounded-xl p-6 flex flex-col gap-3"
                >
                  <p className="text-xs uppercase text-gray-500">
                    {article.category ?? "general"}
                  </p>

                  <h2 className="text-xl font-semibold">
                    <Link href={href}>{article.title}</Link>
                  </h2>

                  <p className="text-sm text-gray-600">
                    {article.excerpt}
                  </p>

                  <Link
                    href={href}
                    className="text-sm text-blue-600 mt-auto"
                  >
                    Read →
                  </Link>
                </article>
              );
            })}
          </div>
        </Container>
      </PagePadding>
    </section>
  );
}
