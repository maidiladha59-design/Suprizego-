"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { DemoPhotoScreen } from "./demo-photo-screen";
import {
  ArrowRightIcon,
  EnvelopeIcon,
  HeartIcon,
  MusicIcon,
  PauseIcon,
  SparkleIcon,
} from "@/components/ui/icons";

type Stage = 0 | 1 | 2 | 3;

const EVENTS = [
  { icon: EnvelopeIcon, text: "Sekar membuka potongan hari" },
  { icon: SparkleIcon, text: "Sekar selesai membaca cerita" },
  { icon: HeartIcon, text: "Sekar memilih jawaban terakhir" },
] as const;

export function HeroDemo() {
  const [stage, setStage] = useState<Stage>(0);
  const [musicOn, setMusicOn] = useState(false);
  const [musicNotice, setMusicNotice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progress = stage === 0 ? 1 : stage + 1;

  useEffect(() => {
    if (stage === 0 || stage === 3) return;

    const timer = window.setTimeout(() => {
      setStage((current) => (current < 3 ? ((current + 1) as Stage) : current));
    }, 900);

    return () => window.clearTimeout(timer);
  }, [stage]);

  useEffect(
    () => () => {
      audioRef.current?.pause();
    },
    [],
  );

  async function playMusic() {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      setMusicOn(true);
      setMusicNotice(false);
    } catch {
      setMusicOn(false);
      setMusicNotice(true);
    }
  }

  function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void playMusic();
    else {
      audio.pause();
      setMusicOn(false);
    }
  }

  function restart() {
    setStage(0);
    setMusicOn(false);
    setMusicNotice(false);
    audioRef.current?.pause();
  }

  return (
    <>
      <div className="animate-rise-late relative mx-auto w-full max-w-[340px] justify-self-center pt-11 md:col-start-2 md:row-span-2 md:row-start-1 md:self-center md:pt-0">
        <div className="mb-3 text-center">
          <span
            className="sticker rotate-2 bg-white px-[11.2px] py-[3.2px] text-xs"
            style={{ display: "inline-block", fontWeight: 400, letterSpacing: "normal", lineHeight: "16px" }}
          >
            Ini beneran bisa dimainin 👇
          </span>
        </div>

        <div
          data-demo-phone
          className="relative h-[640px] w-full rounded-[38.4px] border-[6px] border-ink bg-ink shadow-[10px_10px_0_0_#111]"
        >
          <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-candy">
            <audio
              ref={audioRef}
              src="/audio/demo-senja.wav"
              loop
              preload="none"
              onPlay={() => setMusicOn(true)}
              onPause={() => setMusicOn(false)}
            />

            <div className="flex h-[58px] shrink-0 items-center justify-between gap-3 px-5 pr-4">
              <div
                className="flex items-center gap-1.5"
                aria-label={`Langkah demo ${progress} dari 8`}
              >
                {Array.from({ length: 8 }, (_, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                    className={`size-3 rounded-full border-2 border-ink transition-colors ${
                      index < progress ? "bg-ink" : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={toggleMusic}
                aria-pressed={musicOn}
                aria-label={musicOn ? "Matikan musik demo" : "Nyalakan musik demo"}
                className="mt-[12.8px] inline-flex h-[30.5px] shrink-0 items-center gap-1 rounded-xl border-[3px] border-ink bg-paper px-2.5 font-display text-[11px] uppercase leading-[1.5] text-ink shadow-[3px_3px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {musicOn ? <PauseIcon className="size-3" /> : <MusicIcon className="size-3" />}
                {musicOn ? "Nyala" : "Mati"}
              </button>
            </div>

            <div key={stage} className="animate-pop-in flex min-h-0 flex-1 flex-col">
              {stage === 0 ? (
                <DemoPhotoScreen onContinue={() => setStage(1)} />
              ) : (
                <div className="mt-4 flex flex-1 flex-col overflow-hidden px-4 pb-4">
                  <div className="text-center">
                    <p className="text-[12px] font-bold uppercase leading-4 tracking-[0.02em] text-ink/60">
                      Cerita dari Bima
                    </p>
                    <p className="mt-1 font-display text-[1.8rem] font-extrabold uppercase leading-none tracking-[-0.03em] text-ink">
                      Hai, Sekar!
                    </p>
                  </div>

                  <div className="no-scrollbar mt-3 flex flex-1 flex-col gap-2.5 overflow-y-auto pr-0.5">
                    <DemoCard label="Pesan pertama">
                      <p className="text-[12px] leading-5">
                        Bima menyimpan tiga potongan hari yang dia ingin kamu lihat lagi. Baca
                        pelan-pelan, ya.
                      </p>
                    </DemoCard>

                    {stage >= 2 ? (
                      <DemoCard label="Pengakuan">
                        <p className="text-[12px] leading-5">
                          “Ada hal-hal kecil yang terasa biasa waktu itu. Ternyata jadi bagian
                          yang paling aku rindukan.”
                        </p>
                      </DemoCard>
                    ) : null}

                    {stage >= 3 ? (
                      <DemoCard label="Satu lagi" tone="lime">
                        <p className="text-[12px] leading-5">
                          Masih ada pertanyaan kecil di bagian akhir. Kalau sudah siap, buka
                          versi lengkapnya.
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
                    <span>Untuk Sekar</span>
                    <span>{stage} / 3 kebuka</span>
                  </div>
                </div>
              )}
            </div>
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
              onClick={restart}
              className="inline-flex items-center gap-1.5 rounded-xl border-[3px] border-ink bg-paper px-3.5 py-2 font-display text-[11px] font-extrabold uppercase text-ink shadow-[3px_3px_0_#111] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <span aria-hidden="true">↺</span>
              Ulangi demo
            </button>
          )}
        </div>

        {musicNotice ? (
          <p role="status" className="mt-2 text-center text-[10px] font-bold leading-4">
            Musik belum bisa diputar di browser ini.
          </p>
        ) : null}
      </div>

      <div className="animate-rise w-full max-w-md justify-self-start self-start rounded-[1.35rem] border-4 border-ink bg-white p-4 shadow-[8px_8px_0_#111] md:col-start-1 md:row-start-2 md:rotate-[0.6deg]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-base font-extrabold uppercase leading-tight text-ink sm:text-lg">
              Yang Bima terima
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
              Buka foto di layar. Kabar dari Sekar akan muncul di sini, satu per satu.
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
