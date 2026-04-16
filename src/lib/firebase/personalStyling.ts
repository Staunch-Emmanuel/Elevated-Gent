"use client";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";

const COLLECTION = "siteContent";
const DOCUMENT_ID = "personalStyling";

export interface PersonalStylingPackage {
  name: string;
  price: string;
  description: string;
  features: string[];
  badge?: string;
  badgeVariant?: "default" | "inverse";
}

export interface PersonalStylingStep {
  title: string;
  description: string;
}

export interface PersonalStylingFaq {
  question: string;
  answer: string;
}

export interface PersonalStylingContent {
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundImage: string;
  foundationPackage: PersonalStylingPackage;
  signatureRefresh: PersonalStylingPackage;
  gentlemensUpgrade: PersonalStylingPackage;
  processTitle: string;
  processSteps: PersonalStylingStep[];
  faqTitle: string;
  faqs: PersonalStylingFaq[];
  updatedAt?: any;
  createdAt?: any;
}

export const defaultPersonalStylingContent: PersonalStylingContent = {
  heroTitle: "Your Style, Elevated",
  heroSubtitle:
    "Choose from our professional styling services designed to help you develop a signature look that reflects your personality, lifestyle, and professional goals.",
  heroBackgroundImage: "",

  foundationPackage: {
    name: "The Foundation Package",
    price: "$500",
    description:
      "Perfect for getting started with your style journey. Get a curated seasonal lookbook and personal shopping guidance.",
    features: [
      "Seasonal lookbook (5 curated outfits for work, social, events, casual)",
      "Personal shopping: links + recommended brands/stores",
      "1 month of direct message support (ongoing feedback on outfits)",
    ],
    badge: "",
    badgeVariant: "default",
  },

  signatureRefresh: {
    name: "The Signature Refresh",
    price: "$750",
    description:
      "Comprehensive style refresh with consultation and expanded lookbook. Perfect for leveling up your style game.",
    badge: "Most Popular",
    badgeVariant: "default",
    features: [
      "30min style consultation",
      "Seasonal lookbook (10 curated outfits for work, social, events, casual)",
      "Personal shopping: links + recommended brands/stores",
      "1 month of direct message support (ongoing feedback on outfits)",
    ],
  },

  gentlemensUpgrade: {
    name: "The Gentlemen's Upgrade",
    price: "$1,250",
    description:
      "Our most comprehensive package with full consultation, extensive lookbook, and hands-on styling support.",
    badge: "Premium",
    badgeVariant: "inverse",
    features: [
      "1 hour style consultation (create a plan, outlook, and a view of your current closet)",
      "Full seasonal lookbook (20 curated outfits for work, social, events, casual)",
      "Personal shopping: links + recommended brands/stores",
      "1 month of direct message support (ongoing feedback on outfits)",
      "1 hour outfit try on consultation for outfit building, styling, and guided online shopping",
    ],
  },

  processTitle: "How It Works",
  processSteps: [
    {
      title: "Consultation",
      description:
        "We start with understanding your lifestyle, preferences, and goals.",
    },
    {
      title: "Assessment",
      description:
        "Review your current wardrobe and identify opportunities for improvement.",
    },
    {
      title: "Transformation",
      description:
        "Implement the styling strategy with new outfits and recommendations.",
    },
  ],

  faqTitle: "Frequently Asked Questions",
  faqs: [
    {
      question: "Do you offer virtual styling sessions?",
      answer:
        "Yes, all our services are available both virtually and in-person. Virtual sessions are conducted via video call and are just as effective for most styling needs.",
    },
    {
      question: "What should I prepare for my styling session?",
      answer:
        "We'll send you a detailed preparation guide after booking. Generally, having your wardrobe accessible and thinking about your style goals beforehand helps maximize our time together.",
    },
    {
      question: "Do you help with shopping for new pieces?",
      answer:
        "Absolutely. All our packages include personal shopping with links and recommended brands/stores. Our premium Gentlemen's Upgrade package also includes guided online shopping sessions.",
    },
  ],
};

function normalizePackage(input: any, fallback: PersonalStylingPackage): PersonalStylingPackage {
  return {
    name: input?.name ?? fallback.name,
    price: input?.price ?? fallback.price,
    description: input?.description ?? fallback.description,
    features: Array.isArray(input?.features)
      ? input.features.map((item: unknown) => String(item))
      : fallback.features,
    badge: input?.badge ?? fallback.badge ?? "",
    badgeVariant:
      input?.badgeVariant === "inverse"
        ? "inverse"
        : (fallback.badgeVariant ?? "default"),
  };
}

function normalizeStep(input: any, fallback: PersonalStylingStep): PersonalStylingStep {
  return {
    title: input?.title ?? fallback.title,
    description: input?.description ?? fallback.description,
  };
}

function normalizeFaq(input: any, fallback: PersonalStylingFaq): PersonalStylingFaq {
  return {
    question: input?.question ?? fallback.question,
    answer: input?.answer ?? fallback.answer,
  };
}

function normalizeContent(data: any): PersonalStylingContent {
  return {
    heroTitle: data?.heroTitle ?? defaultPersonalStylingContent.heroTitle,
    heroSubtitle:
      data?.heroSubtitle ?? defaultPersonalStylingContent.heroSubtitle,
    heroBackgroundImage:
      typeof data?.heroBackgroundImage === "string"
        ? data.heroBackgroundImage.trim()
        : defaultPersonalStylingContent.heroBackgroundImage,

    foundationPackage: normalizePackage(
      data?.foundationPackage,
      defaultPersonalStylingContent.foundationPackage
    ),
    signatureRefresh: normalizePackage(
      data?.signatureRefresh,
      defaultPersonalStylingContent.signatureRefresh
    ),
    gentlemensUpgrade: normalizePackage(
      data?.gentlemensUpgrade,
      defaultPersonalStylingContent.gentlemensUpgrade
    ),

    processTitle: data?.processTitle ?? defaultPersonalStylingContent.processTitle,
    processSteps: Array.isArray(data?.processSteps) && data.processSteps.length > 0
      ? data.processSteps.map((step: any, index: number) =>
          normalizeStep(
            step,
            defaultPersonalStylingContent.processSteps[index] ??
              defaultPersonalStylingContent.processSteps[0]
          )
        )
      : defaultPersonalStylingContent.processSteps,

    faqTitle: data?.faqTitle ?? defaultPersonalStylingContent.faqTitle,
    faqs: Array.isArray(data?.faqs) && data.faqs.length > 0
      ? data.faqs.map((faq: any, index: number) =>
          normalizeFaq(
            faq,
            defaultPersonalStylingContent.faqs[index] ??
              defaultPersonalStylingContent.faqs[0]
          )
        )
      : defaultPersonalStylingContent.faqs,

    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt,
  };
}

function cleanPackage(pkg: PersonalStylingPackage) {
  return {
    name: pkg.name ?? "",
    price: pkg.price ?? "",
    description: pkg.description ?? "",
    features: Array.isArray(pkg.features)
      ? pkg.features.map((item) => String(item ?? ""))
      : [],
    badge: pkg.badge ?? "",
    badgeVariant: pkg.badgeVariant === "inverse" ? "inverse" : "default",
  };
}

function cleanContent(content: PersonalStylingContent) {
  return {
    heroTitle: content.heroTitle ?? "",
    heroSubtitle: content.heroSubtitle ?? "",
    heroBackgroundImage: content.heroBackgroundImage ?? "",
    foundationPackage: cleanPackage(content.foundationPackage),
    signatureRefresh: cleanPackage(content.signatureRefresh),
    gentlemensUpgrade: cleanPackage(content.gentlemensUpgrade),
    processTitle: content.processTitle ?? "",
    processSteps: Array.isArray(content.processSteps)
      ? content.processSteps.map((step) => ({
          title: step.title ?? "",
          description: step.description ?? "",
        }))
      : [],
    faqTitle: content.faqTitle ?? "",
    faqs: Array.isArray(content.faqs)
      ? content.faqs.map((faq) => ({
          question: faq.question ?? "",
          answer: faq.answer ?? "",
        }))
      : [],
  };
}

export async function getPersonalStylingContent(): Promise<PersonalStylingContent> {
  const ref = doc(db, COLLECTION, DOCUMENT_ID);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return defaultPersonalStylingContent;
  }

  return normalizeContent(snap.data());
}

export async function savePersonalStylingContent(
  content: PersonalStylingContent
): Promise<void> {
  const ref = doc(db, COLLECTION, DOCUMENT_ID);
  const existing = await getDoc(ref);

  await setDoc(
    ref,
    {
      ...cleanContent(content),
      updatedAt: serverTimestamp(),
      createdAt: existing.exists()
        ? existing.data().createdAt ?? serverTimestamp()
        : serverTimestamp(),
    },
    { merge: true }
  );
}