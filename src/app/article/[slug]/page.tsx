import { redirect } from "next/navigation";

export default async function ArticleSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/articles/${slug}`);
}
