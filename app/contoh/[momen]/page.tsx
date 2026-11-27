import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SurpriseView } from "@/components/surprise/surprise-view";
import { CONTACT_EMAIL } from "@/lib/contact";
import { getExample } from "@/lib/examples";
import { MOMENTS, getMoment } from "@/lib/moments";
import { SPECIAL_DAY_IDS, getSpecialDay, isSpecialDayId } from "@/lib/special-days";

type PageProps = {
  params: Promise<{ momen: string }>;
};

export function generateStaticParams() {
  return [
    ...MOMENTS.map((moment) => ({ momen: moment.id })),
    ...SPECIAL_DAY_IDS.map((id) => ({ momen: id })),
  ];
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

  const specialDay = isSpecialDayId(momen) ? getSpecialDay(momen) : null;

  return {
    title: specialDay
      ? `Contoh ucapan ${specialDay.nama}`
      : `Contoh halaman ${getMoment(example.moment).label}`,
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

  return <SurpriseView page={example} contactEmail={CONTACT_EMAIL} />;
}
