"use client";

import { useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { ResetIcon } from "@/components/ui/icons";
import {
  getAvoidPosition,
  getNegativeLabel,
  type DemoTheme,
} from "@/lib/demo-flow";
import { DemoButton } from "./demo-controls";
import { DemoConfetti } from "./demo-confetti";

export function DemoQuestionScreen({
  attempts,
  onAvoid,
  onYes,
  theme,
}: {
  attempts: number;
  onAvoid: () => void;
  onYes: () => void;
  theme: DemoTheme;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x: 130, y: 0 });

  function avoid() {
    onAvoid();

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const max = Math.max(0, width - 131);
    const nextPosition = getAvoidPosition(width);

    setPosition({
      x: Math.min(nextPosition.x, max),
      y: nextPosition.y,
    });
  }

  return (
    <div
      data-demo-screen="question"
      className="demo-rise flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-6 text-center text-current"
    >
      <div className="demo-float">
        <Logo size={160} animated={false} />
      </div>
      <div className="mt-4 w-full max-w-[296px] rounded-[20px] border-4 border-ink bg-paper p-5 text-center text-ink shadow-[5px_5px_0_0_#111]">
        <h2 className="font-display text-3xl leading-tight">Mau jadi pacarku?</h2>
        <div
          ref={containerRef}
          className="relative mt-5 h-[144px] w-full text-left"
        >
          <DemoButton
            tone="lime"
            size="lg"
            onClick={onYes}
            className="h-[63px] min-w-[102px] px-5 text-lg"
          >
            Mau
          </DemoButton>
          <DemoButton
            tone={theme === "pink" ? "coral" : "pink"}
            size="lg"
            onPointerEnter={(event) => {
              if (event.pointerType !== "touch") avoid();
            }}
            onPointerDown={avoid}
            onPointerUp={(event) => {
              if (event.pointerType === "touch") avoid();
            }}
            onTouchEnd={avoid}
            onClick={(event) => {
              if (!(event.nativeEvent instanceof PointerEvent) || event.nativeEvent.pointerType !== "touch") avoid();
            }}
            className="absolute left-0 top-0 h-[63px] min-w-[131px] touch-none px-5 text-lg transition-all duration-200"
            style={{
              left: position.x,
              top: position.y,
              touchAction: "none",
              transition: "all 200ms",
            }}
          >
            {getNegativeLabel(attempts)}
          </DemoButton>
        </div>
      </div>
    </div>
  );
}

function DemoHeartMascot() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 56 56"
      className="block size-40"
    >
      <rect x="4" y="6" width="44" height="44" rx="11" fill="#111111" />
      <rect x="1.5" y="1.5" width="44" height="44" rx="11" fill="#B6F22E" stroke="#111111" strokeWidth="3" />
      <rect x="12" y="20" width="24" height="18" rx="3" fill="#FFF4E0" stroke="#111111" strokeWidth="2.5" />
      <path d="m12.8 22.2 9.1 6.2M35.2 22.2l-9.1 6.2" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
      <path d="M12.5 20.5 24 25.5 35.5 20.5Z" fill="#FF8FB8" stroke="#111111" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M20 31c-5-3-5-8 0-5 5-3 5 2 0 5ZM28 31c-5-3-5-8 0-5 5-3 5 2 0 5Z" fill="#FF8FB8" stroke="#111111" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M21 33.2c1.6 2.1 4.4 2.1 6 0" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DemoAnswerScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div
      data-demo-screen="closing"
      className="demo-rise relative flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-6 text-center text-current"
    >
      <DemoConfetti />
      <div className="demo-float relative">
        <DemoHeartMascot />
      </div>
      <div className="relative mt-4 w-full max-w-[296px] rounded-[20px] border-4 border-ink bg-paper p-5 text-center text-ink shadow-[5px_5px_0_0_#111]">
        <h2 className="font-display text-3xl leading-tight">Jawaban Sekar masuk</h2>
        <p className="demo-pop mt-4 font-bold">
          Bima bisa melihatnya di panel pengirim.
        </p>
      </div>
      <DemoButton tone="ink" size="lg" onClick={onRestart} className="demo-pop mt-6 w-[154px]">
        <ResetIcon className="size-4" /> Ulang
      </DemoButton>
    </div>
  );
}
