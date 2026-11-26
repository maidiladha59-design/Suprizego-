"use client";

import { useEffect, useRef, useState } from "react";
import { DemoPolaroidArt } from "./demo-polaroid-art";
import { ArrowRightIcon } from "@/components/ui/icons";

type Photo = {
  id: string;
  caption: string;
  scene: "beach" | "rain" | "city";
};

const PHOTOS: Photo[] = [
  { id: "pantai", caption: "Sore di pantai", scene: "beach" },
  { id: "halte", caption: "Hujan di halte", scene: "rain" },
  { id: "kota", caption: "Kota belum tidur", scene: "city" },
];

const TILTS = [0, -5, 5];

const actionClass =
  "inline-flex h-[42.39px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border-[3px] border-ink px-3 font-display text-[0.85rem] uppercase leading-[1.5] tracking-[0.01em] shadow-[4px_4px_0_0_#111] transition-[translate,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-x-1 active:translate-y-1 active:shadow-none";

export function DemoPhotoScreen({ onContinue }: { onContinue: () => void }) {
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [risingId, setRisingId] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const ordered = [...PHOTOS.slice(offset), ...PHOTOS.slice(0, offset)];
  const stack = ordered.slice(0, 3);

  function showNextPhoto() {
    if (swiping) return;

    const nextPhoto = PHOTOS[(offset + 1) % PHOTOS.length];
    if (!nextPhoto) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOffset((value) => (value + 1) % PHOTOS.length);
      setRisingId(null);
      return;
    }

    setRisingId(null);
    setSwiping(true);
    timer.current = window.setTimeout(() => {
      setOffset((value) => (value + 1) % PHOTOS.length);
      setRisingId(nextPhoto.id);
      setSwiping(false);
      timer.current = null;
    }, 320);
  }

  return (
    <div data-demo-screen="photo" className="flex h-full flex-col px-4 pb-6 pt-[22px] text-center">
      <p className="font-display text-2xl uppercase leading-8">Potongan hari</p>

      <div className="relative mx-auto mt-4 h-[348px] w-[280px] max-w-full">
        {stack.map((photo, index) => {
          const isTop = index === 0;
          const tilt = TILTS[index] ?? 0;
          const transform = isTop
            ? swiping
              ? "translateX(135%) rotate(18deg)"
              : "rotate(0deg)"
            : `rotate(${tilt}deg) translateY(${index * 9}px)`;

          return (
            <figure
              key={photo.id}
              data-photo-id={photo.id}
              data-top-photo={isTop}
              data-rising={risingId === photo.id}
              className={`demo-polaroid absolute inset-0 border-4 border-ink bg-white p-3 pb-4 shadow-[8px_8px_0_0_#111] ${
                risingId === photo.id ? "demo-polaroid__rising" : ""
              }`}
              style={{
                zIndex: 10 - index,
                transform,
                opacity: isTop && swiping ? 0 : 1,
              }}
            >
              <div className="h-[280px] w-full overflow-hidden rounded-md border-2 border-ink">
                <DemoPolaroidArt scene={photo.scene} />
              </div>
              <figcaption className="mt-2 truncate text-sm font-bold leading-6 text-ink">
                {photo.caption}
              </figcaption>
              {isTop ? (
                <button
                  type="button"
                  onClick={showNextPhoto}
                  disabled={swiping}
                  aria-label={`Geser foto: ${photo.caption}`}
                  className="absolute inset-0 rounded-[6px] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink"
                />
              ) : null}
            </figure>
          );
        })}
      </div>

      <div className="mt-7 flex items-center justify-center gap-3 max-[360px]:gap-2">
        <button
          type="button"
          onClick={showNextPhoto}
          disabled={swiping}
          className={`${actionClass} bg-paper text-ink max-[360px]:px-2 max-[360px]:text-xs`}
        >
          Foto berikutnya
        </button>
        <button
          type="button"
          onClick={onContinue}
          className={`${actionClass} bg-ink px-4 text-paper max-[360px]:px-3 max-[360px]:text-xs`}
        >
          Lanjut
          <ArrowRightIcon className="size-4" />
        </button>
      </div>

      <p className="mt-3 text-xs font-bold leading-4 opacity-70">ketuk foto untuk menggeser</p>
    </div>
  );
}
