import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SurpriseExpired } from "@/components/surprise/surprise-expired";
import { SurpriseView } from "@/components/surprise/surprise-view";
import { getSurprisePage, isExpired } from "@/lib/surprise-pages";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getSurprisePage(slug);

  if (!page) {
    return {
      title: "Kejutan tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const title = `Kejutan untuk ${page.recipientName}`;

  return {
    title,
    description:
      "Sebuah kejutan personal menantimu. Buka halamannya untuk membaca cerita, melihat kenangan, dan suratnya.",
    robots: { index: false, follow: false, nocache: true },
    referrer: "no-referrer",
    openGraph: {
      title,
      description:
        "Sebuah kejutan personal menantimu. Buka halamannya untuk membaca cerita, melihat kenangan, dan suratnya.",
      type: "website",
      locale: "id_ID",
    },
  };
}

export default async function PublicSurprisePage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getSurprisePage(slug);

  if (!page) {
    notFound();
  }

  if (isExpired(page.activeUntil)) {
    return <SurpriseExpired />;
  }

  return <SurpriseView page={page} />;
}
