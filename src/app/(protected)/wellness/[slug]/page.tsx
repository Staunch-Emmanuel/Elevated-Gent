import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WellnessSlugClient from "@/app/wellness/[slug]/WellnessSlugClient";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function WellnessSlugPage({ params }: PageProps) {
  return (
    <ProtectedRoute>
      <WellnessSlugClient slug={params.slug} />
    </ProtectedRoute>
  );
}
