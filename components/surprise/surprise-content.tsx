import Link from "next/link";
import { Brand } from "@/components/brand";
import {
  MomentIcon,
  PauseIcon,
  PlayIcon,
  SparkleIcon,
} from "@/components/ui/icons";
import { getMoment } from "@/lib/moments";
import type { SurprisePage } from "@/lib/types";
import { MainBerduaPlayer } from "./main-berdua-player";

type SurpriseContentProps = {
  page: SurprisePage;
  musicOn: boolean;
  onToggleMusic: () => void;
};

export function SurpriseContent({ page, musicOn, onToggleMusic }: SurpriseContentProps) {
  const moment = getMoment(page.moment);

  return (
    <main className="animate-rise mx-auto w-full max-w-2xl px-5 pb-20 pt-6 sm:px-8">
      <header className="flex items-center justify-between gap-4">
        <Brand tone="cream" />
        {page.musicUrl ? (
          <button
            type="button"
            onClick={onToggleMusic}
            aria-pressed={musicOn}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-cream/80 transition-colors hover:bg-white/10"
          >
            {musicOn ? <PauseIcon className="size-3.5" /> : <PlayIcon className="size-3.5" />}
            {musicOn ? "Jeda musik" : "Putar musik"}
          </button>
        ) : null}
      </header>

      <article className="pt-16">
        <div className="text-center">
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
          </span>
          <h1 className="mt-6 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Untuk {page.recipientName}
          </h1>
          <p className="mt-3 text-sm text-cream/45">{moment.tagline}</p>
        </div>

        {page.story ? (
          <section className="mt-14" aria-label="Cerita">
            <p className="whitespace-pre-line text-[1.05rem] leading-[1.85] text-cream/80">
              {page.story}
            </p>
          </section>
        ) : null}

        <Ornament />

        {page.photoUrls.length > 0 ? (
          <section className="mt-14" aria-labelledby="galeri-kenangan">
            <h2
              id="galeri-kenangan"
              className="text-[11px] font-medium uppercase tracking-[0.24em] text-cream/40"
            >
              Kenangan
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {page.photoUrls.map((url, index) => (
                <figure
                  key={`${url}-${index}`}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- URL bertanda tangan dari Supabase Storage */}
                  <img
                    src={url}
                    alt={`Kenangan ${index + 1}`}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover"
                  />
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {page.games && page.games.length > 0 ? (
          <section className="mt-14" aria-label="Main Berdua">
            <MainBerduaPlayer
              games={page.games}
              photoUrls={page.photoUrls}
              recipientName={page.recipientName}
              senderName={page.senderName}
            />
          </section>
        ) : null}

        {page.photoUrls.length > 0 && page.letter ? <Ornament /> : null}

        {page.letter ? (
          <section className="mt-14" aria-labelledby="surat-untukmu">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 sm:p-9">
              <h2
                id="surat-untukmu"
                className="text-[11px] font-medium uppercase tracking-[0.24em] text-cream/40"
              >
                Surat untukmu
              </h2>
              <p className="mt-5 whitespace-pre-line font-display text-xl leading-[1.7] text-cream/90 sm:text-2xl">
                {page.letter}
              </p>
            </div>
          </section>
        ) : null}

        <footer className="mt-20 border-t border-white/10 pt-8 text-center">
          {page.isExample ? (
            <p className="text-sm leading-relaxed text-cream/50">
              Ini halaman contoh. Kejutan sungguhan bisa kamu buat dari beranda SuprizeGo.
            </p>
          ) : (
            <p className="text-sm text-cream/50">
              Satu kejutan dari{" "}
              <Link href="/" className="font-medium text-cream/80 underline decoration-white/25 underline-offset-4 hover:text-cream">
                SuprizeGo
              </Link>
            </p>
          )}
          {page.isExample ? (
            <Link
              href="/#momen"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-cream/80 transition-colors hover:bg-white/10"
            >
              <SparkleIcon className="size-3.5" style={{ color: "var(--accent)" }} />
              Kembali ke beranda
            </Link>
          ) : null}
        </footer>
      </article>
    </main>
  );
}

function Ornament() {
  return (
    <div aria-hidden="true" className="mt-14 flex items-center gap-3">
      <span className="h-px flex-1 bg-white/10" />
      <SparkleIcon className="size-3.5" style={{ color: "var(--accent)" }} />
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}
