"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRightIcon,
  HeartIcon,
  LockIcon,
  SparkleIcon,
  SpecialDayIcon,
} from "@/components/ui/icons";
import {
  formatSpecialDayDate,
  getSpecialDayOccurrences,
  type SpecialDayId,
  type SpecialDayOccurrence,
} from "@/lib/special-days";

type CardTheme = {
  background: string;
  text: string;
  surface: string;
  surfaceText: string;
  lockedSurface: string;
  lockedText: string;
  lockedBorder: string;
};

const LIGHT_CARD: Omit<CardTheme, "background"> = {
  text: "text-ink",
  surface: "bg-paper",
  surfaceText: "text-ink",
  lockedSurface: "bg-sand",
  lockedText: "text-ink",
  lockedBorder: "border-ink",
};

const DARK_CARD: Omit<CardTheme, "background"> = {
  text: "text-cream",
  surface: "bg-cream",
  surfaceText: "text-ink",
  lockedSurface: "bg-plum-deep",
  lockedText: "text-cream",
  lockedBorder: "border-cream",
};

const CARD_THEMES: Record<SpecialDayId, CardTheme> = {
  "hari-guru": { ...LIGHT_CARD, background: "bg-sun" },
  valentine: { ...LIGHT_CARD, background: "bg-candy" },
  imlek: { ...LIGHT_CARD, background: "bg-tangerine" },
  lebaran: { ...DARK_CARD, background: "bg-plum" },
  halloween: { ...DARK_CARD, background: "bg-ink" },
  natal: { ...LIGHT_CARD, background: "bg-tangerine" },
  "tahun-baru": { ...DARK_CARD, background: "bg-plum" },
  "hari-ayah": { ...LIGHT_CARD, background: "bg-sun" },
  "hari-ibu": { ...LIGHT_CARD, background: "bg-candy" },
  "hari-anak": { ...LIGHT_CARD, background: "bg-lime" },
  kartini: { ...LIGHT_CARD, background: "bg-candy" },
  hardiknas: { ...LIGHT_CARD, background: "bg-sun" },
  kemerdekaan: { ...LIGHT_CARD, background: "bg-tangerine" },
  batik: { ...LIGHT_CARD, background: "bg-sun" },
  "sumpah-pemuda": { ...LIGHT_CARD, background: "bg-lime" },
  pahlawan: { ...DARK_CARD, background: "bg-plum" },
  persahabatan: { ...LIGHT_CARD, background: "bg-candy" },
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
      <div className="mx-auto w-full max-w-6xl px-4 pb-36 pt-20 md:pb-24 md:pt-24">
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
                className={`flex min-h-[300px] flex-col rounded-[1.25rem] border-4 border-ink p-5 shadow-[8px_8px_0_#111] ${theme.background} ${theme.text}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl border-[3px] border-ink shadow-[3px_3px_0_#111] ${theme.surface} ${theme.surfaceText}`}
                    aria-hidden="true"
                  >
                    <SpecialDayIcon icon={day.ikon} className="size-5" />
                  </span>
                  <span
                    className={`inline-flex max-w-[12.5rem] min-h-8 flex-wrap items-center justify-end gap-x-1.5 gap-y-1 rounded-full border-2 border-ink px-2.5 py-1 text-left text-[10px] font-bold uppercase leading-4 tracking-[0.03em] ${theme.surface} ${theme.surfaceText}`}
                  >
                    {locked ? <LockIcon className="size-3 shrink-0" /> : <SparkleIcon className="size-3 shrink-0" />}
                    <span>{locked ? dateLabel : statusLabel}</span>
                    {locked ? (
                      <span className="basis-full pl-[18px]">dibuka {openLabel}</span>
                    ) : (
                      <span>{dateLabel}</span>
                    )}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-2xl uppercase leading-[30px]">{day.nama}</h3>
                <Link
                  href={`/contoh/${day.id}`}
                  className={`mt-1 inline-flex w-fit items-center gap-1 text-xs font-bold underline decoration-2 underline-offset-4 ${theme.text}`}
                >
                  Contoh ucapannya
                  <ArrowRightIcon className="size-3.5" />
                </Link>

                <div className="mt-4 space-y-2">
                  {locked ? (
                    <>
                      <div
                        aria-disabled="true"
                        className={`flex min-h-[58px] items-center gap-3 rounded-2xl border-[3px] border-dashed px-3 py-2 ${theme.lockedBorder} ${theme.lockedSurface} ${theme.lockedText}`}
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
                        className={`flex min-h-[58px] items-center gap-3 rounded-2xl border-[3px] border-dashed px-3 py-2 ${theme.lockedBorder} ${theme.lockedSurface} ${theme.lockedText}`}
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
                        className={`flex min-h-[58px] items-center gap-3 rounded-2xl border-[3px] border-ink px-3 py-2 transition-transform hover:-translate-y-0.5 ${theme.surface} ${theme.surfaceText}`}
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
                        className={`flex min-h-[58px] items-center gap-3 rounded-2xl border-[3px] border-ink px-3 py-2 transition-transform hover:-translate-y-0.5 ${theme.surface} ${theme.surfaceText}`}
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
