// src/app/outfit-inspiration/[slug]/page.tsx

import Image from "next/image";
import { notFound } from "next/navigation";
import { PagePadding, Container } from "@/components/layout";
import { StructuredData } from "@/components/seo/StructuredData";

import {
  getOutfitBySlug,
  incrementOutfitView,
  type OutfitDocument,
} from "@/lib/firebase/outfits";

import {
  outfitLooks as staticOutfits,
  weeklyProducts as staticWeekly,
} from "@/lib/products/data";

import { getWeeklyProducts } from "@/lib/firebase/weekly";
import type { Product, OutfitLook } from "@/lib/products/types";

export default async function OutfitPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  // 1) Load CMS outfit
  const cmsDoc: OutfitDocument | null = await getOutfitBySlug(slug);

  let finalOutfit: OutfitLook | null = null;

  // 2) Static fallback
  if (!cmsDoc) {
    finalOutfit = staticOutfits.find((o) => o.id === slug) || null;
  }

  // 3) CMS → OutfitLook conversion
  if (cmsDoc) {
    const cmsWeekly: Product[] = await getWeeklyProducts();
    const allProducts = [...staticWeekly, ...cmsWeekly];

    const productMap: Record<string, Product> = {};
    allProducts.forEach((p) => (productMap[p.id] = p));

    const mappedProducts = (cmsDoc.products || [])
      .map((id: string) => productMap[id])
      .filter(Boolean) as Product[];

    finalOutfit = {
      id: cmsDoc.slug || cmsDoc.id,
      title: cmsDoc.title,
      description: cmsDoc.description,
      heroImage: cmsDoc.heroImage,
      gallery: cmsDoc.gallery || [],
      occasion: cmsDoc.occasion,
      season: cmsDoc.season,
      styleType: cmsDoc.styleType,
      products: mappedProducts,
      totalPrice: cmsDoc.totalPrice ?? 0,
      featured: cmsDoc.featured ?? false,
    };

    // Analytics
    incrementOutfitView(cmsDoc.id).catch(() => {});
  }

  if (!finalOutfit) return notFound();

  return (
    <>
      <StructuredData pageKey="outfit-detail" />

      <section className="py-16">
        <PagePadding>
          <Container className="space-y-12">
            {/* HERO IMAGE */}
            <div className="w-full">
              <Image
                src={finalOutfit.heroImage}
                alt={finalOutfit.title}
                width={1200}
                height={900}
                className="w-full rounded-lg object-cover"
              />
            </div>

            {/* TITLE + META */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {finalOutfit.title}
              </h1>

              <div className="text-muted text-lg space-y-1">
                {finalOutfit.occasion && <p>Occasion: {finalOutfit.occasion}</p>}
                {finalOutfit.styleType && <p>Style: {finalOutfit.styleType}</p>}
                {finalOutfit.season && <p>Season: {finalOutfit.season}</p>}
              </div>

              <p className="font-serif text-lg max-w-3xl">
                {finalOutfit.description}
              </p>
            </div>

            {/* GALLERY */}
            {finalOutfit.gallery && finalOutfit.gallery.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {finalOutfit.gallery.map((url: string, idx: number) => (
                  <Image
                    key={idx}
                    src={url}
                    alt={`${finalOutfit.title} ${idx + 1}`}
                    width={800}
                    height={800}
                    className="rounded-lg object-cover"
                  />
                ))}
              </div>
            )}

            {/* PRODUCTS */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Products in this look</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {finalOutfit.products.map((product) => (
                  <a
                    key={product.id}
                    href={product.affiliateLink || product.productLink}
                    target="_blank"
                    className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={160}
                      height={160}
                      className="rounded object-cover"
                    />

                    <div>
                      <h3 className="font-semibold">{product.title}</h3>
                      <p className="text-muted">{product.brand}</p>
                      <p className="mt-2 font-bold">${product.price}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* TOTAL PRICE */}
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-xl font-semibold">Total Price</h3>
              <p className="text-3xl font-bold mt-2">
                ${finalOutfit.totalPrice}
              </p>
            </div>
          </Container>
        </PagePadding>
      </section>
    </>
  );
}
