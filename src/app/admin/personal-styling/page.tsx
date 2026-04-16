"use client";

import { useEffect, useState, FormEvent } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PagePadding, Container } from "@/components/layout";
import CMSImageUploadField from "@/components/admin/CMSImageUploadField";

import {
  defaultPersonalStylingContent,
  getPersonalStylingContent,
  savePersonalStylingContent,
  type PersonalStylingContent,
} from "@/lib/firebase/personalStyling";

function updateFeature(
  content: PersonalStylingContent,
  packageKey: "foundationPackage" | "signatureRefresh" | "gentlemensUpgrade",
  index: number,
  value: string
): PersonalStylingContent {
  const nextFeatures = [...content[packageKey].features];
  nextFeatures[index] = value;

  return {
    ...content,
    [packageKey]: {
      ...content[packageKey],
      features: nextFeatures,
    },
  };
}

function addFeature(
  content: PersonalStylingContent,
  packageKey: "foundationPackage" | "signatureRefresh" | "gentlemensUpgrade"
): PersonalStylingContent {
  return {
    ...content,
    [packageKey]: {
      ...content[packageKey],
      features: [...content[packageKey].features, ""],
    },
  };
}

function removeFeature(
  content: PersonalStylingContent,
  packageKey: "foundationPackage" | "signatureRefresh" | "gentlemensUpgrade",
  index: number
): PersonalStylingContent {
  const filtered = content[packageKey].features.filter((_, i) => i !== index);

  return {
    ...content,
    [packageKey]: {
      ...content[packageKey],
      features: filtered.length > 0 ? filtered : [""],
    },
  };
}

function updateProcessStep(
  content: PersonalStylingContent,
  index: number,
  field: "title" | "description",
  value: string
): PersonalStylingContent {
  const nextSteps = [...content.processSteps];
  nextSteps[index] = {
    ...nextSteps[index],
    [field]: value,
  };

  return {
    ...content,
    processSteps: nextSteps,
  };
}

function updateFaq(
  content: PersonalStylingContent,
  index: number,
  field: "question" | "answer",
  value: string
): PersonalStylingContent {
  const nextFaqs = [...content.faqs];
  nextFaqs[index] = {
    ...nextFaqs[index],
    [field]: value,
  };

  return {
    ...content,
    faqs: nextFaqs,
  };
}

function addFaq(content: PersonalStylingContent): PersonalStylingContent {
  return {
    ...content,
    faqs: [...content.faqs, { question: "", answer: "" }],
  };
}

function removeFaq(content: PersonalStylingContent, index: number): PersonalStylingContent {
  const nextFaqs = content.faqs.filter((_, i) => i !== index);

  return {
    ...content,
    faqs: nextFaqs.length > 0 ? nextFaqs : [{ question: "", answer: "" }],
  };
}

export default function AdminPersonalStylingPage() {
  const [content, setContent] = useState<PersonalStylingContent>(defaultPersonalStylingContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getPersonalStylingContent();
        setContent(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load personal styling content.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await savePersonalStylingContent(content);
      setMessage("Personal styling page updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <PagePadding>
          <Container className="py-10">
            <p>Loading personal styling content...</p>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="py-10 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Personal Styling</h1>
            <p className="mt-2 text-sm text-gray-500">
              Edit the personal styling page content here. Use{" "}
              <span className="font-mono">{"{firstName}"}</span> in the hero title
              if you want the user&apos;s first name to appear dynamically.
            </p>
          </div>

          {message ? (
            <div className="mb-6 rounded border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mb-6 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-10">
            <section className="space-y-4 rounded-lg border p-6">
              <h2 className="text-xl font-semibold">Hero Section</h2>

              <div>
                <label className="mb-1 block text-sm font-medium">Hero Title</label>
                <input
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={content.heroTitle}
                  onChange={(e) =>
                    setContent({ ...content, heroTitle: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Hero Subtitle</label>
                <textarea
                  className="min-h-[120px] w-full rounded border px-3 py-2 text-sm"
                  value={content.heroSubtitle}
                  onChange={(e) =>
                    setContent({ ...content, heroSubtitle: e.target.value })
                  }
                />
              </div>

              <CMSImageUploadField
                label="Hero Background Image"
                folder="homepage"
                documentSlug="personal-styling-hero"
                mode="single"
                value={content.heroBackgroundImage}
                onChange={(value) =>
                  setContent({
                    ...content,
                    heroBackgroundImage: typeof value === "string" ? value : "",
                  })
                }
                helpText="This image will replace the flat grey hero background and display with a dark overlay."
                disabled={saving}
              />
            </section>

            {[
              ["foundationPackage", "Foundation Package"],
              ["signatureRefresh", "Signature Refresh"],
              ["gentlemensUpgrade", "Gentlemen's Upgrade"],
            ].map(([key, label]) => {
              const packageKey = key as
                | "foundationPackage"
                | "signatureRefresh"
                | "gentlemensUpgrade";

              const pkg = content[packageKey];

              return (
                <section key={packageKey} className="space-y-4 rounded-lg border p-6">
                  <h2 className="text-xl font-semibold">{label}</h2>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Name</label>
                    <input
                      className="w-full rounded border px-3 py-2 text-sm"
                      value={pkg.name}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          [packageKey]: {
                            ...pkg,
                            name: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Price</label>
                    <input
                      className="w-full rounded border px-3 py-2 text-sm"
                      value={pkg.price}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          [packageKey]: {
                            ...pkg,
                            price: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Description</label>
                    <textarea
                      className="min-h-[100px] w-full rounded border px-3 py-2 text-sm"
                      value={pkg.description}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          [packageKey]: {
                            ...pkg,
                            description: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Badge (optional)</label>
                    <input
                      className="w-full rounded border px-3 py-2 text-sm"
                      value={pkg.badge ?? ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          [packageKey]: {
                            ...pkg,
                            badge: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Badge Variant</label>
                    <select
                      className="w-full rounded border px-3 py-2 text-sm"
                      value={pkg.badgeVariant ?? "default"}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          [packageKey]: {
                            ...pkg,
                            badgeVariant: e.target.value === "inverse" ? "inverse" : "default",
                          },
                        })
                      }
                    >
                      <option value="default">default</option>
                      <option value="inverse">inverse</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium">Features</label>

                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          className="w-full rounded border px-3 py-2 text-sm"
                          value={feature}
                          onChange={(e) =>
                            setContent(updateFeature(content, packageKey, index, e.target.value))
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setContent(removeFeature(content, packageKey, index))
                          }
                          className="rounded border px-3 py-2 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => setContent(addFeature(content, packageKey))}
                      className="text-sm underline"
                    >
                      + Add feature
                    </button>
                  </div>
                </section>
              );
            })}

            <section className="space-y-4 rounded-lg border p-6">
              <h2 className="text-xl font-semibold">Process Section</h2>

              <div>
                <label className="mb-1 block text-sm font-medium">Section Title</label>
                <input
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={content.processTitle}
                  onChange={(e) =>
                    setContent({ ...content, processTitle: e.target.value })
                  }
                />
              </div>

              <div className="space-y-6">
                {content.processSteps.map((step, index) => (
                  <div key={index} className="space-y-3 rounded border p-4">
                    <h3 className="font-medium">Step {index + 1}</h3>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Title</label>
                      <input
                        className="w-full rounded border px-3 py-2 text-sm"
                        value={step.title}
                        onChange={(e) =>
                          setContent(updateProcessStep(content, index, "title", e.target.value))
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Description</label>
                      <textarea
                        className="min-h-[100px] w-full rounded border px-3 py-2 text-sm"
                        value={step.description}
                        onChange={(e) =>
                          setContent(
                            updateProcessStep(content, index, "description", e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4 rounded-lg border p-6">
              <h2 className="text-xl font-semibold">FAQ Section</h2>

              <div>
                <label className="mb-1 block text-sm font-medium">Section Title</label>
                <input
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={content.faqTitle}
                  onChange={(e) =>
                    setContent({ ...content, faqTitle: e.target.value })
                  }
                />
              </div>

              <div className="space-y-6">
                {content.faqs.map((faq, index) => (
                  <div key={index} className="space-y-3 rounded border p-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Question</label>
                      <input
                        className="w-full rounded border px-3 py-2 text-sm"
                        value={faq.question}
                        onChange={(e) =>
                          setContent(updateFaq(content, index, "question", e.target.value))
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">Answer</label>
                      <textarea
                        className="min-h-[120px] w-full rounded border px-3 py-2 text-sm"
                        value={faq.answer}
                        onChange={(e) =>
                          setContent(updateFaq(content, index, "answer", e.target.value))
                        }
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setContent(removeFaq(content, index))}
                      className="text-sm text-red-600 underline"
                    >
                      Remove FAQ
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setContent(addFaq(content))}
                className="text-sm underline"
              >
                + Add FAQ
              </button>
            </section>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Personal Styling Page"}
              </button>
            </div>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  );
}