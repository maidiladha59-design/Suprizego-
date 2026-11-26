"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEMO_PROGRESS,
  type DemoActivity,
  type DemoActivityKind,
  type DemoStage,
  type DemoTheme,
} from "@/lib/demo-flow";
import { DemoCoverScreen } from "./demo/demo-cover-screen";
import {
  DemoDateScreen,
  DemoDateTicketScreen,
} from "./demo/demo-date-screen";
import { DemoFloatingContact } from "./demo/demo-floating-contact";
import { DemoGreetingScreen } from "./demo/demo-greeting-screen";
import { DemoLetterScreen } from "./demo/demo-letter-screen";
import { DemoMemoryCardScreen } from "./demo/demo-memory-card-screen";
import {
  DemoAnswerScreen,
  DemoQuestionScreen,
} from "./demo/demo-question-screen";
import {
  DemoQuizScoreScreen,
  DemoQuizScreen,
} from "./demo/demo-quiz-screen";
import { DemoSenderPanel } from "./demo/demo-sender-panel";
import { DemoStoryScreen } from "./demo/demo-story-screen";
import { DemoThemeControls } from "./demo/demo-controls";
import { DemoPhotoScreen } from "./demo-photo-screen";

export function HeroDemo({ contactEmail }: { contactEmail: string }) {
  const [stage, setStage] = useState<DemoStage>("cover");
  const [theme, setTheme] = useState<DemoTheme>("pink");
  const [runId, setRunId] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const [musicNotice, setMusicNotice] = useState(false);
  const [activities, setActivities] = useState<DemoActivity[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [avoidAttempts, setAvoidAttempts] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activityId = useRef(0);
  const progress = DEMO_PROGRESS[stage];

  useEffect(
    () => () => {
      audioRef.current?.pause();
    },
    [],
  );

  function addActivity(kind: DemoActivityKind, text: string) {
    activityId.current += 1;
    const activity = { id: activityId.current, kind, text };
    setActivities((current) => [...current, activity]);
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

  function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void playMusic();
    else {
      audio.pause();
      setMusicOn(false);
    }
  }

  function resetDemo(nextTheme: DemoTheme = theme) {
    setTheme(nextTheme);
    setStage("cover");
    setRunId((current) => current + 1);
    setActivities([]);
    setQuizScore(null);
    setSelectedDate("");
    setAvoidAttempts(0);
    setMusicOn(false);
    setMusicNotice(false);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  function openEnvelope() {
    void playMusic();
    addActivity("open", "Sekar membuka halamanmu");
    setStage("greeting");
  }

  function completeQuiz(score: number) {
    setQuizScore(score);
    addActivity("quiz", `Kuis Kenal Aku · ${score}/2 benar`);
    setStage("quiz-score");
  }

  function skipQuiz() {
    setQuizScore(null);
    setStage("date");
  }

  function selectDate(date: string) {
    setSelectedDate(date);
    addActivity("date", `Rencana Bareng · Pilih: ${date}`);
    setStage("date-ticket");
  }

  function skipDate() {
    setSelectedDate("");
    setStage("question");
  }

  function answerYes() {
    const suffix = avoidAttempts > 0 ? ` (setelah ${avoidAttempts}x ngejar tombol Nggak)` : "";
    addActivity("yes", `Sekar jawab MAU${suffix}`);
    setStage("answer");
  }

  function renderScreen() {
    switch (stage) {
      case "cover":
        return <DemoCoverScreen onOpen={openEnvelope} />;
      case "greeting":
        return <DemoGreetingScreen onContinue={() => setStage("story")} />;
      case "story":
        return <DemoStoryScreen onComplete={() => setStage("memories")} />;
      case "memories":
        return <DemoPhotoScreen onContinue={() => setStage("quiz")} />;
      case "quiz":
        return <DemoQuizScreen onComplete={completeQuiz} onSkip={skipQuiz} />;
      case "quiz-score":
        return <DemoQuizScoreScreen score={quizScore ?? 0} onContinue={() => setStage("date")} />;
      case "date":
        return <DemoDateScreen onSelect={selectDate} onSkip={skipDate} />;
      case "date-ticket":
        return <DemoDateTicketScreen date={selectedDate} onContinue={() => setStage("question")} />;
      case "question":
        return (
          <DemoQuestionScreen
            theme={theme}
            attempts={avoidAttempts}
            onAvoid={() => setAvoidAttempts((current) => current + 1)}
            onYes={answerYes}
          />
        );
      case "answer":
        return <DemoAnswerScreen onContinue={() => setStage("letter")} />;
      case "letter":
        return <DemoLetterScreen onContinue={() => setStage("memory")} />;
      case "memory":
        return <DemoMemoryCardScreen date={selectedDate} score={quizScore} />;
    }
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
          data-demo-stage={stage}
          data-demo-theme={theme}
          className="relative flex min-h-[640px] w-full flex-col overflow-hidden rounded-[38.4px] border-[6px] border-ink bg-ink shadow-[10px_10px_0_0_#111] lg:block lg:h-[640px] lg:min-h-0"
        >
          <div
            data-demo-surface
            className={`relative flex h-full min-h-[628px] w-full flex-col overflow-hidden rounded-[28px] lg:overflow-y-auto ${
              theme === "pink" ? "demo-bg-dots bg-candy text-ink" : "demo-bg-grid bg-ink text-paper"
            }`}
          >
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
                    className={`size-3 rounded-full border-2 border-current transition-colors ${
                      index < progress ? "bg-current" : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
              {stage !== "cover" ? (
                <button
                  type="button"
                  onClick={toggleMusic}
                  aria-pressed={musicOn}
                  aria-label={musicOn ? "Matikan musik demo" : "Nyalakan musik demo"}
                  className="inline-flex h-[31px] shrink-0 items-center gap-1 whitespace-nowrap rounded-xl border-[3px] border-ink bg-paper px-2.5 font-display text-[11px] uppercase leading-[1.5] text-ink shadow-[3px_3px_0_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  <span aria-hidden="true">♪</span>
                  {musicOn ? "Nyala" : "Mati"}
                </button>
              ) : (
                <span className="w-[74px]" aria-hidden="true" />
              )}
            </div>

            <div key={`${runId}-${stage}`} className="flex min-h-0 flex-1 flex-col">
              {renderScreen()}
            </div>

            {musicNotice ? (
              <p role="status" className="shrink-0 px-4 pb-2 text-center text-[10px] font-bold leading-4">
                Musik belum bisa diputar di browser ini.
              </p>
            ) : null}
          </div>
        </div>

        <DemoThemeControls
          theme={theme}
          onThemeChange={(nextTheme) => resetDemo(nextTheme)}
          onReset={() => resetDemo()}
        />
      </div>

      <DemoSenderPanel activities={activities} />
      <DemoFloatingContact contactEmail={contactEmail} />
    </>
  );
}
