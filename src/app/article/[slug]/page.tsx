import { redirect } from "next/navigation";

export default function ArticleSlugRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/articles/${params.slug}`);
}
