import type { MomentId } from "@/lib/moments";

export type Language = "id" | "en";

export const LANGUAGE_STORAGE_KEY = "suprizego-language";

type ChromeCopy = {
  cta: string;
  tagline: string;
  momentsHeading: string;
  brandHeading: string;
  momentsNavLabel: string;
  brandNavLabel: string;
  specialDays: string;
  buildPage: string;
  pricing: string;
  copyright: string;
  languageLabel: string;
  momentLabels: Record<MomentId, string>;
};

export const CHROME_COPY: Record<Language, ChromeCopy> = {
  id: {
    cta: "Bikin Sekarang",
    tagline:
      "Halaman kejutan personal untuk momen yang layak dikenang — cerita, foto, musik, dan surat dalam satu link.",
    momentsHeading: "MOMEN",
    brandHeading: "SUPRIZEGO",
    momentsNavLabel: "Momen SuprizeGo",
    brandNavLabel: "SuprizeGo",
    specialDays: "Hari Spesial",
    buildPage: "Bikin halaman",
    pricing: "Harga",
    copyright: "© 2026 SuprizeGo · dibuat dengan sepenuh hati",
    languageLabel: "Pilihan bahasa",
    momentLabels: {
      pengakuan: "Pengakuan",
      "ulang-tahun": "Ulang Tahun",
      anniversary: "Anniversary",
      "minta-maaf": "Minta Maaf",
      wisuda: "Wisuda",
    },
  },
  en: {
    cta: "Create Now",
    tagline:
      "Personal surprise pages for moments worth remembering — story, photos, music, and a letter in one link.",
    momentsHeading: "MOMENTS",
    brandHeading: "SUPRIZEGO",
    momentsNavLabel: "SuprizeGo moments",
    brandNavLabel: "SuprizeGo",
    specialDays: "Special Days",
    buildPage: "Create a page",
    pricing: "Pricing",
    copyright: "© 2026 SuprizeGo · made with all our heart",
    languageLabel: "Language",
    momentLabels: {
      pengakuan: "Confession",
      "ulang-tahun": "Birthday",
      anniversary: "Anniversary",
      "minta-maaf": "Apology",
      wisuda: "Graduation",
    },
  },
};
