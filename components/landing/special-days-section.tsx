"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRightIcon,
  GraduationCapIcon,
  HeartIcon,
  LockIcon,
  SparkleIcon,
} from "@/components/ui/icons";

type SpecialDayId = "hari-guru" | "hari-ibu" | "natal";
type CardTheme = "sun" | "candy" | "tangerine";

type SpecialDay = {
  id: SpecialDayId;
  name: string;
  day: number;
  month: number;
  description: string;
  theme: CardTheme;
  previews: readonly [string, string];
};

const SPECIAL_DAYS: readonly SpecialDay[] = [
  {
    id: "hari-guru",
    name: "Hari Guru",
    day: 25,
    month: 11,
    description: "Terima kasih untuk yang sabar mengajar dan menemani bertumbuh.",
    theme: "sun",
    previews: ["Ucapan + foto", "Cerita murid"],
  },
  {
    id: "hari-ibu",
    name: "Hari Ibu",
    day: 22,
    month: 12,
    description: "Rayakan perempuan yang selalu ada, bahkan saat tak diminta.",
    theme: "candy",
    previews: ["Ucapan + foto", "Doa & cerita"],
  },
  {
    id: "natal",
    name: "Natal",
    day: 25,
    month: 12,
    description: "Kirim kehangatan untuk keluarga dan orang tersayang.",
    theme: "tangerine",
    previews: ["Ucapan hangat", "Foto keluarga"],
  },
];

const CARD_BG: Record<CardTheme, string> = {
  sun: "bg-sun",
  candy: "bg-candy",
  tangerine: "bg-tangerine",
};

const UNLOCK_WINDOW_DAYS = 21;
const DAY_MS = 86_400_000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function nextOccurrence(day: SpecialDay, now: Date) {
  const today = startOfDay(now);
  const thisYear = new Date(today.getFullYear(), day.month - 1, day.day);

  return thisYear.getTime() < today.getTime()
    ? new Date(today.getFullYear() + 1, day.month - 1, day.day)
    : thisYear;
}

function daysUntil(target: Date, now: Date) {
  return Math.round((target.getTime() - startOfDay(now).getTime()) / DAY_MS);
}

function formatShort(date: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" })
    .format(date)
    .replace(/\./g, "");
}

function countdownLabel(days: number | null) {
  if (days === null) return "—";
  if (days === 0) return "Hari ini!";
  if (days === 1) return "Besok!";
  return `${days} hari lagi`;
}

function DayIcon({ id }: { id: SpecialDayId }) {
  if (id === "hari-guru") return <GraduationCapIcon className="size-5" />;
  if (id === "hari-ibu") return <HeartIcon className="size-5" />;
  return <SparkleIcon className="size-5" />;
}

export function SpecialDaysSection() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const cards = SPECIAL_DAYS.map((day) => {
    const target = now ? nextOccurrence(day, now) : null;
    const days = target && now ? daysUntil(target, now) : null;
    const unlock = target ? new Date(target.getTime() - UNLOCK_WINDOW_DAYS * DAY_MS) : null;
    const locked = days === null ? null : days > UNLOCK_WINDOW_DAYS;

    return { day, target, days, unlock, locked };
  }).sort((a, b) => (a.days ?? 0) - (b.days ?? 0));

  return (
    <section
      id="hari-spesial"
      aria-labelledby="hari-spesial-title"
      className="border-t-4 border-ink bg-paper bg-grid-paper"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          <h2
            id="hari-spesial-title"
            className="font-display text-[2.15rem] font-extrabold uppercase leading-[0.95] tracking-[-0.035em] text-ink sm:text-5xl"
          >
            Hari spesial
          </h2>
          <p className="mt-4 max-w-xl text-[15px] font-semibold leading-7 text-ink/75 sm:text-base">
            Hitung mundurnya berjalan otomatis. Kartu hari spesial terbuka tiga minggu sebelum
            harinya.
          </p>
        </div>

        <div className="mt-10 grid gap-7 lg:grid-cols-3">
          {cards.map(({ day, target, days, unlock, locked }) => {
            const status =
              days === null || !target || !unlock
                ? "Cek tanggal"
                : days === 0
                  ? "Hari ini!"
                  : locked
                    ? `${formatShort(target)} · dibuka ${formatShort(unlock)}`
                    : "Siap dibuat";

            return (
              <article
                key={day.id}
                className={`flex h-full flex-col rounded-2xl border-4 border-ink p-5 shadow-[6px_6px_0_#111] sm:p-6 ${CARD_BG[day.theme]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border-[3px] border-ink bg-paper shadow-[3px_3px_0_#111]">
                    <DayIcon id={day.id} />
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-paper/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.03em] shadow-[2px_2px_0_#111]">
                    {locked ? <LockIcon className="size-3" /> : null}
                    {status}
                  </span>
                </div>

                <h3 className="mt-5 font-display text-[1.75rem] font-extrabold uppercase leading-none tracking-[-0.02em] text-ink">
                  {day.name}
                </h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-ink/75">
                  {day.description}
                </p>

                <div className="mt-4 rounded-xl border-2 border-dashed border-ink/40 bg-paper/75 px-3 py-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/55">
                    Hitung mundur
                  </p>
                  <p className="mt-0.5 font-display text-2xl font-extrabold uppercase leading-none text-ink">
                    {countdownLabel(days)}
                  </p>
                </div>

                <ul className={`mt-4 space-y-2 ${locked ? "opacity-60" : ""}`}>
                  {day.previews.map((preview) => (
                    <li
                      key={preview}
                      className="flex items-center gap-2 rounded-lg border-2 border-ink bg-paper px-3 py-2 text-[11px] font-bold text-ink"
                    >
                      <SparkleIcon className="size-3 shrink-0" />
                      {preview}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-5">
                  {locked === null || !unlock ? (
                    <p className="rounded-xl border-2 border-dashed border-ink/35 px-3 py-2.5 text-[11px] font-semibold leading-5 text-ink/65">
                      Terbuka tiga minggu sebelum hari-H.
                    </p>
                  ) : locked ? (
                    <p className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink/40 bg-paper/60 px-3 py-2.5 font-display text-[10px] font-extrabold uppercase tracking-[0.04em] text-ink/65">
                      <LockIcon className="size-3.5" />
                      Terkunci sampai {formatShort(unlock)}
                    </p>
                  ) : (
                    <Link
                      href="/buat"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-[3px] border-ink bg-ink px-3 py-2.5 font-display text-[11px] font-extrabold uppercase tracking-[0.04em] text-paper shadow-[4px_4px_0_#111] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                    >
                      Siapkan halaman
                      <ArrowRightIcon className="size-3.5" />
                    </Link>
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
