"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { PhotoReader } from "@/components/editor/photo-reader";
import { EnvelopeArt } from "@/components/ui/envelope-art";
import {
  ArrowRightIcon,
  HeartIcon,
  MomentIcon,
  MusicIcon,
  PauseIcon,
  PlayIcon,
  SparkleIcon,
} from "@/components/ui/icons";
import { getMoment } from "@/lib/moments";
import {
  getReaderDateLabel,
  getReaderQuestion,
  getReaderSteps,
  getReaderTheme,
  splitIntoBubbles,
} from "@/lib/reader";
import type { SurprisePage } from "@/lib/types";
import { MainBerduaPlayer } from "./main-berdua-player";
import { ReaderContact } from "./reader-contact";

type SurpriseReaderProps = {
  page: SurprisePage;
  contactEmail?: string;
  embedded?: boolean;
};

const actionClass =
  "inline-flex h-[59px] w-full max-w-[230px] items-center justify-center gap-2 rounded-2xl border-4 border-ink bg-ink px-4 font-display text-[13px] uppercase leading-5 tracking-[0.01em] text-paper shadow-[6px_6px_0_0_#B6F22E] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-lime active:translate-x-1 active:translate-y-1 active:shadow-none";

export function SurpriseReader({ page, contactEmail, embedded = false }: SurpriseReaderProps) {
  const steps = useMemo(() => getReaderSteps(page), [page]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const [musicNotice, setMusicNotice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const moment = getMoment(page.moment);
  const theme = getReaderTheme(page);
  const activeStep = steps[Math.min(activeIndex, steps.length - 1)] ?? steps[0]!;
  const recipient = page.recipientName.trim() || "Kamu";
  const sender = page.senderName?.trim() || "Pembuat halaman";

  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

  function goNext() {
    setActiveIndex((current) => {
      const bounded = Math.min(current, steps.length - 1);
      return Math.min(bounded + 1, steps.length - 1);
    });
  }

  function restart() {
    setActiveIndex(0);
    setMusicOn(false);
    audioRef.current?.pause();
  }

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

  function openEnvelope() {
    goNext();
    if (page.musicUrl) void playMusic();
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

  const screen = (
    <div
      className="relative h-[640px] w-[340px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[38px] border-[6px] border-ink bg-ink shadow-[10px_10px_0_0_#111]"
      style={{ "--reader-screen": theme.screen } as CSSProperties}
    >
      <div
        data-reader-screen
        data-reader-step={activeStep.id}
        className="flex h-full flex-col overflow-hidden rounded-[28px] bg-[var(--reader-screen)] text-ink"
        style={{ backgroundColor: theme.screen, color: theme.text }}
      >
        {page.musicUrl ? (
          <audio
            ref={audioRef}
            src={page.musicUrl}
            loop
            preload="none"
            onPause={() => setMusicOn(false)}
            onPlay={() => setMusicOn(true)}
          />
        ) : null}

        <div className="flex h-[58px] shrink-0 items-center justify-between gap-3 px-5">
          <div className="flex items-center gap-1.5" aria-label={`Langkah ${activeStep.order} dari 8`}>
            {Array.from({ length: 8 }, (_, index) => (
              <span
                key={index}
                aria-hidden="true"
                className={`size-3 rounded-full border-2 border-ink transition-colors ${
                  index < activeStep.order ? "bg-ink" : "bg-transparent"
                }`}
              />
            ))}
          </div>
          {page.musicUrl && activeStep.id !== "envelope" ? (
            <button
              type="button"
              onClick={toggleMusic}
              aria-pressed={musicOn}
              className="inline-flex h-[31px] items-center gap-1 rounded-xl border-[3px] border-ink bg-paper px-2.5 font-display text-[10px] uppercase text-ink shadow-[3px_3px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {musicOn ? <PauseIcon className="size-3" /> : <MusicIcon className="size-3" />}
              {musicOn ? "Nyala" : "Mati"}
            </button>
          ) : (
            <span className="w-[74px]" aria-hidden="true" />
          )}
        </div>

        <div key={activeStep.id} className="animate-pop-in flex min-h-0 flex-1 flex-col px-5 pb-6">
          {activeStep.id === "envelope" ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <span className="sticker -rotate-2 bg-lime px-3 py-1.5 text-[11px]">Ada titipan buat…</span>
              <h1 className="mt-5 max-w-full break-words font-display text-5xl uppercase leading-[0.95] tracking-[-0.03em]">
                {recipient}
              </h1>
              <button
                type="button"
                onClick={openEnvelope}
                aria-label="Ketuk amplop untuk membuka"
                className="group mt-7 w-full max-w-[288px] rounded-2xl focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                <span className="block animate-float-soft transition-transform duration-200 group-hover:-rotate-2 group-hover:scale-[1.03]">
                  <EnvelopeArt />
                </span>
              </button>
              <p className="mt-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em]">
                Ketuk amplopnya
                <ArrowRightIcon className="size-3.5 rotate-90" />
              </p>
            </div>
          ) : null}

          {activeStep.id === "greeting" ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <div
                aria-hidden="true"
                className="mb-7 grid size-24 -rotate-3 place-items-center rounded-2xl border-4 border-ink bg-lime shadow-[5px_5px_0_0_#111]"
              >
                <MomentIcon moment={page.moment} className="size-12" />
              </div>
              <GreetingCard moment={page.moment} recipient={recipient} sender={sender} dateLabel={getReaderDateLabel(page)} />
              <div className="mt-7 flex justify-center">
                <button type="button" onClick={goNext} className={`${actionClass} max-w-[133px]`}>
                  Buka <ArrowRightIcon className="size-4" />
                </button>
              </div>
            </div>
          ) : null}

          {activeStep.id === "story" ? (
            <StoryStep
              key={page.story ?? "story"}
              text={page.story}
              sender={sender}
              onComplete={goNext}
            />
          ) : null}

          {activeStep.id === "memories" ? (
            <div className="no-scrollbar flex min-h-0 flex-1 flex-col justify-center overflow-y-auto py-2">
              <PhotoReader
                photos={page.photoUrls.map((url, index) => ({
                  id: `${url}-${index}`,
                  url,
                  caption: `Kenangan ${index + 1}`,
                }))}
                onContinue={goNext}
              />
            </div>
          ) : null}

          {activeStep.id === "games" ? (
            <div className="min-h-0 flex-1 overflow-y-auto py-2">
              <MainBerduaPlayer
                games={page.games ?? []}
                photoUrls={page.photoUrls}
                recipientName={recipient}
                senderName={page.senderName}
                onComplete={goNext}
                embedded
              />
            </div>
          ) : null}

          {activeStep.id === "letter" ? (
            <LetterStep text={page.letter ?? ""} voiceUrl={page.voiceUrl ?? null} onContinue={goNext} />
          ) : null}

          {activeStep.id === "question" ? (
            <QuestionStep moment={page.moment} question={getReaderQuestion(page)} onAnswer={goNext} />
          ) : null}

          {activeStep.id === "closing" ? (
            <ClosingStep
              recipient={recipient}
              sender={sender}
              isExample={page.isExample}
              onRestart={restart}
            />
          ) : null}

          {musicNotice ? (
            <p role="status" className="mt-2 text-center text-[10px] font-bold leading-4">
              Musik belum bisa diputar di browser ini.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (embedded) return screen;

  return (
    <div className="relative min-h-svh overflow-x-hidden bg-lime text-ink">
      <div aria-hidden="true" className="bg-stripes pointer-events-none fixed inset-0" />
      <div className="relative">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-6xl justify-center px-3 py-5 sm:py-8">
          {screen}
        </main>
        <p className="pb-24 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">
          {moment.label} · dibuat dengan SuprizeGo
        </p>
      </div>
      {contactEmail ? <ReaderContact contactEmail={contactEmail} /> : null}
    </div>
  );
}

function GreetingCard({
  moment,
  recipient,
  sender,
  dateLabel,
}: {
  moment: SurprisePage["moment"];
  recipient: string;
  sender: string;
  dateLabel: string | null;
}) {
  return (
    <div className="relative w-full max-w-[250px] rounded-2xl border-4 border-ink bg-paper px-5 py-6 text-center text-ink shadow-[6px_6px_0_0_#111]">
      <span className="sticker absolute -top-5 left-1/2 -translate-x-1/2 -rotate-3 bg-candy px-3 py-1.5 text-[10px]">
        <MomentIcon moment={moment} className="size-4" />
        Buat kamu
      </span>
      <SparkleIcon className="absolute left-3 top-3 size-4 text-tangerine" />
      <SparkleIcon className="absolute right-3 top-4 size-3 text-candy" />
      <h1 className="mt-3 break-words font-display text-[2rem] uppercase leading-none tracking-[-0.03em]">
        Hai, {recipient}!
      </h1>
      <p className="mx-auto mt-4 max-w-[220px] text-[13px] font-bold leading-5">
        {sender} punya sesuatu buat kamu.
      </p>
      {dateLabel ? (
        <p className="mt-4 border-t-2 border-dashed border-ink/25 pt-3 text-[11px] font-bold leading-4 opacity-65">
          {dateLabel}
        </p>
      ) : null}
    </div>
  );
}

function StoryStep({
  text,
  sender,
  onComplete,
}: {
  text: string | null;
  sender: string;
  onComplete: () => void;
}) {
  const bubbles = useMemo(() => splitIntoBubbles(text), [text]);
  const [visible, setVisible] = useState(() => Math.min(2, bubbles.length));
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const latestRef = useRef<HTMLDivElement | null>(null);
  const last = visible >= bubbles.length;

  useEffect(() => {
    if (visible <= 1) return;
    const container = scrollRef.current;
    if (!container) return;
    window.requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      latestRef.current?.focus({ preventScroll: true });
    });
  }, [visible]);

  function readNext() {
    if (last) onComplete();
    else setVisible((current) => Math.min(current + 1, bubbles.length));
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h2 className="shrink-0 pb-3 font-display text-lg uppercase leading-6 tracking-[-0.01em]">
        Cerita dari {sender}
      </h2>
      <div
        ref={scrollRef}
        className="no-scrollbar min-h-[300px] max-h-[360px] space-y-3 overflow-y-auto overscroll-contain pb-3 pr-1"
        aria-live="polite"
      >
        {bubbles.slice(0, visible).map((bubble, index) => (
          <div
            key={`${index}-${bubble}`}
            ref={index === visible - 1 ? latestRef : undefined}
            data-story-bubble
            tabIndex={-1}
            className={`animate-pop-in break-words rounded-2xl border-4 border-ink px-3.5 py-3 text-[13px] font-bold leading-[1.55] text-ink shadow-[5px_5px_0_0_#111] focus:outline-none ${
              index % 2 === 0 ? "mr-7 bg-paper" : "ml-7 bg-lime"
            }`}
          >
            {bubble}
          </div>
        ))}
      </div>
      <div className="shrink-0 pt-3 text-center">
        <button type="button" onClick={readNext} className={`${actionClass} max-w-[214px]`}>
          {last ? "Selesai baca" : "Lanjut baca"}
          <ArrowRightIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}

function LetterStep({
  text,
  voiceUrl,
  onContinue,
}: {
  text: string;
  voiceUrl: string | null;
  onContinue: () => void;
}) {
  const bubbles = useMemo(() => splitIntoBubbles(text), [text]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 text-center">
        <span className="sticker -rotate-2 bg-candy px-3 py-1 text-[10px]">Surat untukmu</span>
        <h2 className="mt-3 font-display text-2xl uppercase leading-7">Baca pelan-pelan, ya</h2>
      </div>
      <div className="no-scrollbar mt-4 min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain pb-3 pr-1">
        {voiceUrl ? (
          <div className="rounded-2xl border-[3px] border-ink bg-lime p-3 shadow-[3px_3px_0_0_#111]">
            <p className="flex items-center gap-2 font-display text-[11px] uppercase">
              <MusicIcon className="size-4" /> Pesan suara
            </p>
            <audio src={voiceUrl} controls preload="none" className="mt-2 h-10 w-full" />
          </div>
        ) : null}
        {bubbles.map((bubble, index) => (
          <div
            key={`${index}-${bubble}`}
            data-letter-bubble
            className={`break-words rounded-2xl border-4 border-ink px-3.5 py-3 text-[12px] font-bold leading-[1.55] text-ink shadow-[5px_5px_0_0_#111] ${
              index % 2 === 0 ? "mr-5 bg-paper" : "ml-5 bg-lime"
            }`}
          >
            {bubble}
          </div>
        ))}
      </div>
      <div className="shrink-0 pt-3 text-center">
        <button type="button" onClick={onContinue} className={actionClass}>
          Lanjut <ArrowRightIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}

const AFFIRMATIVE: Record<SurprisePage["moment"], string> = {
  pengakuan: "Mau, dong!",
  "ulang-tahun": "Aku doain juga",
  anniversary: "Masih, selalu",
  "minta-maaf": "Aku maafkan",
  wisuda: "Bangga banget!",
};

function QuestionStep({
  moment,
  question,
  onAnswer,
}: {
  moment: SurprisePage["moment"];
  question: string;
  onAnswer: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <span className="sticker -rotate-2 bg-sun px-3 py-1.5 text-[10px]">Satu pertanyaan</span>
      <HeartIcon className="mt-7 size-14 text-tangerine" />
      <h2 className="mt-5 break-words font-display text-[1.9rem] uppercase leading-[1.05] tracking-[-0.02em]">
        {question}
      </h2>
      <div className="mt-8 w-full space-y-4">
        <button type="button" onClick={onAnswer} className={`${actionClass} max-w-none bg-lime text-ink shadow-[6px_6px_0_0_#111]`}>
          <HeartIcon className="size-4" />
          {AFFIRMATIVE[moment]}
        </button>
        <button
          type="button"
          onClick={onAnswer}
          className="flex min-h-11 w-full items-center justify-center rounded-xl border-[3px] border-ink bg-paper px-4 font-display text-xs uppercase text-ink shadow-[3px_3px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Butuh waktu
        </button>
      </div>
    </div>
  );
}

function ClosingStep({
  recipient,
  sender,
  isExample,
  onRestart,
}: {
  recipient: string;
  sender: string;
  isExample: boolean;
  onRestart: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="relative grid size-28 place-items-center rounded-full border-4 border-ink bg-candy shadow-[6px_6px_0_0_#111]">
        <HeartIcon className="size-14" />
        <SparkleIcon className="absolute -right-5 -top-2 size-7 text-sun" />
        <SparkleIcon className="absolute -left-6 bottom-2 size-5 text-paper" />
      </div>
      <h2 className="mt-7 break-words font-display text-[2rem] uppercase leading-[0.98] tracking-[-0.03em]">
        Sampai jumpa, {recipient}!
      </h2>
      <p className="mt-4 max-w-[240px] text-[13px] font-bold leading-5">
        Terima kasih sudah baca sampai sini. Ada banyak hal baik yang masih menunggu kalian.
      </p>
      <p className="mt-5 font-display text-sm uppercase">— {sender}</p>
      <div className="mt-7 w-full max-w-[230px] space-y-3">
        <Link
          href={isExample ? "/buat" : "/"}
          className={`${actionClass} max-w-none bg-lime text-ink shadow-[6px_6px_0_0_#111]`}
        >
          {isExample ? "Bikin versimu" : "Bikin kejutanmu"}
          <ArrowRightIcon className="size-4" />
        </Link>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-9 items-center gap-1.5 border-b-2 border-ink/50 text-[11px] font-bold uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          <PlayIcon className="size-3" /> Ulangi dari awal
        </button>
      </div>
    </div>
  );
}
