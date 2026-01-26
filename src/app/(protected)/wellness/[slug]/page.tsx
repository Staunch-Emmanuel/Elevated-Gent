"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PagePadding, Container } from "@/components/layout";

import {
  getWellnessItemBySlug,
  type WellnessItem,
} from "@/lib/firebase/wellness";

export default function WellnessSlugPage() {
  const params = useParams();
  const slugParam = params?.slug;

  const slug = useMemo(() => {
    const raw = Array.isArray(slugParam) ? slugParam[0] : slugParam;
    if (!raw) return "";

    try {
      return decodeURIComponent(String(raw)).trim().toLowerCase();
    } catch {
      return String(raw).trim().toLowerCase();
    }
  }, [slugParam]);

  const [item, setItem] = useState<WellnessItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!slug) return;

      setLoading(true);
      setMissing(false);

      try {
        const doc = await getWellnessItemBySlug(slug);
        if (!alive) return;

        if (!doc) {
          setItem(null);
          setMissing(true);
        } else {
          setItem(doc);
          setMissing(false);
        }
      } catch (e) {
        console.error("Wellness load error:", e);
        if (!alive) return;
        setItem(null);
        setMissing(true);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [slug]);

  return (
    <ProtectedRoute>
      <section>
        <PagePadding>
          <Container className="max-w-3xl pb-24">
            {loading ? (
              <div className="min-h-[40vh] flex items-center justify-center">
                <p className="text-sm text-gray-500">Loading…</p>
              </div>
            ) : missing ? (
              <div className="min-h-[40vh] flex items-center justify-center">
                <p className="text-sm text-gray-600">
                  Wellness article not found.
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-bold mb-4">
                  {item?.title ?? "Wellness"}
                </h1>

                {item?.excerpt ? (
                  <p className="text-lg text-gray-600 mb-8">{item.excerpt}</p>
                ) : null}

                {item?.content ? (
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                ) : null}
              </>
            )}
          </Container>
        </PagePadding>
      </section>
    </ProtectedRoute>
  );
}
