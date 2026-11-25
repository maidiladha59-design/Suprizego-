import { Brand } from "@/components/brand";
import { ArrowRightIcon, MomentIcon, SparkleIcon } from "@/components/ui/icons";
import { getMoment } from "@/lib/moments";
import type { SurprisePage } from "@/lib/types";

type SurpriseCoverProps = {
  page: SurprisePage;
  onOpen: () => void;
};

export function SurpriseCover({ page, onOpen }: SurpriseCoverProps) {
  const moment = getMoment(page.moment);

  return (
    <main className="flex min-h-svh flex-col px-6 py-8 sm:px-8">
      <div className="flex justify-center">
        <Brand tone="cream" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center py-14 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
        >
          <div className="size-[20rem] rounded-full border border-white/5 sm:size-[30rem]" />
          <div className="absolute size-[13rem] rounded-full border border-white/10 sm:size-[19rem]" />
          <div
            className="absolute size-[6rem] rounded-full opacity-20 blur-2xl"
            style={{ backgroundColor: moment.accent }}
          />
        </div>

        <div className="relative z-10 animate-rise">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{
              borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)",
              color: "var(--accent)",
              backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)",
            }}
          >
            <MomentIcon moment={page.moment} className="size-3.5" />
            {moment.label}
            {page.isExample ? <span className="text-cream/45">· Contoh</span> : null}
          </span>

          <p className="mt-10 text-[11px] uppercase tracking-[0.34em] text-cream/45">
            Sebuah kejutan untuk
          </p>
          <h1 className="mt-5 font-display text-6xl leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
            {page.recipientName}
          </h1>

          {page.senderName ? (
            <p className="mt-6 text-sm text-cream/55">Dari {page.senderName}</p>
          ) : null}

          <div className="mx-auto mt-10 flex max-w-xs items-center gap-3 text-cream/25">
            <span className="h-px flex-1 bg-white/10" />
            <SparkleIcon className="size-3.5" style={{ color: "var(--accent)" }} />
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={onOpen}
            className="group mt-10 inline-flex items-center gap-2.5 rounded-full bg-cream px-8 py-4 text-sm font-semibold text-plum-deep shadow-[0_20px_50px_-20px_rgba(251,246,238,0.4)] transition-colors hover:bg-white"
          >
            <SparkleIcon className="size-4 text-rose" />
            Buka kejutan
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          {page.musicUrl ? (
            <p className="mt-5 text-xs text-cream/40">Ada lagu untukmu — nyalakan suara.</p>
          ) : null}
        </div>
      </div>

      <p className="text-center text-[11px] tracking-wide text-cream/30">
        Halaman privat · hanya bisa dibuka lewat link ini
      </p>
    </main>
  );
}
