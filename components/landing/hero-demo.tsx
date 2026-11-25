"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  EnvelopeIcon,
  HeartIcon,
  SparkleIcon,
} from "@/components/ui/icons";

type Stage = 0 | 1 | 2 | 3;

const EVENTS = [
  { icon: EnvelopeIcon, text: "Nadia membuka kejutannya" },
  { icon: SparkleIcon, text: "Nadia membaca ceritamu" },
  { icon: HeartIcon, text: "Nadia sampai di surat terakhir" },
] as const;

export function HeroDemo() {
  const [stage, setStage] = useState<Stage>(0);

  useEffect(() => {
    if (stage === 0 || stage === 3) {
      return;
    }

    const timer = window.setTimeout(() => {
      setStage((current) => (current < 3 ? ((current + 1) as Stage) : current));
    }, 900);

    return () => window.clearTimeout(timer);
  }, [stage]);

  return (
    <>
      <div className="animate-rise-late relative mx-auto w-full max-w-[21.5rem] md:col-start-2 md:row-span-2 md:row-start-1 md:self-center">
        <p className="mb-4 flex justify-center">
          <span className="inline-flex -rotate-1 items-center rounded-full border-[3px] border-ink bg-paper px-3 py-1.5 text-center font-display text-[10px] font-extrabold uppercase leading-tight tracking-[0.06em] text-ink shadow-[3px_3px_0_#111]">
            Ini demo — coba langsung, gratis
          </span>
        </p>

        <div className="relative h-[40rem] rounded-[2.6rem] border-[6px] border-ink bg-ink shadow-[10px_10px_0_#111]">
          <div className="flex h-full flex-col overflow-hidden rounded-[2.02rem] bg-candy p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-md border-2 border-ink bg-paper px-1.5 py-0.5 font-display text-[9px] font-extrabold uppercase tracking-[0.12em] text-ink">
                Demo
              </span>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {[1, 2, 3].map((step) => (
                  <span
                    key={step}
                    className={`size-2.5 rounded-full border-2 border-ink ${
                      stage >= step ? "bg-ink" : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>

            {stage === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center pb-1 text-center">
                <span className="sticker -rotate-2 bg-tangerine px-3 py-1.5 text-[11px]">
                  Kejutan kecil buat…
                </span>
                <p className="mt-5 font-display text-[3.3rem] font-extrabold uppercase leading-none tracking-[-0.04em] text-ink">
                  Nadia
                </p>
                <button
                  type="button"
                  onClick={() => setStage(1)}
                  aria-label="Buka amplop untuk memulai demo"
                  className="group mt-8 w-full max-w-[16rem] rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/30"
                >
                  <span className="block animate-float-soft transition-transform duration-200 group-hover:-rotate-2 group-hover:scale-[1.03]">
                    <EnvelopeArt />
                  </span>
                </button>
                <p className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink">
                  Tekan untuk buka
                  <ArrowRightIcon className="size-3 rotate-90" />
                </p>
                <p className="mt-auto pt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/60">
                  Dari Raka · Pengakuan
                </p>
              </div>
            ) : (
              <div className="mt-4 flex flex-1 flex-col overflow-hidden">
                <div className="text-center">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink/60">
                    Kejutan dari Raka
                  </p>
                  <p className="mt-1 font-display text-[1.8rem] font-extrabold uppercase leading-none tracking-[-0.03em] text-ink">
                    Hai, Nadia!
                  </p>
                </div>

                <div className="no-scrollbar mt-3 flex flex-1 flex-col gap-2.5 overflow-y-auto pr-0.5">
                  <DemoCard label="Pesan pertama">
                    <p className="text-[12px] leading-5">
                      Raka menulis sesuatu yang sudah lama dia simpan. Baca pelan-pelan, ya.
                    </p>
                  </DemoCard>

                  {stage >= 2 ? (
                    <DemoCard label="Pengakuan">
                      <p className="text-[12px] leading-5">
                        “Dua tahun aku menyimpan ini rapat-rapat. Aku tidak sedang mencari panggung —
                        aku hanya ingin akhirnya jujur.”
                      </p>
                    </DemoCard>
                  ) : null}

                  {stage >= 3 ? (
                    <DemoCard label="Satu lagi" tone="lime">
                      <p className="text-[12px] leading-5">
                        Masih ada surat kecil di bagian akhir. Kalau sudah siap, buka versi
                        lengkapnya.
                      </p>
                      <Link
                        href="/contoh/pengakuan"
                        className="mt-2 inline-flex items-center gap-1 font-display text-[11px] font-extrabold uppercase underline decoration-2 underline-offset-2"
                      >
                        Buka halaman penuh
                        <ArrowRightIcon className="size-3.5" />
                      </Link>
                    </DemoCard>
                  ) : null}
                </div>

                <div className="mt-2 flex items-center justify-between border-t-2 border-ink/20 pt-2 text-[9px] font-bold uppercase tracking-[0.1em] text-ink/60">
                  <span>Untuk Nadia</span>
                  <span>{stage} / 3 kebuka</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex min-h-10 items-center justify-center">
          {stage === 0 ? (
            <span className="rounded-full border-2 border-ink/30 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink/65">
              Simulasi — bukan halaman asli
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setStage(0)}
              className="inline-flex items-center gap-1.5 rounded-xl border-[3px] border-ink bg-paper px-3.5 py-2 font-display text-[11px] font-extrabold uppercase text-ink shadow-[3px_3px_0_#111] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <span aria-hidden="true">↺</span>
              Ulangi demo
            </button>
          )}
        </div>
      </div>

      <div className="animate-rise w-full max-w-md justify-self-start self-start rounded-[1.35rem] border-4 border-ink bg-white p-4 shadow-[8px_8px_0_#111] md:col-start-1 md:row-start-2 md:rotate-[0.6deg]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-base font-extrabold uppercase leading-tight text-ink sm:text-lg">
              Yang Raka terima
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.13em] text-ink/50">
              Simulasi notifikasi pengirim
            </p>
          </div>
          <span className="sticker shrink-0 bg-lime px-2 py-1 text-[9px] shadow-[2px_2px_0_#111]">
            Pengirim
          </span>
        </div>

        <div
          aria-live="polite"
          className="mt-3 min-h-[112px] rounded-xl border-2 border-dashed border-ink/35 px-3 py-3"
        >
          {stage === 0 ? (
            <p className="text-[12px] font-semibold leading-5 text-ink/65">
              Buka amplop di layar. Kabar dari Nadia akan muncul di sini, satu per satu.
            </p>
          ) : (
            <ol className="space-y-2">
              {EVENTS.slice(0, stage).map(({ icon: Icon, text }) => (
                <li key={text} className="animate-pop-in flex items-center gap-2">
                  <span className="grid size-6 shrink-0 place-items-center rounded-md border-2 border-ink bg-lime text-ink">
                    <Icon className="size-3" />
                  </span>
                  <span className="text-[11px] font-bold leading-4 text-ink">{text}</span>
                  <span className="ml-auto shrink-0 text-[8px] font-semibold uppercase tracking-[0.1em] text-ink/45">
                    Baru
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </>
  );
}

function DemoCard({
  label,
  tone = "paper",
  children,
}: {
  label: string;
  tone?: "paper" | "lime";
  children: ReactNode;
}) {
  return (
    <div
      className={`animate-pop-in rounded-xl border-[3px] border-ink p-3 shadow-[4px_4px_0_#111] ${
        tone === "lime" ? "bg-lime" : "bg-paper"
      }`}
    >
      <p className="font-display text-[9px] font-extrabold uppercase tracking-[0.14em] text-ink/60">
        {label}
      </p>
      <div className="mt-1.5 text-ink">{children}</div>
    </div>
  );
}

function EnvelopeArt() {
  return (
    <svg
      viewBox="0 0 280 180"
      aria-hidden="true"
      className="h-auto w-full drop-shadow-[6px_6px_0_#111]"
    >
      <rect x="16" y="36" width="248" height="132" rx="12" fill="#FF6B3A" stroke="#111" strokeWidth="5" />
      <path
        d="M20 46 140 126 260 46"
        fill="#B6F22E"
        stroke="#111"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M20 161 105 103M260 161 175 103" stroke="#111" strokeWidth="4" strokeLinecap="round" />
      <circle cx="140" cy="126" r="24" fill="#FFF6E4" stroke="#111" strokeWidth="4" />
      <g transform="translate(128 114)" fill="#111">
        <path d="M12 2.2l2 5.9a2.4 2.4 0 0 0 1.5 1.5l5.9 2-5.9 2a2.4 2.4 0 0 0-1.5 1.5l-2 5.9-2-5.9a2.4 2.4 0 0 0-1.5-1.5l-5.9-2 5.9-2a2.4 2.4 0 0 0 1.5-1.5l2-5.9z" />
      </g>
    </svg>
  );
}
