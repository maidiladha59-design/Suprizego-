import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SurpriseView } from "@/components/surprise/surprise-view";
import { getExample } from "@/lib/examples";
import { MOMENTS, getMoment } from "@/lib/moments";

type PageProps = {
  params: Promise<{ momen: string }>;
};

export function generateStaticParams() {
  return MOMENTS.map((moment) => ({ momen: moment.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { momen } = await params;
  const example = getExample(momen);

  if (!example) {
    return {
      title: "Contoh tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Contoh halaman ${getMoment(example.moment).label}`,
    description: "Contoh halaman kejutan SuprizeGo: cerita, foto, musik, dan surat dalam satu link.",
    robots: { index: false, follow: false, nocache: true },
    referrer: "no-referrer",
  };
}

export default async function ExamplePage({ params }: PageProps) {
  const { momen } = await params;
  const example = getExample(momen);

  if (!example) {
    notFound();
  }

  return <SurpriseView page={example} />;
}
