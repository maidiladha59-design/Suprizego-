import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SurpriseUnavailable } from "@/components/surprise/surprise-unavailable";
import { SurpriseView } from "@/components/surprise/surprise-view";
import { CONTACT_EMAIL } from "@/lib/contact";
import { getSurprisePageState } from "@/lib/surprise-pages";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const state = await getSurprisePageState(slug);

  if (state.status !== "active") {
    return {
      title: "Kejutan tidak tersedia",
      robots: { index: false, follow: false },
    };
  }

  const title = `Kejutan untuk ${state.page.recipientName}`;

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
  const state = await getSurprisePageState(slug);

  if (state.status === "not-found") notFound();
  if (state.status !== "active") return <SurpriseUnavailable status={state.status} />;

  return <SurpriseView page={state.page} contactEmail={CONTACT_EMAIL} />;
}
