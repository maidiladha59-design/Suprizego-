"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownIcon } from "@/components/ui/icons";
import {
  type DemoActivity,
  type DemoActivityKind,
  type DemoTheme,
} from "@/lib/demo-flow";
import { FLOW_PROGRESS, HERO_FLOW_STEPS } from "@/lib/flow";
import { FlowMusicButton, FlowProgress } from "@/components/surprise/flow-progress";
import { useFlowController } from "@/components/surprise/use-flow-controller";
import { DemoCoverScreen } from "./demo/demo-cover-screen";
import { DemoChatScreen } from "./demo/demo-chat-screen";
import { DemoFloatingContact } from "./demo/demo-floating-contact";
import {
  DemoAnswerScreen,
  DemoQuestionScreen,
} from "./demo/demo-question-screen";
import { DemoSenderPanel } from "./demo/demo-sender-panel";
import { DemoThemeControls } from "./demo/demo-controls";
import { DemoPhotoScreen } from "./demo-photo-screen";

export function HeroDemo({ contactEmail }: { contactEmail: string }) {
  const { activeId: stage, runId, goTo, restart } = useFlowController(HERO_FLOW_STEPS);
  const [theme, setTheme] = useState<DemoTheme>("pink");
  const [musicOn, setMusicOn] = useState(false);
  const [musicNotice, setMusicNotice] = useState(false);
  const [activities, setActivities] = useState<DemoActivity[]>([]);
  const [avoidAttempts, setAvoidAttempts] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activityId = useRef(0);
  const progress = FLOW_PROGRESS[stage];

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
    restart();
    setActivities([]);
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
    goTo("photo");
  }

  function answerYes() {
    const suffix = avoidAttempts > 0 ? ` (setelah ${avoidAttempts}x ngejar tombol Nggak)` : "";
    addActivity("yes", `Sekar jawab MAU${suffix}`);
    goTo("closing");
  }

  function renderScreen() {
    switch (stage) {
      case "envelope":
        return <DemoCoverScreen onOpen={openEnvelope} />;
      case "photo":
        return <DemoPhotoScreen onContinue={() => goTo("letter")} />;
      case "letter":
        return <DemoChatScreen onComplete={() => goTo("question")} />;
      case "question":
        return (
          <DemoQuestionScreen
            theme={theme}
            attempts={avoidAttempts}
            onAvoid={() => setAvoidAttempts((current) => current + 1)}
            onYes={answerYes}
          />
        );
      case "closing":
        return <DemoAnswerScreen onRestart={() => resetDemo()} />;
    }
  }

  const darkLetter = stage === "letter";

  return (
    <>
      <div className="animate-rise-late relative mx-auto w-full max-w-[340px] justify-self-center md:col-start-2 md:row-span-2 md:row-start-1 md:self-center">
        <div className="mb-3 text-center">
          <span
            className="sticker rotate-2 bg-white px-[11.2px] py-[3.2px] text-xs"
            style={{ display: "inline-block", fontWeight: 400, letterSpacing: "normal", lineHeight: "16px" }}
          >
            Ini beneran bisa dimainin <ArrowDownIcon className="inline size-4 align-[-2px]" />
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
            className={`relative flex h-full min-h-[628px] w-full flex-col overflow-hidden rounded-[28px] transition-colors duration-500 lg:overflow-y-auto ${
              darkLetter
                ? `bg-ink text-paper ${theme === "night" ? "demo-bg-grid" : ""}`
                : "demo-bg-dots bg-candy text-ink"
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

            <div
              className={`flex shrink-0 items-center justify-between gap-3 px-5 pr-4 ${
                stage === "envelope" ? "mb-4 mt-5 h-3" : "h-[58px]"
              }`}
            >
              <FlowProgress progress={progress} />
              {stage !== "envelope" ? (
                <FlowMusicButton musicOn={musicOn} onToggle={toggleMusic} label="musik demo" />
              ) : (
                <span className="w-[74px]" aria-hidden="true" />
              )}
            </div>

            <div
              key={`${runId}-${stage}`}
              className={`flex min-h-0 flex-1 flex-col ${stage === "envelope" ? "pb-10" : ""}`}
            >
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
