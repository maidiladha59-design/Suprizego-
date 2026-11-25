import type { Metadata } from "next";
import Link from "next/link";
import { MomentArt } from "@/components/landing/moment-art";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MOMENTS, type MomentId } from "@/lib/moments";
import { formatRupiah, getPlan, isPlanId } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pilih momen kejutan",
  description:
    "Mulai halaman kejutan SuprizeGo dari momen yang paling dekat: pengakuan, ulang tahun, anniversary, minta maaf, atau wisuda.",
};

const CARD_THEMES: Record<
  MomentId,
  { art: string; footer: string; line: string; teaser: string }
> = {
  pengakuan: {
    art: "bg-paper bg-dots-soft",
    footer: "bg-candy",
    line: "Bilang perasaan tanpa gemetar di depan orangnya.",
    teaser: "3 pertanyaan, 1 keberanian",
  },
  "ulang-tahun": {
    art: "bg-lime bg-stripes",
    footer: "bg-white",
    line: "Cerita, foto, dan doa buat orang yang bertambah usia.",
    teaser: "kue, lagu, dan doa",
  },
  anniversary: {
    art: "bg-paper bg-grid-paper",
    footer: "bg-tangerine",
    line: "Rekap perjalanan kalian, dari hari pertama sampai sekarang.",
    teaser: "hitung hari jadiannya",
  },
  "minta-maaf": {
    art: "bg-white bg-dots-soft",
    footer: "bg-lime",
    line: "Maaf yang disusun rapi, biar nggak salah kata lagi.",
    teaser: "ada tombol maafkan",
  },
  wisuda: {
    art: "bg-candy",
    footer: "bg-paper bg-grid-paper",
    line: "Rayakan perjuangan yang akhirnya sampai di titik ini.",
    teaser: "toga bisa dilempar",
  },
};

type PageProps = {
  searchParams: Promise<{ paket?: string | string[] }>;
};

export default async function CreatePage({ searchParams }: PageProps) {
  const planParam = (await searchParams).paket;
  const requestedPlan = Array.isArray(planParam) ? planParam[0] : planParam;
  const selectedPlan = isPlanId(requestedPlan) ? getPlan(requestedPlan) : null;
  const planQuery = selectedPlan ? `?paket=${selectedPlan.id}` : "";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-14">
        <h1 className="font-display text-4xl font-normal uppercase leading-10 tracking-[-0.02em] sm:text-5xl sm:leading-[3rem]">
          Momen apa kali ini?
        </h1>
        <p className="mt-3 max-w-2xl text-base font-bold leading-6">
          Pilih momennya dulu. Pratinjau gratis, tanpa akun.
        </p>
        {selectedPlan ? (
          <p
            data-selected-plan={selectedPlan.id}
            className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-xl border-[3px] border-ink bg-lime px-3 py-2 text-xs font-bold leading-4"
          >
            Paket {selectedPlan.name} · {formatRupiah(selectedPlan.price)} ·{" "}
            {selectedPlan.activeLabel}
          </p>
        ) : null}

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {MOMENTS.map((moment) => {
            const theme = CARD_THEMES[moment.id];

            return (
              <Link
                key={moment.id}
                href={`/buat/${moment.id}${planQuery}`}
                className="group relative block h-full rounded-card focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                {moment.id === "pengakuan" && (
                  <span className="sticker absolute -right-2 -top-3 z-10 rotate-3 bg-lime px-3 py-1 text-[15px]">
                    Paling dipilih
                  </span>
                )}
                <article
                  className={`flex h-full flex-col overflow-hidden rounded-card border-4 border-ink shadow-hard-lg transition-[transform,box-shadow] duration-200 group-hover:-translate-y-1 group-hover:shadow-[10px_10px_0_0_#111] ${theme.footer}`}
                >
                  <div
                    className={`grid h-[209px] place-items-center border-b-4 border-ink p-5 ${theme.art}`}
                  >
                    <MomentArt
                      moment={moment.id}
                      className="h-40 w-auto max-w-full transition-transform duration-300 group-hover:rotate-[-3deg]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-display text-2xl uppercase leading-8 text-ink">
                        {moment.label}
                      </h2>
                      <ArrowRightIcon className="mt-1 size-6 shrink-0 text-ink transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                    <p className="mt-1 text-sm font-bold leading-5 text-ink">{theme.line}</p>
                    <div className="mt-auto pt-4">
                      <span className="inline-block rounded-full border-[3px] border-ink bg-white px-3 py-1 text-xs font-bold leading-4 text-ink">
                        <span aria-hidden="true">✦ </span>
                        {theme.teaser}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
