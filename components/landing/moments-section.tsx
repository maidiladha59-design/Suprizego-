import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MOMENTS, type MomentId } from "@/lib/moments";
import { MomentArt } from "./moment-art";

const CARD_THEMES: Record<MomentId, { art: string; footer: string }> = {
  pengakuan: { art: "bg-paper bg-dots-soft", footer: "bg-candy" },
  "ulang-tahun": { art: "bg-lime bg-stripes", footer: "bg-paper" },
  anniversary: { art: "bg-paper bg-grid-paper", footer: "bg-tangerine" },
  "minta-maaf": { art: "bg-white bg-dots-soft", footer: "bg-lime" },
  wisuda: { art: "bg-candy", footer: "bg-paper" },
};

export function MomentsSection() {
  return (
    <section id="momen" aria-labelledby="momen-title" className="scroll-mt-24 bg-paper">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          <h2
            id="momen-title"
            className="font-display text-[2.15rem] font-extrabold uppercase leading-[0.95] tracking-[-0.035em] text-ink sm:text-5xl"
          >
            Momen apa?
          </h2>
          <p className="mt-4 max-w-xl text-[15px] font-semibold leading-7 text-ink/75 sm:text-base">
            Lima momen, masing-masing punya kejutannya sendiri. Pilih yang paling dekat dengan
            ceritamu, lalu bentuk halamannya sesukamu.
          </p>
        </div>

        <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {MOMENTS.map((moment, index) => {
            const theme = CARD_THEMES[moment.id];

            return (
              <div key={moment.id} className="relative">
                <Link
                  href={`/contoh/${moment.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border-4 border-ink bg-paper shadow-[6px_6px_0_#111] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[9px_9px_0_#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/25"
                >
                  <div
                    className={`flex h-44 items-center justify-center border-b-4 border-ink p-4 sm:h-48 ${theme.art}`}
                  >
                    <MomentArt
                      moment={moment.id}
                      className="h-[8.5rem] w-auto max-w-full transition-transform duration-300 group-hover:-rotate-2 sm:h-40"
                    />
                  </div>

                  <div className={`flex flex-1 flex-col p-5 sm:p-6 ${theme.footer}`}>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-[1.75rem] font-extrabold uppercase leading-none tracking-[-0.02em] text-ink">
                        {moment.label}
                      </h3>
                      <ArrowRightIcon className="mt-0.5 size-6 shrink-0 text-ink transition-transform duration-200 group-hover:translate-x-1" />
                    </div>

                    <p className="mt-2 text-sm font-semibold leading-6 text-ink/80">
                      {moment.tagline}
                    </p>

                    <div className="mt-auto pt-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-3 py-1.5 font-display text-[11px] font-extrabold uppercase tracking-[0.04em] text-ink shadow-[2px_2px_0_#111]">
                        <span aria-hidden="true">✦</span>
                        {moment.badge}
                      </span>
                    </div>
                  </div>
                </Link>

                {index === 0 ? (
                  <span className="sticker absolute -top-3 right-5 -rotate-3 bg-lime px-3 py-1.5 text-[10px]">
                    Mulai dari sini
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
