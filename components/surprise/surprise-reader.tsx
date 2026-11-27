"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { SiteHeader } from "@/components/site/site-header";
import { PhotoReader } from "@/components/editor/photo-reader";
import { EnvelopeArt } from "@/components/ui/envelope-art";
import {
  ArrowRightIcon,
  HeartIcon,
  MusicIcon,
  PlayIcon,
  SparkleIcon,
} from "@/components/ui/icons";
import { getAvoidPosition, getNegativeLabel } from "@/lib/demo-flow";
import { FLOW_PROGRESS, FLOW_STEP_IDS } from "@/lib/flow";
import { MAX_GAMES, getPlayableGames } from "@/lib/games";
import { getMoment } from "@/lib/moments";
import { getPlan } from "@/lib/plans";
import {
  getReaderDateLabel,
  getReaderQuestion,
  getReaderTheme,
  splitIntoBubbles,
} from "@/lib/reader";
import type { SurprisePage } from "@/lib/types";
import { FlowMusicButton, FlowProgress } from "./flow-progress";
import { MainBerduaPlayer } from "./main-berdua-player";
import { ReaderContact } from "./reader-contact";
import { useFlowController } from "./use-flow-controller";

type SurpriseReaderProps = {
  page: SurprisePage;
  contactEmail?: string;
  embedded?: boolean;
};

const actionClass =
  "inline-flex h-[59px] w-full max-w-[230px] items-center justify-center gap-2 rounded-2xl border-4 border-ink bg-ink px-4 font-display text-[13px] uppercase leading-5 tracking-[0.01em] text-paper shadow-[6px_6px_0_0_#B6F22E] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-lime active:translate-x-1 active:translate-y-1 active:shadow-none";

export function SurpriseReader({
  page,
  contactEmail,
  embedded = false,
}: SurpriseReaderProps) {
  const { activeId: activeStep, runId, goTo, next, restart } =
    useFlowController(FLOW_STEP_IDS);
  const [photoMode, setPhotoMode] = useState<"photos" | "games">("photos");
  const [gamesCompleted, setGamesCompleted] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [musicNotice, setMusicNotice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const moment = getMoment(page.moment);
  const theme = getReaderTheme(page);
  const progress = FLOW_PROGRESS[activeStep];
  const recipient = page.recipientName.trim() || "Kamu";
  const sender = page.senderName?.trim() || "Pembuat halaman";
  const playableGames = useMemo(
    () =>
      getPlayableGames(
        page.games ?? [],
        page.photoUrls.length,
        page.planId ? getPlan(page.planId).gameLimit : MAX_GAMES,
      ),
    [page.games, page.photoUrls.length, page.planId],
  );
  const hasGames = playableGames.length > 0;

  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

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

  function openEnvelope() {
    goTo("photo");
    if (page.musicUrl) void playMusic();
  }

  function continueFromPhotos() {
    if (hasGames && !gamesCompleted) setPhotoMode("games");
    else next();
  }

  function completeGames() {
    setGamesCompleted(true);
    next();
  }

  function restartReader() {
    restart();
    setPhotoMode("photos");
    setGamesCompleted(false);
    setMusicOn(false);
    setMusicNotice(false);
    audioRef.current?.pause();
  }

  const isDarkLetter = activeStep === "letter";
  const screenBackground = isDarkLetter
    ? "#111111"
    : activeStep === "photo"
      ? "#FF8FB8"
      : theme.screen;
  const screenText = isDarkLetter ? "#FFF4E0" : theme.text;

  const screen = (
    <div
      className="relative h-[640px] w-[340px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[38px] border-[6px] border-ink bg-ink shadow-[10px_10px_0_0_#111]"
      style={{ "--reader-screen": screenBackground } as CSSProperties}
    >
      <div
        data-reader-screen
        data-reader-step={activeStep}
        className="flex h-full flex-col overflow-hidden rounded-[28px] text-ink transition-colors duration-500"
        style={{ backgroundColor: screenBackground, color: screenText }}
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

        <div
          className={`flex h-[58px] shrink-0 items-center justify-between gap-3 px-5 ${
            activeStep === "envelope" ? "mt-3" : ""
          }`}
        >
          <FlowProgress progress={progress} />
          {page.musicUrl && activeStep !== "envelope" ? (
            <FlowMusicButton musicOn={musicOn} onToggle={toggleMusic} />
          ) : (
            <span className="w-[74px]" aria-hidden="true" />
          )}
        </div>

        <div
          key={`${runId}-${activeStep}`}
          className="animate-pop-in flex min-h-0 flex-1 flex-col px-5 pb-6"
        >
          {activeStep === "envelope" ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <span className="sticker -rotate-2 bg-lime px-3 py-1.5 text-[11px]">
                Ada titipan buat…
              </span>
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

          {activeStep === "photo" ? (
            <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto py-2">
              {hasGames ? (
                <div className="mb-3 flex shrink-0 justify-center gap-2" aria-label="Isi kenangan">
                  <button
                    type="button"
                    onClick={() => setPhotoMode("photos")}
                    aria-pressed={photoMode === "photos"}
                    className={`min-h-9 rounded-xl border-[3px] border-ink px-3 font-display text-[11px] uppercase shadow-[3px_3px_0_0_#111] ${
                      photoMode === "photos" ? "bg-lime text-ink" : "bg-paper text-ink"
                    }`}
                  >
                    Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoMode("games")}
                    aria-pressed={photoMode === "games"}
                    className={`min-h-9 rounded-xl border-[3px] border-ink px-3 font-display text-[11px] uppercase shadow-[3px_3px_0_0_#111] ${
                      photoMode === "games" ? "bg-lime text-ink" : "bg-paper text-ink"
                    }`}
                  >
                    Main Berdua
                  </button>
                </div>
              ) : null}

              {photoMode === "games" && hasGames ? (
                <MainBerduaPlayer
                  games={playableGames}
                  photoUrls={page.photoUrls}
                  recipientName={recipient}
                  senderName={page.senderName}
                  onComplete={completeGames}
                  embedded
                  gameLimit={page.planId ? getPlan(page.planId).gameLimit : undefined}
                />
              ) : page.photoUrls.length > 0 ? (
                <PhotoReader
                  photos={page.photoUrls.map((url, index) => ({
                    id: `${url}-${index}`,
                    url,
                    caption: `Kenangan ${index + 1}`,
                  }))}
                  onContinue={continueFromPhotos}
                  continueLabel={hasGames && !gamesCompleted ? "Main Berdua" : "Lanjut"}
                />
              ) : (
                <MemoryPlaceholder
                  onContinue={continueFromPhotos}
                  continueLabel={hasGames && !gamesCompleted ? "Main Berdua" : "Lanjut ke surat"}
                />
              )}
            </div>
          ) : null}

          {activeStep === "letter" ? (
            <ReaderLetterStep
              story={page.story}
              letter={page.letter}
              recipient={recipient}
              sender={sender}
              voiceUrl={page.voiceUrl ?? null}
              onContinue={next}
            />
          ) : null}

          {activeStep === "question" ? (
            <QuestionStep
              moment={page.moment}
              question={getReaderQuestion(page)}
              dateLabel={getReaderDateLabel(page)}
              onAnswer={next}
            />
          ) : null}

          {activeStep === "closing" ? (
            <ClosingStep
              recipient={recipient}
              sender={sender}
              isExample={page.isExample}
              onRestart={restartReader}
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
        <p className="pb-24 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-ink">
          {moment.label} · dibuat dengan SuprizeGo
        </p>
      </div>
      {contactEmail ? <ReaderContact contactEmail={contactEmail} /> : null}
    </div>
  );
}

function MemoryPlaceholder({
  onContinue,
  continueLabel,
}: {
  onContinue: () => void;
  continueLabel: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <span className="sticker -rotate-2 bg-lime px-3 py-1.5 text-[11px]">Ruang kenangan</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 240 250"
        className="mt-6 w-full max-w-[240px] drop-shadow-[7px_7px_0_#111]"
      >
        <rect x="18" y="12" width="204" height="222" rx="12" fill="#FFF4E0" stroke="#111" strokeWidth="5" />
        <rect x="35" y="32" width="170" height="150" rx="8" fill="#FF8FB8" stroke="#111" strokeWidth="4" />
        <path d="m57 155 53-57 39 39 27-25 31 43Z" fill="#B6F22E" stroke="#111" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="161" cy="70" r="17" fill="#FFF4E0" stroke="#111" strokeWidth="4" />
        <path d="m120 202-9-9a6 6 0 0 1 8-9l1 1 1-1a6 6 0 0 1 8 9Z" fill="#FF6A3D" stroke="#111" strokeWidth="2.5" />
      </svg>
      <p className="mt-6 max-w-[240px] text-[13px] font-bold leading-5 text-ink">
        Belum ada foto. Cerita di halaman ini tetap bisa dibaca.
      </p>
      <button type="button" onClick={onContinue} className={`${actionClass} mt-6`}>
        {continueLabel} <ArrowRightIcon className="size-4" />
      </button>
    </div>
  );
}

function ReaderLetterStep({
  story,
  letter,
  recipient,
  sender,
  voiceUrl,
  onContinue,
}: {
  story: string | null;
  letter: string | null;
  recipient: string;
  sender: string;
  voiceUrl: string | null;
  onContinue: () => void;
}) {
  const storyBubbles = useMemo(() => splitIntoBubbles(story), [story]);
  const fallbackLetter = `${recipient}, terima kasih sudah menjadi bagian dari cerita ini. Semoga setiap langkah berikutnya terasa lebih ringan. — ${sender}`;
  const letterBubbles = useMemo(
    () => splitIntoBubbles(letter?.trim() ? letter : fallbackLetter),
    [letter, fallbackLetter],
  );
  const [visible, setVisible] = useState(() => Math.min(2, storyBubbles.length));
  const [showLetter, setShowLetter] = useState(storyBubbles.length === 0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const readingStory = storyBubbles.length > 0 && !showLetter;
  const lastStory = visible >= storyBubbles.length;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const frame = window.requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [visible, showLetter]);

  function readNext() {
    if (!readingStory) {
      onContinue();
      return;
    }
    if (lastStory) setShowLetter(true);
    else setVisible((current) => Math.min(current + 1, storyBubbles.length));
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col text-cream">
      <div className="shrink-0 text-center">
        <span className="sticker -rotate-2 bg-candy px-3 py-1 text-[10px] text-ink">
          {readingStory ? "Cerita" : "Surat untukmu"}
        </span>
        <h2 className="mt-3 font-display text-2xl uppercase leading-7">
          {readingStory ? `Dari ${sender}` : `Untuk ${recipient}`}
        </h2>
      </div>
      <div
        ref={scrollRef}
        className="no-scrollbar mt-4 min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain pb-3 pr-1"
        aria-live="polite"
      >
        {readingStory
          ? storyBubbles.slice(0, visible).map((bubble, index) => (
              <div
                key={`${index}-${bubble}`}
                data-letter-bubble
                className={`animate-pop-in break-words rounded-2xl border-4 border-ink px-3.5 py-3 text-[12px] font-bold leading-[1.55] text-ink shadow-[5px_5px_0_0_#FF8FB8] ${
                  index % 2 === 0 ? "mr-5 bg-paper" : "ml-5 bg-lime"
                }`}
              >
                {bubble}
              </div>
            ))
          : null}
        {showLetter ? (
          <>
            {voiceUrl ? (
              <div className="rounded-2xl border-[3px] border-cream bg-paper p-3 text-ink shadow-[3px_3px_0_0_#FF8FB8]">
                <p className="flex items-center gap-2 font-display text-[11px] uppercase">
                  <MusicIcon className="size-4" /> Pesan suara
                </p>
                <audio src={voiceUrl} controls preload="none" className="mt-2 h-10 w-full" />
              </div>
            ) : null}
            {letterBubbles.map((bubble, index) => (
              <div
                key={`${index}-${bubble}`}
                data-letter-bubble
                className={`animate-pop-in break-words rounded-2xl border-4 border-ink px-3.5 py-3 text-[12px] font-bold leading-[1.55] text-ink shadow-[5px_5px_0_0_#FF8FB8] ${
                  index % 2 === 0 ? "mr-5 bg-paper" : "ml-5 bg-candy"
                }`}
              >
                {bubble}
              </div>
            ))}
          </>
        ) : null}
      </div>
      <div className="shrink-0 pt-3 text-center">
        <button
          type="button"
          onClick={readNext}
          className={`${actionClass} bg-lime text-ink shadow-[6px_6px_0_0_#FF8FB8]`}
        >
          {readingStory ? (lastStory ? "Buka surat" : "Lanjut baca") : "Lanjut"}
          <ArrowRightIcon className="size-4" />
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

const SECONDARY: Record<SurprisePage["moment"], string> = {
  pengakuan: "Butuh waktu",
  "ulang-tahun": "Simpan doanya",
  anniversary: "Butuh waktu",
  "minta-maaf": "Butuh waktu",
  wisuda: "Peluk aku",
};

function QuestionStep({
  moment,
  question,
  dateLabel,
  onAnswer,
}: {
  moment: SurprisePage["moment"];
  question: string;
  dateLabel: string | null;
  onAnswer: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [position, setPosition] = useState({ x: 130, y: 0 });

  function avoid() {
    setAttempts((current) => current + 1);
    const container = containerRef.current;
    if (!container) return;
    const nextPosition = getAvoidPosition(container.clientWidth);
    setPosition({
      x: Math.min(nextPosition.x, Math.max(0, container.clientWidth - 131)),
      y: nextPosition.y,
    });
  }

  return (
    <div className="no-scrollbar flex min-h-0 flex-1 flex-col items-center overflow-y-auto py-2 text-center">
      <span className="sticker -rotate-2 bg-sun px-3 py-1.5 text-[10px] text-ink">
        Satu pertanyaan
      </span>
      {moment === "ulang-tahun" ? <BirthdayCandles /> : <HeartIcon className="mt-6 size-12 text-tangerine" />}
      <div className="mt-4 w-full rounded-2xl border-4 border-ink bg-paper px-4 py-5 text-center text-ink shadow-[6px_6px_0_0_#111]">
        <h2 className="break-words font-display text-[1.7rem] uppercase leading-[1.05] tracking-[-0.02em]">
          {question}
        </h2>
        {dateLabel ? (
          <p className="mt-3 border-t-2 border-dashed border-ink pt-3 text-[11px] font-bold leading-4">
            {dateLabel}
          </p>
        ) : null}
        <div
          ref={containerRef}
          className={`relative mt-5 w-full ${moment === "pengakuan" ? "h-[144px]" : "space-y-3"}`}
        >
          <button
            type="button"
            onClick={onAnswer}
            className={`${actionClass} max-w-none bg-lime text-ink shadow-[6px_6px_0_0_#111]`}
          >
            <HeartIcon className="size-4" />
            {AFFIRMATIVE[moment]}
          </button>
          <button
            type="button"
            onClick={moment === "pengakuan" ? avoid : onAnswer}
            onPointerEnter={(event) => {
              if (moment === "pengakuan" && event.pointerType !== "touch") avoid();
            }}
            onPointerDown={moment === "pengakuan" ? avoid : undefined}
            onPointerUp={(event) => {
              if (moment === "pengakuan" && event.pointerType === "touch") avoid();
            }}
            className={`flex min-h-11 w-full items-center justify-center rounded-xl border-[3px] border-ink bg-paper px-4 font-display text-xs uppercase text-ink shadow-[3px_3px_0_0_#111] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink ${
              moment === "pengakuan"
                ? "absolute left-0 top-0 touch-none transition-all duration-200"
                : ""
            }`}
            style={
              moment === "pengakuan"
                ? { left: position.x, top: position.y, touchAction: "none" }
                : undefined
            }
          >
            {moment === "pengakuan" ? getNegativeLabel(attempts) : SECONDARY[moment]}
          </button>
        </div>
      </div>
    </div>
  );
}

function BirthdayCandles() {
  const [blown, setBlown] = useState(false);

  return (
    <div className="mt-5 text-center">
      <svg aria-hidden="true" viewBox="0 0 180 120" className="mx-auto h-[104px] w-[180px]">
        <path d="M28 85h124v25H28z" fill="#FF8FB8" stroke="#111" strokeWidth="4" />
        <path d="M28 85c14-18 32-18 46 0 18-22 38-22 54 0 10-12 20-12 24 0" fill="#FFF4E0" stroke="#111" strokeWidth="4" />
        <path d="M40 110h100" stroke="#111" strokeWidth="4" strokeLinecap="round" />
        {[62, 90, 118].map((x) => (
          <g key={x}>
            <rect x={x - 5} y="48" width="10" height="35" rx="2" fill="#B6F22E" stroke="#111" strokeWidth="3" />
            {blown ? (
              <path d={`M${x} 43c-9-8 7-11 0-20`} fill="none" stroke="#FFF4E0" strokeWidth="3" strokeLinecap="round" />
            ) : (
              <path
                d={`M${x} 46c-10-9 2-17 0-25 9 8 12 15 0 25Z`}
                fill="#FF6A3D"
                stroke="#111"
                strokeWidth="2.5"
                className="animate-float-soft"
              />
            )}
          </g>
        ))}
      </svg>
      <button
        type="button"
        onClick={() => setBlown(true)}
        disabled={blown}
        className="mt-2 min-h-9 rounded-xl border-[3px] border-ink bg-lime px-4 font-display text-[11px] uppercase text-ink shadow-[3px_3px_0_0_#111] disabled:cursor-default disabled:bg-paper"
      >
        {blown ? "Lilin sudah padam" : "Tiup lilin"}
      </button>
      <span className="sr-only" aria-live="polite">
        {blown ? "Lilin berhasil dipadamkan." : ""}
      </span>
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
      <div className="relative grid size-24 place-items-center rounded-full border-4 border-ink bg-candy shadow-[6px_6px_0_0_#111]">
        <HeartIcon className="size-12" />
        <SparkleIcon className="absolute -right-5 -top-2 size-7 text-sun" />
        <SparkleIcon className="absolute -left-6 bottom-2 size-5 text-paper" />
      </div>
      <h2 className="mt-6 break-words font-display text-[1.8rem] uppercase leading-[0.98] tracking-[-0.03em]">
        Sampai jumpa, {recipient}!
      </h2>
      <p className="mt-4 max-w-[240px] text-[13px] font-bold leading-5">
        Terima kasih sudah baca sampai sini. Ada banyak hal baik yang masih menunggu kalian.
      </p>
      <p className="mt-4 font-display text-sm uppercase">— {sender}</p>
      <div className="mt-6 w-full max-w-[230px] space-y-3">
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
