"use client";

import { useMemo, useState } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";
import { splitIntoBubbles } from "@/lib/reader";
import { DemoButton } from "./demo-controls";

const CHAT_TEXT = [
  "Sekar, Bima simpan beberapa potongan hari yang nggak dia lupa.",
  "Sore di bukit, hujan di halte, dan bakso yang selalu habis sebelum obrolan selesai.",
  "Bima menyimpan semuanya bukan karena sempurna, tapi karena kamu ada di dalamnya.",
  "Sekarang Bima punya satu pertanyaan kecil buat kamu.",
] as const;

export function DemoChatScreen({ onComplete }: { onComplete: () => void }) {
  const bubbles = useMemo(() => CHAT_TEXT.flatMap((text) => splitIntoBubbles(text)), []);
  const [visible, setVisible] = useState(2);
  const last = visible >= bubbles.length;

  function readNext() {
    if (last) onComplete();
    else setVisible((current) => Math.min(current + 1, bubbles.length));
  }

  return (
    <div
      data-demo-screen="letter"
      className="demo-rise flex min-h-0 flex-1 flex-col px-4 pb-6 pt-5 text-paper"
    >
      <p className="shrink-0 text-center font-display text-xs uppercase tracking-[0.14em]">
        Surat dari Bima
      </p>
      <div
        className="no-scrollbar mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1"
        aria-live="polite"
      >
        {bubbles.slice(0, visible).map((bubble, index) => (
          <div
            key={`${index}-${bubble}`}
            data-chat-bubble
            className={`demo-rise max-w-[88%] break-words rounded-2xl border-4 border-ink px-4 py-3 text-[13px] font-bold leading-[1.55] text-ink shadow-[5px_5px_0_0_#FF8FB8] ${
              index % 2 === 0 ? "mr-auto bg-paper" : "ml-auto bg-lime"
            }`}
          >
            {bubble}
          </div>
        ))}
      </div>
      <div className="shrink-0 pt-4 text-center">
        <DemoButton tone="lime" size="lg" onClick={readNext} className="w-[214px]">
          {last ? "Selesai baca" : "Lanjut baca"}
          <ArrowRightIcon className="size-4" />
        </DemoButton>
      </div>
    </div>
  );
}
