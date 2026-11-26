"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRightIcon, HeartIcon, LockIcon, SparkleIcon } from "@/components/ui/icons";
import {
  formatSpecialDayDate,
  getSpecialDayOccurrences,
  type SpecialDayId,
  type SpecialDayOccurrence,
} from "@/lib/special-days";

type CardTheme = {
  background: string;
  text: string;
  muted: string;
  surface: string;
};

const CARD_THEMES: Record<SpecialDayId, CardTheme> = {
  "hari-guru": { background: "bg-sun", text: "text-ink", muted: "text-ink/70", surface: "bg-paper" },
  valentine: { background: "bg-candy", text: "text-ink", muted: "text-ink/70", surface: "bg-paper/90" },
  imlek: { background: "bg-tangerine", text: "text-ink", muted: "text-ink/70", surface: "bg-paper/90" },
  lebaran: { background: "bg-plum", text: "text-cream", muted: "text-cream/70", surface: "bg-cream/95" },
  halloween: { background: "bg-ink", text: "text-cream", muted: "text-cream/70", surface: "bg-cream/95" },
  natal: { background: "bg-tangerine", text: "text-ink", muted: "text-ink/70", surface: "bg-paper/90" },
  "tahun-baru": { background: "bg-plum", text: "text-cream", muted: "text-cream/70", surface: "bg-cream/95" },
  "hari-ayah": { background: "bg-sun", text: "text-ink", muted: "text-ink/70", surface: "bg-paper" },
  "hari-ibu": { background: "bg-candy", text: "text-ink", muted: "text-ink/70", surface: "bg-paper/90" },
  "hari-anak": { background: "bg-lime", text: "text-ink", muted: "text-ink/70", surface: "bg-paper" },
  kartini: { background: "bg-candy", text: "text-ink", muted: "text-ink/70", surface: "bg-paper/90" },
  hardiknas: { background: "bg-sun", text: "text-ink", muted: "text-ink/70", surface: "bg-paper" },
  kemerdekaan: { background: "bg-tangerine", text: "text-ink", muted: "text-ink/70", surface: "bg-paper/90" },
  batik: { background: "bg-sun", text: "text-ink", muted: "text-ink/70", surface: "bg-paper" },
  "sumpah-pemuda": { background: "bg-lime", text: "text-ink", muted: "text-ink/70", surface: "bg-paper" },
  pahlawan: { background: "bg-plum", text: "text-cream", muted: "text-cream/70", surface: "bg-cream/95" },
  persahabatan: { background: "bg-candy", text: "text-ink", muted: "text-ink/70", surface: "bg-paper/90" },
};

type SpecialDaysSectionProps = {
  initialOccurrences: readonly SpecialDayOccurrence[];
};

export function SpecialDaysSection({ initialOccurrences }: SpecialDaysSectionProps) {
  const [occurrences, setOccurrences] = useState(initialOccurrences);

  useEffect(() => {
    const tick = () => setOccurrences(getSpecialDayOccurrences());
    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const cards = [...occurrences]
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 6);

  return (
    <section
      id="hari-spesial"
      aria-labelledby="hari-spesial-title"
      className="border-t-4 border-ink bg-paper bg-grid-paper"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-20 md:py-24">
        <div className="max-w-2xl">
          <h2
            id="hari-spesial-title"
            className="font-display text-4xl uppercase leading-10 text-ink sm:text-5xl sm:leading-none"
          >
            Hari spesial
          </h2>
          <p className="mt-3 max-w-xl text-base font-bold leading-6 text-ink">
            Rayakan hari nasional dan perayaan Indonesia. Kirim ucapan atau permintaan maaf
            lewat satu halaman.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {cards.map((occurrence) => {
            const { day } = occurrence;
            const theme = CARD_THEMES[day.id];
            const locked = occurrence.status === "terkunci";
            const dateLabel = formatSpecialDayDate(occurrence.tanggalHariH);
            const openLabel = formatSpecialDayDate(occurrence.tanggalBuka);
            const statusLabel =
              occurrence.daysUntil === 0
                ? "hari ini"
                : occurrence.daysUntil < 0
                  ? "baru lewat"
                  : "musim";

            return (
              <article
                key={day.id}
                className={`flex min-h-[278px] flex-col rounded-[1.25rem] border-4 border-ink p-5 shadow-[8px_8px_0_#111] ${theme.background} ${theme.text}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl border-[3px] border-ink text-xl shadow-[3px_3px_0_#111] ${theme.surface} ${theme.text}`}
                    aria-hidden="true"
                  >
                    {day.emoji}
                  </span>
                  <span
                    className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border-2 border-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.03em] ${theme.surface} ${theme.text}`}
                  >
                    {locked ? <LockIcon className="size-3" /> : <span aria-hidden="true">●</span>}
                    {locked ? `${dateLabel} · dibuka ${openLabel}` : `${statusLabel} · ${dateLabel}`}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-2xl uppercase leading-[30px]">{day.nama}</h3>
                <Link
                  href="/contoh/anniversary"
                  className={`mt-1 inline-flex w-fit items-center gap-1 text-xs font-bold underline decoration-2 underline-offset-4 ${theme.muted}`}
                >
                  Contoh ucapannya
                  <ArrowRightIcon className="size-3.5" />
                </Link>

                <div className="mt-4 space-y-2">
                  {locked ? (
                    <>
                      <div
                        aria-disabled="true"
                        className={`flex min-h-[58px] items-center gap-3 rounded-2xl border-[3px] border-dashed border-ink/50 px-3 py-2 opacity-60 ${theme.surface} ${theme.text}`}
                      >
                        <SparkleIcon className="size-5 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold">Rayakan</span>
                          <span className="block text-xs">Ucapan untuk {day.nama}</span>
                        </span>
                        <LockIcon className="size-4 shrink-0" />
                      </div>
                      <div
                        aria-disabled="true"
                        className={`flex min-h-[58px] items-center gap-3 rounded-2xl border-[3px] border-dashed border-ink/50 px-3 py-2 opacity-60 ${theme.surface} ${theme.text}`}
                      >
                        <HeartIcon className="size-5 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold">Minta maaf</span>
                          <span className="block text-xs">Sampaikan lewat satu halaman</span>
                        </span>
                        <LockIcon className="size-4 shrink-0" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/buat"
                        className={`flex min-h-[58px] items-center gap-3 rounded-2xl border-[3px] border-ink px-3 py-2 transition-transform hover:-translate-y-0.5 ${theme.surface} ${theme.text}`}
                      >
                        <SparkleIcon className="size-5 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold">Rayakan</span>
                          <span className="block text-xs">Ucapan untuk {day.nama}</span>
                        </span>
                        <ArrowRightIcon className="size-4 shrink-0" />
                      </Link>
                      <Link
                        href="/buat/minta-maaf"
                        className={`flex min-h-[58px] items-center gap-3 rounded-2xl border-[3px] border-ink px-3 py-2 transition-transform hover:-translate-y-0.5 ${theme.surface} ${theme.text}`}
                      >
                        <HeartIcon className="size-5 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold">Minta maaf</span>
                          <span className="block text-xs">Sampaikan lewat satu halaman</span>
                        </span>
                        <ArrowRightIcon className="size-4 shrink-0" />
                      </Link>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
