import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Brand } from "@/components/brand";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { MOMENT_IDS, getMoment, isMomentId } from "@/lib/moments";

type PageProps = {
  params: Promise<{ momen: string }>;
};

export function generateStaticParams() {
  return MOMENT_IDS.map((momen) => ({ momen }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { momen } = await params;

  if (!isMomentId(momen)) {
    return { title: "Momen tidak dikenal", robots: { index: false, follow: false } };
  }

  const moment = getMoment(momen);

  return {
    title: `Bikin halaman ${moment.label}`,
    description: `Susun halaman kejutan ${moment.label.toLowerCase()}: desain, nama, cerita, dan pratinjau langsung sebelum dibagikan.`,
  };
}

export default async function EditorPage({ params }: PageProps) {
  const { momen } = await params;

  if (!isMomentId(momen)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-paper bg-dots-soft">
      <header className="border-b-4 border-ink bg-paper">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Brand />
          <Link
            href="/buat"
            className="inline-flex h-[42px] items-center justify-center rounded-xl border-[3px] border-ink bg-paper px-4 font-display text-[0.85rem] uppercase tracking-[0.01em] text-ink shadow-[4px_4px_0_0_#111] transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            Ganti momen
          </Link>
        </div>
      </header>

      <main>
        <EditorWorkspace moment={getMoment(momen)} />
      </main>
    </div>
  );
}
