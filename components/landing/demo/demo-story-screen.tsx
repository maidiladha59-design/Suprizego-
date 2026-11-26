import { useState } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";
import { DEMO_STORY } from "@/lib/demo-flow";
import { DemoButton } from "./demo-controls";

export function DemoStoryScreen({ onComplete }: { onComplete: () => void }) {
  const bubbles = DEMO_STORY;
  const [visible, setVisible] = useState(1);
  const last = visible >= bubbles.length;

  function readNext() {
    if (last) {
      onComplete();
      return;
    }
    setVisible((current) => Math.min(current + 1, bubbles.length));
  }

  return (
    <div data-demo-screen="story" className="demo-rise flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-6">
      <div className="w-full">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider opacity-80">
          Cerita dari Bima
        </p>
        <div className="space-y-3" aria-live="polite">
          {bubbles.slice(0, visible).map((bubble, index) => (
            <div
              key={bubble}
              data-story-bubble
              className={`demo-rise flex max-w-[88%] rounded-2xl border-4 border-ink px-4 py-3 text-base font-bold leading-snug text-ink shadow-[5px_5px_0_0_#111] ${
                index % 2 === 0 ? "mr-auto bg-paper" : "ml-auto bg-lime"
              }`}
            >
              {bubble}
            </div>
          ))}
        </div>
        <DemoButton tone="ink" size="lg" onClick={readNext} className="mx-auto mt-8 block">
          {last ? "Selesai baca" : "Lanjut baca"}
          <ArrowRightIcon className="size-4" />
        </DemoButton>
      </div>
    </div>
  );
}
